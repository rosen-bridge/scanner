# Bitcoin Cash scanner

`BitcoinCashRpcNetwork` connects to BCHN RPC and rechecks the configured chain
and daemon identity on each call. It validates block references and exact raw
transaction bytes, retains CashToken metadata and bounds transaction, response
and aggregate block work. Missing raw bytes use block-qualified lookups.

`BitcoinCashRpcScanner` uses the shared general scanner under the distinct
`bitcoin-cash` identity. Configure an explicit `main`, `test` or `regtest`
network and independent operator endpoints. Unit tests mock the HTTP client.

Remote endpoints require HTTPS. HTTP is accepted only for literal IPv4 addresses
in `127.0.0.0/8` and IPv6 loopback `::1`; use the literal address for a local
daemon instead of `localhost`. URL credentials, fragments, ambiguous numeric
IPv4 aliases and redirects are rejected. Supply credentials in the separate
constructor argument. Each credential must contain 1–1,024 characters, without
control characters or surrounding whitespace; usernames cannot contain `:`.
The per-request timeout must be an integer from 1 to 300,000 milliseconds.

## Resource budgets and recovery

The optional fifth constructor argument is `Partial<BitcoinCashRpcLimits>`.
Every supplied value must be a positive safe integer within the following
implementation ceilings. Unknown keys are rejected.

| Resource                                  |    Default | Hard ceiling |
| ----------------------------------------- | ---------: | -----------: |
| `transactionBytes`                        |  1,000,000 |    8,000,000 |
| `transactionIO` (each input/output count) |      4,096 |      100,000 |
| `blockTransactions`                       |     10,000 |      250,000 |
| `blockTransactionBytes`                   | 32,000,000 |  128,000,000 |
| `responseBytes`                           | 64,000,000 |  256,000,000 |

These are operator work budgets, not BCH consensus limits. A valid block can
exceed them. The connector raises `BitcoinCashResourceLimitError`, with code
`BCH_RPC_RESOURCE_LIMIT`, `resource`, `limit` and, when available, `observed`.
It returns no partial block. Alert on this error; retries with the same budget
will continue to fail. Preserve the scanner checkpoint, qualify the same block
with a larger budget and sufficient process memory, then restart with that
configuration. Never advance the checkpoint to bypass the block.

For example, `{ transactionIO: 8192, blockTransactions: 20000 }` raises those
two budgets while retaining the remaining defaults. Raw byte identity, canonical
encoding and metadata validation still apply. Response size limits constrain
wire data; parsed JSON, hex strings, decoded transactions and returned metadata
can consume substantially more heap. The hard ceilings prevent unlimited
configuration but do not certify deployment memory capacity or full-chain
coverage. Qualify intended historical and large-block samples under the actual
memory limit before increasing a budget. If a required block exceeds a hard
ceiling, keep scanning stopped until a separately validated implementation
supports it.

## Finalization eligibility

Call `await network.assertFinalizedBlock(observedBlockHash, observedHeight)`
before a value-bearing action. The method rechecks the configured chain and BCHN
identity, requires a synchronized node, and checks that the exact observed block
and the node's finalized block are on the active chain. It rejects a parked
branch whose common ancestor precedes the observed block, even if that branch
is currently shorter. A parked branch whose common ancestor includes the
observed block is allowed. Unknown tip statuses, more than 1,024 tip records,
missing finalization, RPC errors and malformed responses reject the check.

The captured tip and finalized hash must remain unchanged across the sequence.
The method makes at most nine sequential RPC calls, with a shared 30-second
abort deadline in addition to the configured per-request timeout. Success is
never cached. The caller must repeat the check at each authorization boundary
and fail closed on rejection. The scanner's ordinary block reads do not call
this method automatically.

`BitcoinCashFinalityError.code` distinguishes `waiting-finalization`,
`node-unsynchronized`, `branch-disagreement`, `parked-fork`, `snapshot-changed`
and `invalid-evidence`. An uncovered event is a routine wait only when the
returned finalized header is otherwise structurally consistent. Transport,
authentication, daemon-identity and RPC-envelope failures may throw other
errors; consumers must treat these as failed evidence too. Never turn a
diagnostic classification into permission to proceed.

The witness role only needs the header/index RPCs above. A pruned primary
scanner additionally needs every block body in its scan and recovery range.
BCHN 29.2.0 defaults require a header known for 7,200 seconds and ten descendant
blocks; node uptime and the next connected block can delay finalization further.
This is an approximate two-hour minimum for a fresh deposit, not an exact ETA.

The native fixture builds its own pruned history and separately checks default
age/depth boundaries using simulated time. From this package directory in an
installed and built Scanner checkout:

```sh
node --import tsx scripts/bchn-witness-qualification.mjs <BCHN-29.2.0-bitcoind> . <new-output-directory>
```

It needs free loopback ports 29959 and 29960, and about 300 MiB of temporary
storage. The output directory must not exist. It preserves its evidence and
datadirs, disables wallets and peers, and stops its own nodes. The prune case
uses explicit regtest finalization; the separate latency cases keep the daemon's
default finalization policy. This does not qualify production endpoint
independence, automatic-pruning thresholds or full scanning history. Keep raw
receipts private because they identify the local runtime and file paths.

This policy uses trusted operator RPC observations, including BCHN's local
finalization decision. Separate RPC calls are not an atomic node snapshot;
matching beginning and ending values cannot exclude an intermediate change and
return. A successful check does not verify proof of work, a Merkle inclusion
proof or endpoint independence. The interface and parked-fork interpretation
follow [BCHN 29.2.0 RPC source](https://github.com/bitcoin-cash-node/bitcoin-cash-node/blob/07576013c91ff4a3a74acd85f189c69121cdad1b/src/rpc/blockchain.cpp).

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

The 5,000 ms timeout applies to each RPC request. The example uses the default
resource budgets above. Missing transaction hex causes sequential block-qualified
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
