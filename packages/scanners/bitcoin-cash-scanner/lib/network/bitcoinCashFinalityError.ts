/** Stable diagnostic reasons; every reason still refuses event eligibility. */
export type BitcoinCashFinalityCode =
  | 'waiting-finalization'
  | 'node-unsynchronized'
  | 'branch-disagreement'
  | 'parked-fork'
  | 'snapshot-changed'
  | 'invalid-evidence';

/** Carries a machine-readable reason without changing the finality predicate. */
export class BitcoinCashFinalityError extends Error {
  /**
   * Records the failed predicate for operator diagnostics.
   * @param code - Stable categorical reason
   * @param message - Fixed explanation from the validator, without credentials
   */
  constructor(
    readonly code: BitcoinCashFinalityCode,
    message: string,
  ) {
    super(message);
    this.name = 'BitcoinCashFinalityError';
  }
}
