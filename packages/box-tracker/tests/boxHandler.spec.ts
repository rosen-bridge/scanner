import { generateTracker, reduceTrack } from '../lib/boxHandler';
import { Token } from '../lib/interfaces';
import { mockBoxes } from './ergoBox.mock';

describe('generateTracker', () => {
  /**
   * @target generateTracker should return true when the address matches
   *         and all required tokens are present with sufficient amounts
   * @scenario
   * - call generateTracker with a matching address and token requirements
   * - run tracker function on a matching box
   * @expected
   * - should return true
   */
  it('should return true when the address matches and all required tokens are present with sufficient amounts', () => {
    const tokens: Token[] = [
      { tokenId: 'tokenA', amount: 10n },
      { tokenId: 'tokenB', amount: 10n },
    ];

    const tracker = generateTracker(
      '9hx5RVkqwazdGr2YPimSqzxnUPQZsqnJQ4PDEUV5W2S7rNkgash',
      tokens,
    );
    expect(tracker(mockBoxes[0])).toBe(true);
  });

  /**
   * @target generateTracker should return false when the address does not match
   * @scenario
   * - call generateTracker with an incorrect address
   * - run tracker function on a box
   * @expected
   * - should return false
   */
  it('should return false when the address does not match', () => {
    const tokens: Token[] = [{ tokenId: 'tokenA', amount: 10n }];
    const tracker = generateTracker(
      '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
      tokens,
    );

    expect(tracker(mockBoxes[0])).toBe(false);
  });

  /**
   * @target generateTracker should return false when a required token is missing
   * @scenario
   * - call generateTracker with a token list including a missing token
   * - run tracker function on a box
   * @expected
   * - should return false
   */
  it('should return false when a required token is missing', () => {
    const tokens: Token[] = [
      { tokenId: 'tokenA', amount: 10n },
      { tokenId: 'tokenC', amount: 5n },
    ];

    const tracker = generateTracker(
      '9hx5RVkqwazdGr2YPimSqzxnUPQZsqnJQ4PDEUV5W2S7rNkgash',
      tokens,
    );
    expect(tracker(mockBoxes[0])).toBe(false);
  });

  /**
   * @target generateTracker should return false when token amount is insufficient
   * @scenario
   * - call generateTracker with a higher amount than available
   * - run tracker function on a box
   * @expected
   * - should return false
   */
  it('should return false when token amount is insufficient', () => {
    const tokens: Token[] = [{ tokenId: 'tokenA', amount: 100n }];
    const tracker = generateTracker(
      '9hx5RVkqwazdGr2YPimSqzxnUPQZsqnJQ4PDEUV5W2S7rNkgash',
      tokens,
    );

    expect(tracker(mockBoxes[0])).toBe(false);
  });
});

describe('reduceTrack', () => {
  /**
   * @target reduceTrack should return the first unspent box
   * @scenario
   * - pass spentBoxIds including only the first box
   * @expected
   * - return the second box
   */
  it('should return the first unspent box', () => {
    const spent = ['box1'];
    const result = reduceTrack(mockBoxes, spent);

    expect(result).toEqual(mockBoxes[1]);
  });

  /**
   * @target reduceTrack should return undefined if all boxes are spent
   * @scenario
   * - pass spentBoxIds including all boxIds
   * @expected
   * - return undefined
   */
  it('should return undefined if all boxes are spent', () => {
    const spent = ['box1', 'box2'];
    const result = reduceTrack(mockBoxes, spent);

    expect(result).toBeUndefined();
  });

  /**
   * @target reduceTrack should return the first available box when no boxes are spent
   * @scenario
   * - pass an empty spentBoxIds array
   * @expected
   * - return the first box
   */
  it('should return the first available box when no boxes are spent', () => {
    const result = reduceTrack(mockBoxes, []);
    expect(result).toEqual(mockBoxes[0]);
  });
});
