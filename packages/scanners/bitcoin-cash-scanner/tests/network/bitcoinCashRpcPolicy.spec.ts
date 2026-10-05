import {
  BitcoinCashRpcLimits,
  BITCOIN_CASH_RPC_LIMITS,
  BITCOIN_CASH_RPC_HARD_LIMITS,
  resolveBitcoinCashRpcLimits,
} from '../../lib/network/bitcoinCashRpcPolicy';

describe('resolveBitcoinCashRpcLimits', () => {
  /**
   * @target resolveBitcoinCashRpcLimits validates defaults, every override and hard ceiling
   * @dependencies real budget resolver and exported defaults/ceilings
   * @scenario test defaults, each exact ceiling and isolated invalid overrides
   * @expected defaults are frozen, ceilings accepted, invalid values rejected
   */
  it('validates defaults, every override and hard ceiling', () => {
    expect(resolveBitcoinCashRpcLimits()).toEqual(BITCOIN_CASH_RPC_LIMITS);
    expect(Object.isFrozen(resolveBitcoinCashRpcLimits())).toEqual(true);
    for (const key of Object.keys(
      BITCOIN_CASH_RPC_LIMITS,
    ) as (keyof BitcoinCashRpcLimits)[]) {
      const ceiling = BITCOIN_CASH_RPC_HARD_LIMITS[key];
      expect(resolveBitcoinCashRpcLimits({ [key]: ceiling })[key]).toEqual(
        ceiling,
      );
      for (const value of [
        0,
        -1,
        1.5,
        NaN,
        Infinity,
        ceiling + 1,
        undefined,
        '5',
      ])
        expect(() => resolveBitcoinCashRpcLimits({ [key]: value })).toThrow(
          'resource limit',
        );
    }
    expect(() =>
      resolveBitcoinCashRpcLimits({
        unexpected: 5,
      } as Partial<BitcoinCashRpcLimits>),
    ).toThrow();
  });
});
