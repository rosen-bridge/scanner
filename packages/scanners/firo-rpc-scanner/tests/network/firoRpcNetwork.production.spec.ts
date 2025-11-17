import { describe, it, expect, beforeAll } from 'vitest';

import { FiroRpcNetwork } from '../../lib/network/firoRpcNetwork';

describe('FiroRpcNetwork - Production Integration Tests', () => {
  let isNodeAvailable = false;

  beforeAll(async () => {
    // Check if Firo node is available before running tests
    try {
      const firoNetwork = new FiroRpcNetwork(
        'http://127.0.0.1:8888',
        {
          user: 'firouser',
          pass: 'firopwd',
        },
        5000, // Short timeout for availability check
      );

      await firoNetwork.getCurrentHeight();
      isNodeAvailable = true;
    } catch {
      isNodeAvailable = false;
      console.warn('Firo node not available - skipping production tests');
      console.warn(
        '   To run these tests, start a Firo node on localhost:8888',
      );
      console.warn('   with RPC credentials: firouser:firopwd');
    }
  });

  /**
   * @target FiroRpcNetwork.getBlockAtHeight() - Real Firo Node Integration
   * @dependencies Running Firo testnet node at localhost:8888 with HTTP Basic Auth
   * @scenario
   * - Create FiroRpcNetwork instance with real testnet node credentials
   * - Call getBlockAtHeight() with known testnet block height
   * - Validate response contains proper block structure
   * @expected
   * - Should return valid block object with hash, height, parentHash, txCount, timestamp
   * - Block height should match requested height
   * - Should handle real Firo RPC calls (getblockhash + getblock)
   */
  it('should test getBlockAtHeight() method with Firo node', async () => {
    if (!isNodeAvailable) {
      return;
    }

    const firoNetwork = new FiroRpcNetwork(
      'http://127.0.0.1:8888',
      {
        user: 'firouser',
        pass: 'firopwd',
      },
      10000,
    );

    const testHeight = 1199122; // Known testnet block
    const block = await firoNetwork.getBlockAtHeight(testHeight);

    expect(block).toBeDefined();
    expect(typeof block.parentHash).toBe('string');
    expect(block.parentHash).toHaveLength(64);
    expect(typeof block.hash).toBe('string');
    expect(block.hash).toHaveLength(64);
    expect(typeof block.height).toBe('number');
    expect(block.height).toBe(testHeight);
    expect(typeof block.timestamp).toBe('number');
    expect(typeof block.txCount).toBe('number');
    expect(block.txCount).toBeGreaterThan(0);
  }, 15000);

  /**
   * @target FiroRpcNetwork.getCurrentHeight() - Real Firo Node Integration
   * @dependencies Running Firo testnet node at localhost:8888 with HTTP Basic Auth
   * @scenario
   * - Create FiroRpcNetwork instance with real testnet node credentials
   * - Call getCurrentHeight() method to fetch actual blockchain height
   * - Validate response is a valid number above expected testnet height
   * @expected
   * - Should return current blockchain height as number from live Firo testnet node
   * - Height should be greater than 1198000 (known testnet milestone)
   * - Should complete within 15 seconds timeout
   * - Should handle HTTP Basic Auth correctly (firouser:firopwd)
   */
  it('should test getCurrentHeight() method with Firo node', async () => {
    if (!isNodeAvailable) {
      return;
    }

    // Create FiroRpcNetwork instance - for testnet the parameters are different
    const firoNetwork = new FiroRpcNetwork(
      'http://127.0.0.1:8888',
      {
        user: 'firouser',
        pass: 'firopwd',
      },
      10000,
    );

    const height = await firoNetwork.getCurrentHeight();
    expect(typeof height).toBe('number');
    expect(height).toBeGreaterThan(1198000);
  }, 15000);

  /**
   * @target FiroRpcNetwork.getBlockTxs() - Real Firo Node Integration
   * @dependencies Running Firo testnet node at localhost:8888 with HTTP Basic Auth
   * @scenario
   * - Create FiroRpcNetwork instance with real testnet node credentials
   * - Call getBlockTxs() with known testnet block hash
   * - Validate response contains actual Firo transactions
   * @expected
   * - Should return array of full Firo transaction objects
   * - Transactions should have Firo-specific fields (cbTx, chainlock, etc.)
   * - Should handle real RPC calls (getblock + getrawtransaction for each tx)
   */
  it('should test getBlockTxs() method with Firo node', async () => {
    if (!isNodeAvailable) {
      return;
    }

    const firoNetwork = new FiroRpcNetwork(
      'http://127.0.0.1:8888',
      {
        user: 'firouser',
        pass: 'firopwd',
      },
      10000,
    );

    const testBlockHash =
      '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1'; // Known testnet block
    const transactions = await firoNetwork.getBlockTxs(testBlockHash);

    expect(transactions).toBeDefined();
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);

    // Check first transaction (coinbase)
    const firstTx = transactions[0];
    expect(typeof firstTx.txid).toBe('string');
    expect(firstTx.txid).toHaveLength(64);
    expect(typeof firstTx.hash).toBe('string');
    expect(Array.isArray(firstTx.vin)).toBe(true);
    expect(Array.isArray(firstTx.vout)).toBe(true);

    // Check for Firo-specific fields
    expect(firstTx).toHaveProperty('chainlock');
    expect(firstTx).toHaveProperty('cbTx'); // Coinbase special transaction
  }, 20000);

  /**
   * @target FiroRpcNetwork.getBlockTxInfo() - Complete Firo Block Structure Validation
   * @dependencies Running Firo testnet node at localhost:8888 with HTTP Basic Auth
   * @scenario
   * - Create FiroRpcNetwork instance with real testnet node credentials
   * - Call getBlockTxInfo() with known testnet block hash to get complete Firo block structure
   * - Validate response matches expected Firo RPC block format from test data
   * @expected
   * - Should return complete Firo block object with all native fields
   * - Block should contain Firo-specific fields: cbTx, chainlock, difficulty, etc.
   * - Structure should match getBlockResponse.result format from test data
   */
  it('should test getBlockTxInfo() method with Firo node', async () => {
    if (!isNodeAvailable) {
      return;
    }

    const firoNetwork = new FiroRpcNetwork(
      'http://127.0.0.1:8888',
      {
        user: 'firouser',
        pass: 'firopwd',
      },
      10000,
    );

    const testBlockHash =
      '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1';
    const firoBlock = await firoNetwork.getBlockTxInfo(testBlockHash);

    expect(firoBlock).toBeDefined();
    expect(typeof firoBlock.hash).toBe('string');
    expect(firoBlock.hash).toHaveLength(64);
    expect(typeof firoBlock.height).toBe('number');
    expect(firoBlock.height).toBe(1199122);
    expect(typeof firoBlock.previousblockhash).toBe('string');
    expect(firoBlock.previousblockhash).toHaveLength(64);
    expect(typeof firoBlock.nextblockhash).toBe('string');
    expect(firoBlock.nextblockhash).toHaveLength(64);

    expect(typeof firoBlock.confirmations).toBe('number');
    expect(typeof firoBlock.size).toBe('number');
    expect(typeof firoBlock.strippedsize).toBe('number');
    expect(typeof firoBlock.weight).toBe('number');
    expect(typeof firoBlock.version).toBe('number');
    expect(typeof firoBlock.versionHex).toBe('string');
    expect(typeof firoBlock.merkleroot).toBe('string');
    expect(firoBlock.merkleroot).toHaveLength(64);

    expect(Array.isArray(firoBlock.tx)).toBe(true);
    expect(firoBlock.tx.length).toBeGreaterThan(0);
    firoBlock.tx.forEach((txid) => {
      expect(typeof txid).toBe('string');
      expect(txid).toHaveLength(64);
    });

    expect(firoBlock).toHaveProperty('cbTx');
    if (firoBlock.cbTx) {
      expect(typeof firoBlock.cbTx).toBe('object');
      expect(typeof firoBlock.cbTx.version).toBe('number');
      expect(typeof firoBlock.cbTx.height).toBe('number');
      expect(firoBlock.cbTx.height).toBe(firoBlock.height);
      expect(typeof firoBlock.cbTx.merkleRootMNList).toBe('string');
      expect(firoBlock.cbTx.merkleRootMNList).toHaveLength(64);
    }

    expect(typeof firoBlock.time).toBe('number');
    expect(typeof firoBlock.mediantime).toBe('number');

    expect(typeof firoBlock.nonce).toBe('number');
    expect(typeof firoBlock.bits).toBe('string');
    expect(typeof firoBlock.difficulty).toBe('number');
    expect(typeof firoBlock.chainwork).toBe('string');
  }, 15000);

  /**
   * @target FiroRpcNetwork.getBlockTxIds() - Real Firo Node Integration
   * @dependencies Running Firo testnet node at localhost:8888 with HTTP Basic Auth
   * @scenario
   * - Create FiroRpcNetwork instance with real testnet node credentials
   * - Call getBlockTxIds() with known testnet block hash
   * - Validate response contains array of transaction IDs
   * @expected
   * - Should return array of transaction ID strings
   * - Each transaction ID should be 64-character hex string
   * - Array length should match the known block's transaction count
   */
  it('should test getBlockTxIds() method with Firo node', async () => {
    if (!isNodeAvailable) {
      return;
    }

    const firoNetwork = new FiroRpcNetwork(
      'http://127.0.0.1:8888',
      {
        user: 'firouser',
        pass: 'firopwd',
      },
      10000,
    );

    const testBlockHash =
      '25fb04aaa9833621b769c4cf5d309b025a1b5b6ea3e5f04cb09174759d8b5fa1';
    const txIds = await firoNetwork.getBlockTxIds(testBlockHash);

    expect(txIds).toBeDefined();
    expect(Array.isArray(txIds)).toBe(true);
    expect(txIds.length).toBeGreaterThan(0);

    txIds.forEach((txId) => {
      expect(typeof txId).toBe('string');
      expect(txId).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/i.test(txId)).toBe(true); // Valid hex string
    });
  }, 15000);

  /**
   * @target FiroRpcNetwork.getTransaction() - Real Firo Node Integration
   * @dependencies Running Firo testnet node at localhost:8888 with HTTP Basic Auth
   * @scenario
   * - Create FiroRpcNetwork instance with real testnet node credentials
   * - Call getTransaction() with known testnet transaction ID
   * - Validate response contains complete Firo transaction structure
   * @expected
   * - Should return complete FiroRpcTransaction object
   * - Transaction should have all required fields: txid, hash, vin, vout, etc.
   * - Should handle real RPC call (getrawtransaction with verbose=true)
   */
  it('should test getTransaction() method with Firo node', async () => {
    if (!isNodeAvailable) {
      return;
    }

    const firoNetwork = new FiroRpcNetwork(
      'http://127.0.0.1:8888',
      {
        user: 'firouser',
        pass: 'firopwd',
      },
      10000,
    );

    const testTxId =
      '6c9d0ff813d9ef07bc4e62f36aa83e62c9d0b9870284bfe9895399e2ab5b1a85';
    const transaction = await firoNetwork.getTransaction(testTxId);

    expect(transaction).toBeDefined();
    expect(typeof transaction.txid).toBe('string');
    expect(transaction.txid).toBe(testTxId);
    expect(typeof transaction.hash).toBe('string');
    expect(transaction.hash).toHaveLength(64);
    expect(Array.isArray(transaction.vin)).toBe(true);
    expect(Array.isArray(transaction.vout)).toBe(true);
    expect(typeof transaction.size).toBe('number');
    expect(typeof transaction.version).toBe('number');
    expect(transaction).toHaveProperty('chainlock');
    expect(transaction).toHaveProperty('cbTx');
  }, 15000);

  /**
   * @target FiroRpcNetwork.getAddressBalance() - Real Firo Node Integration (Test Address)
   * @dependencies Running Firo testnet node at localhost:8888 with HTTP Basic Auth and addressindex enabled
   * @scenario
   * - Create FiroRpcNetwork instance with real testnet node credentials
   * - Call getAddressBalance() with test address (may have zero balance)
   * - Validate response format and type
   * @expected
   * - Should return balance as number in duffs (satoshis)
   * - Balance should be >= 0 (can be zero for unused addresses)
   * - Should handle real RPC call (getaddressbalance)
   * - Method should work even if address has zero balance
   */
  it('should test getAddressBalance() method with Firo node', async () => {
    if (!isNodeAvailable) {
      return;
    }

    const firoNetwork = new FiroRpcNetwork(
      'http://127.0.0.1:8888',
      {
        user: 'firouser',
        pass: 'firopwd',
      },
      10000,
    );

    try {
      // Test with a known address (might have zero balance)
      const testAddress = 'a51Ervw5phYk9bszRsRCH3gfM48QKG4xNA';
      const balance = await firoNetwork.getAddressBalance(testAddress);

      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(balance)).toBe(true);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Unknown error';

      if (
        errorMessage.includes('addressindex') ||
        errorMessage.includes('No information available')
      ) {
        console.error(
          'Error: Can not retrieve address balance, ',
          errorMessage,
        );
        expect(errorMessage).toMatch(/addressindex|No information available/);
      } else {
        throw error;
      }
    }
  }, 15000);
});
