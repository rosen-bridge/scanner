# Bitcoin Cash scanner

`BitcoinCashRpcNetwork` connects to BCHN RPC and rechecks the configured chain
and daemon identity on each call. It validates block references and exact raw
transaction bytes, retains CashToken metadata and bounds transaction, response
and aggregate block work. Missing raw bytes use block-qualified lookups.

`BitcoinCashRpcScanner` uses the shared general scanner under the distinct
`bitcoin-cash` identity. Configure an explicit `main`, `test` or `regtest`
network and independent operator endpoints. Unit tests mock the HTTP client.

## Read-only endpoint qualification

Qualify each operator-selected endpoint separately. Keep its URL, credentials,
sample height, expected block hash and known transaction ID in private operator
configuration. Choose a confirmed transaction in that exact block, including a
block near the intended historical starting height. Run this TypeScript example
with the installed package and the deployment's TypeScript runner after loading
the private environment variables below:

```typescript
import { BitcoinCashRpcNetwork } from '@rosen-bridge/bitcoin-cash-scanner';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw Error('Missing qualification input');
  return value;
};
let stage = 'configuration';
try {
  const chain = required('BCH_QUALIFY_CHAIN');
  if (chain !== 'main' && chain !== 'test' && chain !== 'regtest')
    throw Error('Invalid chain');
  const height = Number(required('BCH_QUALIFY_HEIGHT'));
  const expectedHash = required('BCH_QUALIFY_BLOCK_HASH');
  const transactionId = required('BCH_QUALIFY_TRANSACTION_ID');
  if (
    !Number.isSafeInteger(height) ||
    height < 0 ||
    !/^[0-9a-f]{64}$/.test(expectedHash) ||
    !/^[0-9a-f]{64}$/.test(transactionId)
  )
    throw Error('Invalid sample');
  const network = new BitcoinCashRpcNetwork(
    required('BCH_QUALIFY_RPC_URL'),
    5_000,
    chain,
    {
      username: required('BCH_QUALIFY_RPC_USERNAME'),
      password: required('BCH_QUALIFY_RPC_PASSWORD'),
    },
  );
  stage = 'identity';
  if ((await network.getCurrentHeight()) < height)
    throw Error('Sample above tip');
  stage = 'header';
  const block = await network.getBlockAtHeight(height);
  if (block.hash !== expectedHash) throw Error('Unexpected block');
  stage = 'block_transactions';
  const transactions = await network.getBlockTxs(expectedHash, height);
  if (
    transactions.length !== block.txCount ||
    !transactions.some((transaction) => transaction.txid === transactionId)
  )
    throw Error('Sample transaction absent');
  console.log(JSON.stringify({ status: 'passed', checks: 3 }));
} catch {
  console.log(JSON.stringify({ status: 'failed', stage }));
  process.exitCode = 1;
}
```

The three calls recheck BCHN daemon and configured chain identity. They read the
tip, the requested header and `getblock(expectedHash, 2)`, then authenticate every
returned transaction against its raw bytes. The example prints fixed status
fields; keep detailed RPC diagnostics private and omit credentials, sample IDs
and raw transaction bytes from shared results. A passed result covers that sample
on that endpoint. It does not verify proof of work or chain finality.

The 5,000 ms timeout applies to each RPC request. Fixed connector limits are
64,000,000 response bytes, 10,000 transactions per block, 1,000,000 raw bytes per
transaction, 4,096 inputs and outputs each, and 32,000,000 aggregate transaction
bytes per block. Missing transaction hex causes sequential block-qualified
`getrawtransaction` requests, at most one per transaction. This example can make
9 plus the number of missing-hex requests, at most 10,009 RPC requests; it has no
shared request budget, whole-run deadline or cancellation API. Select a small
sample block and, where a total deadline is needed, run it in a dedicated process
under an external supervisor that stops the process on expiry.

Record the verbosity-2 block-body read as observed only after the live sample
passes. Record the fallback path separately: it is exercised only when the
endpoint omits transaction hex and the corresponding block-qualified raw reads
succeed. If no selected live sample needs that fallback, leave it unexercised.
Use private endpoint diagnostics to distinguish these paths.

Verify pruning, historical block-body availability and rescan coverage across
the intended starting range separately; a single old block does not establish
complete history. Independent URLs and matching tips do not establish independent
infrastructure. Retain each deployment's operator evidence with the coordinating
Bitcoin Cash integration profile. Guard wallet/history capability qualification
is a separate procedure. This example imports no wallet, signs no transaction
and submits nothing.
