import { vi } from 'vitest';

/** Creates independent synthetic BCHN finalization snapshots and a bounded RPC seam. */
export const createFinalityRpc = () => {
  const hashes = {
    observed: 'aa'.repeat(32),
    finalized: 'bb'.repeat(32),
    tip: 'cc'.repeat(32),
    parked: 'dd'.repeat(32),
  };
  const info: Record<string, unknown> = {
    chain: 'regtest',
    blocks: 10,
    headers: 10,
    bestblockhash: hashes.tip,
    initialblockdownload: false,
  };
  const state: Record<string, unknown> = {
    finalizedHash: hashes.finalized,
    endingFinalizedHash: hashes.finalized,
    header: { hash: hashes.finalized, height: 8, confirmations: 3 },
    finalizedActiveHash: hashes.finalized,
    observedActiveHash: hashes.observed,
    tips: [{ hash: hashes.tip, height: 10, branchlen: 0, status: 'active' }],
    endingInfo: structuredClone(info),
  };
  let finalizationReads = 0;
  const rpc = vi.fn(
    async (method: string, params: unknown[]): Promise<unknown> => {
      switch (method) {
        case 'getfinalizedblockhash':
          return finalizationReads++ === 0
            ? state.finalizedHash
            : state.endingFinalizedHash;
        case 'getblockheader':
          return state.header;
        case 'getblockhash':
          return params[0] === 8
            ? state.finalizedActiveHash
            : state.observedActiveHash;
        case 'getchaintips':
          return state.tips;
        case 'getblockchaininfo':
          return state.endingInfo;
        default:
          throw Error('Unexpected fixture RPC');
      }
    },
  );
  return { hashes, info, state, rpc };
};
