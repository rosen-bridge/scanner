import { isIP } from 'net';

/** Validates optional HTTP Basic credentials without exposing their content. */
export const validateBitcoinCashRpcCredentials = (auth?: {
  username: string;
  password: string;
}): void => {
  if (
    auth !== undefined &&
    (!auth ||
      [auth.username, auth.password].some(
        (part) =>
          typeof part !== 'string' ||
          !part.length ||
          part.length > 1024 ||
          part !== part.trim() ||
          [...part].some(
            (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
          ),
      ) ||
      auth.username.includes(':'))
  )
    throw Error(
      'BCH RPC credentials must be a valid bounded username/password pair',
    );
};

/** Validates RPC transport before an HTTP client can attach credentials. */
export const validateBitcoinCashRpcUrl = (url: string): string => {
  if (
    typeof url !== 'string' ||
    /[\s\\]/.test(url) ||
    [...url].some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    )
  )
    throw Error('Invalid BCH RPC endpoint URL');
  const authority = /^[a-z][a-z\d+.-]*:\/\/([^/?#]+)/i.exec(url)?.[1];
  if (!authority || authority.includes('@') || url.includes('#'))
    throw Error('BCH RPC URL must not contain userinfo or fragments');
  let endpoint: URL;
  try {
    endpoint = new URL(url);
  } catch {
    throw Error('Invalid BCH RPC endpoint URL');
  }
  const rawHost = authority.startsWith('[')
    ? authority.slice(1, authority.indexOf(']'))
    : authority.split(':')[0];
  const loopback =
    (isIP(rawHost) === 4 && rawHost.startsWith('127.')) ||
    (isIP(rawHost) === 6 && endpoint.hostname === '[::1]');
  if (
    endpoint.protocol !== 'https:' &&
    !(endpoint.protocol === 'http:' && loopback)
  )
    throw Error('BCH RPC requires HTTPS or literal loopback HTTP');
  return endpoint.href;
};

/** Local resource budgets; these values do not define BCH consensus validity. */
export interface BitcoinCashRpcLimits {
  transactionBytes: number;
  transactionIO: number;
  blockTransactions: number;
  blockTransactionBytes: number;
  responseBytes: number;
}

export const BITCOIN_CASH_RPC_LIMITS: Readonly<BitcoinCashRpcLimits> =
  Object.freeze({
    transactionBytes: 1_000_000,
    transactionIO: 4096,
    blockTransactions: 10000,
    blockTransactionBytes: 32_000_000,
    responseBytes: 64_000_000,
  });

/** Finite implementation guardrails; deployment memory must be qualified separately. */
export const BITCOIN_CASH_RPC_HARD_LIMITS: Readonly<BitcoinCashRpcLimits> =
  Object.freeze({
    transactionBytes: 8_000_000,
    transactionIO: 100_000,
    blockTransactions: 250_000,
    blockTransactionBytes: 128_000_000,
    responseBytes: 256_000_000,
  });

/** Resolves explicitly configured positive safe-integer limits, rejecting unknown keys. */
export const resolveBitcoinCashRpcLimits = (
  overrides: Partial<BitcoinCashRpcLimits> = {},
): Readonly<BitcoinCashRpcLimits> => {
  if (
    typeof overrides !== 'object' ||
    overrides === null ||
    Array.isArray(overrides)
  )
    throw Error('Invalid BCH RPC resource limits');
  const result = { ...BITCOIN_CASH_RPC_LIMITS };
  for (const [key, value] of Object.entries(overrides)) {
    if (
      !Object.hasOwn(result, key) ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > BITCOIN_CASH_RPC_HARD_LIMITS[key as keyof BitcoinCashRpcLimits]
    )
      throw Error('Invalid BCH RPC resource limit');
    result[key as keyof BitcoinCashRpcLimits] = value;
  }
  return Object.freeze(result);
};

/** Signals operator recovery, distinct from a malformed or unauthenticated block. */
export class BitcoinCashResourceLimitError extends Error {
  readonly code = 'BCH_RPC_RESOURCE_LIMIT';
  constructor(
    readonly resource: keyof BitcoinCashRpcLimits,
    readonly limit: number,
    readonly observed?: number,
  ) {
    super(
      `BCH RPC resource limit exceeded: ${resource} (limit ${limit}). Qualify a larger bounded budget and restart at the unchanged block; never skip the block.`,
    );
    this.name = 'BitcoinCashResourceLimitError';
  }
}

/** Checks work before decoding, allocating further metadata, or fetching another transaction. */
export const checkBitcoinCashRpcLimit = (
  limits: Readonly<BitcoinCashRpcLimits>,
  resource: keyof BitcoinCashRpcLimits,
  observed: number,
): void => {
  if (observed > limits[resource])
    throw new BitcoinCashResourceLimitError(
      resource,
      limits[resource],
      observed,
    );
};
