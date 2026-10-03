import { resolveBitcoinCashRpcLimits } from '../../lib/network/bitcoinCashRpcPolicy';
import {
  BITCOIN_CASH_RPC_LIMITS,
  validateBitcoinCashRawTransaction,
} from '../../lib/network/bitcoinCashValidation';
import { blockHash, fixture } from './bitcoinCashTestUtils';

describe('validateBitcoinCashRawTransaction', () => {
  /**
   * @target raw decoding can recover above the default byte budget without losing identity checks
   * @dependencies syntactically valid synthetic libauth transaction; no node-validity claim
   * @scenario validate one oversized fixture with default and exact enlarged budgets
   * @expected default emits the typed resource failure, override preserves exact raw bytes
   */
  it('accepts an exact enlarged raw-byte budget after default rejection', () => {
    const tx = fixture(false, false, BITCOIN_CASH_RPC_LIMITS.transactionBytes);
    const byteLength = tx.hex.length / 2;
    expect(() =>
      validateBitcoinCashRawTransaction(tx, tx.txid, blockHash, true),
    ).toThrow('resource limit exceeded: transactionBytes');
    const parsed = validateBitcoinCashRawTransaction(
      tx,
      tx.txid,
      blockHash,
      true,
      resolveBitcoinCashRpcLimits({ transactionBytes: byteLength }),
    );
    expect(parsed.byteLength).toEqual(byteLength);
    expect(parsed.transaction.hex).toEqual(tx.hex);
  });
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
