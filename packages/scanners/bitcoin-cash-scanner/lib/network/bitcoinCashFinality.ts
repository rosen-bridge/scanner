import { isHash, isRecord, isUint } from './bitcoinCashValidation';

type Rpc = (method: string, params: unknown[]) => Promise<unknown>;

const statuses = new Set([
  'invalid',
  'parked',
  'headers-only',
  'valid-headers',
  'valid-fork',
  'active',
]);

/** Requires a synchronized node snapshot, without treating node metadata as a consensus proof. */
const synchronized = (info: Record<string, unknown>): void => {
  if (
    info.initialblockdownload !== false ||
    !isUint(info.blocks) ||
    info.headers !== info.blocks ||
    !isHash(info.bestblockhash)
  )
    throw Error('BCH RPC finality requires a synchronized node');
};

/**
 * Checks exact active ancestry and relevant parked forks against BCHN finalization.
 * Source: BCHN 29.2.0, commit 07576013c91ff4a3a74acd85f189c69121cdad1b,
 * src/rpc/blockchain.cpp. RPC observations are operator eligibility evidence.
 */
export const assertBitcoinCashFinalizedBlock = async (
  rpc: Rpc,
  info: Record<string, unknown>,
  blockHash: string,
  height: number,
): Promise<void> => {
  if (!isHash(blockHash) || !isUint(height))
    throw Error('Invalid BCH finality block reference');
  synchronized(info);
  const finalizedHash = await rpc('getfinalizedblockhash', []);
  if (!isHash(finalizedHash)) throw Error('Invalid BCH finalized block hash');
  const finalized = await rpc('getblockheader', [finalizedHash, true]);
  if (
    !isRecord(finalized) ||
    finalized.hash !== finalizedHash ||
    !isUint(finalized.height) ||
    finalized.height < height ||
    finalized.height > (info.blocks as number) ||
    !isUint(finalized.confirmations) ||
    finalized.confirmations !== (info.blocks as number) - finalized.height + 1
  )
    throw Error('BCH finalized header does not cover the observed block');
  if ((await rpc('getblockhash', [finalized.height])) !== finalizedHash)
    throw Error('BCH finalized block is not on the active chain');
  if ((await rpc('getblockhash', [height])) !== blockHash)
    throw Error('BCH observed block is not on the active chain');

  const tips = await rpc('getchaintips', []);
  if (!Array.isArray(tips) || tips.length < 1 || tips.length > 1024)
    throw Error('BCH RPC finality chain tips schema or limit exceeded');
  const seen = new Set<string>();
  let active = 0;
  for (const tip of tips) {
    if (
      !isRecord(tip) ||
      !isHash(tip.hash) ||
      seen.has(tip.hash) ||
      !isUint(tip.height) ||
      !isUint(tip.branchlen) ||
      tip.branchlen > tip.height ||
      typeof tip.status !== 'string' ||
      !statuses.has(tip.status)
    )
      throw Error('Invalid BCH RPC finality chain tip');
    seen.add(tip.hash);
    if (tip.status === 'active') {
      active++;
      if (
        tip.hash !== info.bestblockhash ||
        tip.height !== info.blocks ||
        tip.branchlen !== 0
      )
        throw Error('BCH RPC active tip does not match captured chain');
    }
    if (tip.status === 'parked' && tip.height - tip.branchlen < height)
      throw Error('BCH parked branch can replace the observed block');
  }
  if (active !== 1)
    throw Error('BCH RPC finality requires exactly one active tip');
  const end = await rpc('getblockchaininfo', []);
  if (!isRecord(end)) throw Error('Invalid BCH RPC finality ending snapshot');
  synchronized(end);
  if (
    end.chain !== info.chain ||
    end.bestblockhash !== info.bestblockhash ||
    end.blocks !== info.blocks
  )
    throw Error('BCH RPC chain changed during finality check');
  if ((await rpc('getfinalizedblockhash', [])) !== finalizedHash)
    throw Error('BCH RPC finalized block changed during finality check');
};
