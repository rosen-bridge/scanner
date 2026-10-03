import { assertBitcoinCashFinalizedBlock } from '../../lib/network/bitcoinCashFinality';
import { createFinalityRpc } from '../mocked/bitcoinCashFinality.mock';

describe('assertBitcoinCashFinalizedBlock', () => {
  let fixture: ReturnType<typeof createFinalityRpc>;
  beforeEach(() => {
    fixture = createFinalityRpc();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock accepts the exact tip-count resource boundary
   * @dependencies deterministic BCHN RPC fixture with unique known invalid tips
   * @scenario supply exactly 1024 schema-valid records including one active tip
   * @expected the finite ceiling is inclusive
   */
  it('accepts exactly 1024 distinct tip records', async () => {
    for (let index = 0; index < 1023; index++)
      (fixture.state.tips as unknown[]).push({
        hash: index.toString(16).padStart(64, '0'),
        height: 6,
        branchlen: 1,
        status: 'invalid',
      });
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).resolves.toBeUndefined();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock includes the finalized block itself
   * @dependencies deterministic BCHN RPC fixture
   * @scenario check the exact finalized block at height eight
   * @expected equality of observed and finalized height is accepted
   */
  it('accepts an observation at the exact finalized height', async () => {
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.finalized,
        8,
      ),
    ).resolves.toBeUndefined();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock requires a coherent confirmation count
   * @dependencies deterministic BCHN RPC fixture with all other fields unchanged
   * @scenario report 99 confirmations for height eight beneath the height-ten tip
   * @expected reject at the finalized header predicate instead of accepting positive counts
   */
  it('rejects positive confirmations inconsistent with the captured tip', async () => {
    (fixture.state.header as Record<string, unknown>).confirmations = 99;
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow('finalized header');
    expect(fixture.rpc.mock.calls).toHaveLength(2);
  });

  /**
   * @target assertBitcoinCashFinalizedBlock accepts stable exact ancestry
   * @dependencies deterministic BCHN RPC fixture
   * @scenario cover the event with finalized height eight and a stable height-ten tip
   * @expected all seven bounded reads use the exact hashes, heights and verbosity
   */
  it('checks exact observed and finalized active hashes in a stable snapshot', async () => {
    await assertBitcoinCashFinalizedBlock(
      fixture.rpc,
      fixture.info,
      fixture.hashes.observed,
      4,
    );
    expect(fixture.rpc.mock.calls).toEqual([
      ['getfinalizedblockhash', []],
      ['getblockheader', [fixture.hashes.finalized, true]],
      ['getblockhash', [8]],
      ['getblockhash', [4]],
      ['getchaintips', []],
      ['getblockchaininfo', []],
      ['getfinalizedblockhash', []],
    ]);
  });

  /**
   * @target assertBitcoinCashFinalizedBlock rejects malformed observed references before RPC
   * @dependencies deterministic BCHN RPC fixture
   * @scenario vary the observed hash and height independently
   * @expected every invalid reference is rejected with zero calls
   */
  it.each([
    ['bad', 4],
    ['AA'.repeat(32), 4],
    ['aa'.repeat(32), -1],
    ['aa'.repeat(32), 0.5],
    ['aa'.repeat(32), Number.MAX_SAFE_INTEGER + 1],
  ])('rejects reference %s at %s', async (hash, height) => {
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        hash as string,
        height as number,
      ),
    ).rejects.toThrow('reference');
    expect(fixture.rpc).not.toHaveBeenCalled();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock requires a synchronized captured node
   * @dependencies deterministic BCHN RPC fixture
   * @scenario mutate each synchronization field independently
   * @expected each malformed snapshot rejects before RPC
   */
  it.each([
    ['initialblockdownload', true],
    ['initialblockdownload', undefined],
    ['headers', 9],
    ['headers', undefined],
    ['blocks', -1],
    ['blocks', 1.5],
    ['bestblockhash', 'BAD'],
  ])('rejects captured %s=%s', async (key, value) => {
    fixture.info[key as string] = value;
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow('synchronized');
    expect(fixture.rpc).not.toHaveBeenCalled();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock requires available canonical finalization and active ancestry
   * @dependencies deterministic BCHN RPC fixture
   * @scenario independently corrupt finalization, header, ancestry or ending responses
   * @expected each isolated fault rejects the eligibility check
   */
  it.each([
    ['finalizedHash', null],
    ['finalizedHash', 'bad'],
    ['finalizedHash', 'BB'.repeat(32)],
    ['header', null],
    ['header', []],
    ['finalizedActiveHash', 'ee'.repeat(32)],
    ['observedActiveHash', 'ee'.repeat(32)],
    ['tips', null],
    ['tips', []],
    ['tips', Array(1025).fill({})],
    ['endingInfo', null],
    ['endingFinalizedHash', 'ee'.repeat(32)],
    ['endingFinalizedHash', null],
  ])('rejects %s response %j', async (key, value) => {
    fixture.state[key as string] = value;
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock validates each finalized header field
   * @dependencies deterministic BCHN RPC fixture
   * @scenario vary identity, height coverage and active confirmations independently
   * @expected every header fault rejects
   */
  it.each([
    ['hash', 'ee'.repeat(32)],
    ['height', undefined],
    ['height', -1],
    ['height', 3],
    ['height', 11],
    ['height', 4.5],
    ['confirmations', undefined],
    ['confirmations', 0],
    ['confirmations', -1],
    ['confirmations', 1.5],
    ['confirmations', Number.MAX_SAFE_INTEGER + 1],
  ])('rejects finalized header %s=%s', async (key, value) => {
    (fixture.state.header as Record<string, unknown>)[key as string] = value;
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow('header');
  });

  /**
   * @target assertBitcoinCashFinalizedBlock bounds and authenticates every tip record
   * @dependencies deterministic BCHN RPC fixture
   * @scenario add one independently malformed non-active tip to the valid active tip
   * @expected each malformed record rejects without trusting its status
   */
  it.each([
    ['hash', 'bad'],
    ['height', -1],
    ['height', 1.5],
    ['branchlen', -1],
    ['branchlen', 1.5],
    ['branchlen', 7],
    ['status', 'unknown'],
    ['status', undefined],
  ])('rejects additional tip %s=%s', async (key, value) => {
    const tip: Record<string, unknown> = {
      hash: fixture.hashes.parked,
      height: 6,
      branchlen: 1,
      status: 'valid-fork',
    };
    tip[key as string] = value;
    (fixture.state.tips as unknown[]).push(tip);
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow('chain tip');
  });

  /**
   * @target assertBitcoinCashFinalizedBlock requires one active tip matching captured state
   * @dependencies deterministic BCHN RPC fixture
   * @scenario alter each active-tip binding or remove active status
   * @expected every mismatch rejects
   */
  it.each([
    ['hash', 'ee'.repeat(32)],
    ['height', 9],
    ['branchlen', 1],
    ['status', 'valid-fork'],
  ])('rejects active tip %s=%s', async (key, value) => {
    (fixture.state.tips as Record<string, unknown>[])[0][key as string] = value;
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock rejects duplicate tip identity
   * @dependencies deterministic BCHN RPC fixture
   * @scenario duplicate a valid active tip
   * @expected duplicate identity cannot create multiple accepted active tips
   */
  it('rejects duplicate active tips', async () => {
    (fixture.state.tips as unknown[]).push(
      structuredClone((fixture.state.tips as unknown[])[0]),
    );
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow('chain tip');
  });

  /**
   * @target assertBitcoinCashFinalizedBlock rejects parked branches that can replace the event
   * @dependencies deterministic BCHN RPC fixture
   * @scenario test a shorter, equal and longer parked branch with fork height three
   * @expected every relevant parked fork rejects regardless of present branch length
   */
  it.each([6, 10, 12])(
    'rejects relevant parked branch at height %s',
    async (height) => {
      (fixture.state.tips as unknown[]).push({
        hash: fixture.hashes.parked,
        height,
        branchlen: height - 3,
        status: 'parked',
      });
      await expect(
        assertBitcoinCashFinalizedBlock(
          fixture.rpc,
          fixture.info,
          fixture.hashes.observed,
          4,
        ),
      ).rejects.toThrow('parked');
    },
  );

  /**
   * @target assertBitcoinCashFinalizedBlock admits branches whose common ancestor includes the event
   * @dependencies deterministic BCHN RPC fixture
   * @scenario test exact event fork boundary, later parked fork and known non-parked statuses
   * @expected safe parked fork boundaries and documented non-parked statuses are accepted
   */
  it.each([
    ['parked', 4],
    ['parked', 5],
    ['invalid', 3],
    ['headers-only', 3],
    ['valid-headers', 3],
    ['valid-fork', 3],
  ])('accepts %s fork at %s', async (status, fork) => {
    (fixture.state.tips as unknown[]).push({
      hash: fixture.hashes.parked,
      height: 6,
      branchlen: 6 - Number(fork),
      status,
    });
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).resolves.toBeUndefined();
  });

  /**
   * @target assertBitcoinCashFinalizedBlock rejects drift in the ending snapshot
   * @dependencies deterministic BCHN RPC fixture
   * @scenario change identity, best hash, synchronization or synchronized height at the final read
   * @expected no stale success is returned
   */
  it.each([
    'chain',
    'bestblockhash',
    'initialblockdownload',
    'headers',
    'blocks',
  ])('rejects ending %s drift', async (key) => {
    const end = fixture.state.endingInfo as Record<string, unknown>;
    end[key] =
      key === 'chain'
        ? 'main'
        : key === 'bestblockhash'
          ? 'ee'.repeat(32)
          : key === 'initialblockdownload'
            ? true
            : 11;
    if (key === 'blocks') end.headers = 11;
    await expect(
      assertBitcoinCashFinalizedBlock(
        fixture.rpc,
        fixture.info,
        fixture.hashes.observed,
        4,
      ),
    ).rejects.toThrow();
  });
});
