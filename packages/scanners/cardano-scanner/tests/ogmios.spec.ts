import { InteractionContext } from '@cardano-ogmios/client';
import { findIntersection } from '@cardano-ogmios/client/dist/ChainSynchronization';

import { DataSource } from '@rosen-bridge/extended-typeorm';

import { CardanoOgmiosScanner } from '../lib/scanner/ogmios';

vi.mock('@cardano-ogmios/client/dist/ChainSynchronization', () => ({
  findIntersection: vi.fn(),
}));

const mockFindIntersection = vi.mocked(findIntersection);

/**
 * race a promise against a short timeout so a stuck mutex fails the test
 * quickly instead of hanging the suite
 */
const withTimeout = async <T>(promise: Promise<T>, ms = 2000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error('timed out: the scanner mutex was not released')),
        ms,
      ),
    ),
  ]);

const createScanner = () =>
  new CardanoOgmiosScanner({
    nodeHostOrIp: '127.0.0.1',
    nodePort: 1337,
    initialSlot: 0,
    initialHash: 'initial-hash',
    dataSource: {
      getRepository: () => ({}),
    } as unknown as DataSource,
    blockCleanupConfig: undefined,
  });

const savedBlocks = [
  { hash: 'hash-a', height: 10, extra: '100' },
  { hash: 'hash-b', height: 9, extra: '90' },
];

describe('CardanoOgmiosScanner.findIntersection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindIntersection.mockResolvedValue({
      intersection: { slot: 90, id: 'hash-b' },
    } as Awaited<ReturnType<typeof findIntersection>>);
  });

  /**
   * @target `findIntersection` should release the mutex when reading the
   * saved blocks fails, so the widened retry pass can proceed
   * @scenario
   * - mock `getLastSavedBlocks` to throw on the first call and return two
   *   blocks on the second
   * - mock ogmios `findIntersection` to intersect at the second block
   * - run the scanner `findIntersection`
   * @expected
   * - it should retry with the widened search and return the intersection
   *   instead of deadlocking on the mutex it still holds
   */
  it('should release the mutex when the database read fails and retry', async () => {
    const scanner = createScanner();
    const getLastSavedBlocks = vi
      .fn()
      .mockRejectedValueOnce(new Error('database hiccup'))
      .mockResolvedValue(savedBlocks);
    scanner.action = { getLastSavedBlocks } as never;

    const result = await withTimeout(
      scanner['findIntersection']({} as InteractionContext),
    );

    expect(getLastSavedBlocks).toHaveBeenCalledTimes(2);
    expect(getLastSavedBlocks).toHaveBeenNthCalledWith(1, 0, 1);
    expect(getLastSavedBlocks).toHaveBeenNthCalledWith(2, 1, 2);
    expect(result).toEqual({
      point: { slot: 90, id: 'hash-b' },
      height: 9,
    });
  });

  /**
   * @target `findIntersection` should return the height of the block the
   * intersection actually points to
   * @scenario
   * - mock `getLastSavedBlocks` to return two blocks
   * - mock ogmios `findIntersection` to intersect at the second (older) block
   * - run the scanner `findIntersection`
   * @expected
   * - it should return the older block's height
   * - it should not modify the saved blocks' hashes
   */
  it('should return the height of the intersecting block without modifying the saved blocks', async () => {
    const scanner = createScanner();
    const blocks = savedBlocks.map((block) => ({ ...block }));
    scanner.action = {
      getLastSavedBlocks: vi.fn().mockResolvedValue(blocks),
    } as never;

    const result = await scanner['findIntersection']({} as InteractionContext);

    expect(result).toEqual({
      point: { slot: 90, id: 'hash-b' },
      height: 9,
    });
    expect(blocks[0].hash).toEqual('hash-a');
    expect(blocks[1].hash).toEqual('hash-b');
  });

  /**
   * @target `findIntersection` should leave the mutex free after it returns
   * @scenario
   * - mock `getLastSavedBlocks` to return two blocks
   * - run the scanner `findIntersection`
   * - acquire the scanner mutex
   * @expected
   * - the mutex should be acquired immediately
   */
  it('should leave the mutex free after a successful run', async () => {
    const scanner = createScanner();
    scanner.action = {
      getLastSavedBlocks: vi.fn().mockResolvedValue(savedBlocks),
    } as never;

    await scanner['findIntersection']({} as InteractionContext);

    const release = await withTimeout(scanner['mutex'].acquire());
    expect(release).toBeTypeOf('function');
    release();
  });
});
