import { generateTracker, reduceTrack } from '../lib/boxHandlers';
import { Token } from '../lib/config';
import { mockBoxes } from './ergoBox.mock';

describe('generateTracker', () => {
  /**
   * @target generateTracker should return true when the address matches
   *         and all required tokens are present with sufficient amounts
   * @dependencies
   * - mockBoxes with predefined ErgoBox data
   * @scenario
   * - call generateTracker with a matching address and token requirements
   * - run tracker function on a matching box
   * @expected
   * - should return true
   */
  it('should returns true when address matches and all tokens are present with sufficient amount', () => {
    const tokens: Token[] = [
      { tokenId: 'tokenA', amount: 10n },
      { tokenId: 'tokenB', amount: 10n },
    ];

    const tracker = generateTracker('address1', tokens);
    expect(tracker(mockBoxes[0])).toBe(true);
  });

  /**
   * @target generateTracker should return false when the address does not match
   * @dependencies
   * - mockBoxes with predefined ErgoBox data
   * @scenario
   * - call generateTracker with an incorrect address
   * - run tracker function on a box
   * @expected
   * - should return false
   */
  it('should returns false when address does not match', () => {
    const tokens: Token[] = [{ tokenId: 'tokenA', amount: 10n }];
    const tracker = generateTracker('wrongAddress', tokens);

    expect(tracker(mockBoxes[0])).toBe(false);
  });

  /**
   * @target generateTracker should return false when a required token is missing
   * @dependencies
   * - mockBoxes with predefined ErgoBox data
   * @scenario
   * - call generateTracker with a token list including a missing token
   * - run tracker function on a box
   * @expected
   * - should return false
   */
  it('should returns false when a token is missing', () => {
    const tokens: Token[] = [
      { tokenId: 'tokenA', amount: 10n },
      { tokenId: 'tokenC', amount: 5n },
    ];

    const tracker = generateTracker('address1', tokens);
    expect(tracker(mockBoxes[0])).toBe(false);
  });

  /**
   * @target generateTracker should return false when token amount is insufficient
   * @dependencies
   * - mockBoxes with predefined ErgoBox data
   * @scenario
   * - call generateTracker with a higher amount than available
   * - run tracker function on a box
   * @expected
   * - should return false
   */
  it('should returns false when token amount is insufficient', () => {
    const tokens: Token[] = [{ tokenId: 'tokenA', amount: 100n }];
    const tracker = generateTracker('address1', tokens);

    expect(tracker(mockBoxes[0])).toBe(false);
  });
});

describe('reduceTrack', () => {
  /**
   * @target reduceTrack should return the first unspent box
   * @dependencies
   * - mockBoxes with predefined ErgoBox data
   * @scenario
   * - pass spentBoxIds including only the first box
   * @expected
   * - return the second box
   */
  it('should returns the first box not in spentBoxIds', () => {
    const spent = ['box1'];
    const result = reduceTrack(mockBoxes, spent);

    expect(result).toEqual(mockBoxes[1]);
  });

  /**
   * @target reduceTrack should return undefined if all boxes are spent
   * @dependencies
   * - mockBoxes with predefined ErgoBox data
   * @scenario
   * - pass spentBoxIds including all boxIds
   * @expected
   * - return undefined
   */
  it('should returns undefined if all boxes are spent', () => {
    const spent = ['box1', 'box2'];
    const result = reduceTrack(mockBoxes, spent);

    expect(result).toBeUndefined();
  });

  /**
   * @target reduceTrack should return the first available box when no boxes are spent
   * @dependencies
   * - mockBoxes with predefined ErgoBox data
   * @scenario
   * - pass an empty spentBoxIds array
   * @expected
   * - return the first box
   */
  it('should returns the first available box when spentBoxIds is empty', () => {
    const result = reduceTrack(mockBoxes, []);
    expect(result).toEqual(mockBoxes[0]);
  });
});
