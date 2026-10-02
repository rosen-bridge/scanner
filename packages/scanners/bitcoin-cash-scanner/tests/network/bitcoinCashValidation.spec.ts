import {
  BITCOIN_CASH_RPC_LIMITS,
  validateBitcoinCashRawTransaction,
} from '../../lib/network/bitcoinCashValidation';
import { blockHash, fixture } from './bitcoinCashTestUtils';

describe('validateBitcoinCashRawTransaction', () => {
  /**
   * @target validateBitcoinCashRawTransaction should enforce its byte bound
   * @dependencies
   * - Real raw validator and oversized libauth transaction fixture
   * @scenario
   * - Supply raw hex one byte larger than the configured transaction limit
   * @expected
   * - Validation throws before accepting the transaction
   */
  it('rejects oversized raw bytes before native parsing', () => {
    const tx = fixture();
    tx.hex = '00'.repeat(BITCOIN_CASH_RPC_LIMITS.transactionBytes + 1);
    expect(() =>
      validateBitcoinCashRawTransaction(tx, tx.txid, blockHash, true),
    ).toThrow();
  });
});
