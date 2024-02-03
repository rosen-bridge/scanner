import * as testData from './testData';
import {
  mockAddresses,
  mockAddressesNotFound,
  mockAddressesUtxos,
  mockAddressesUtxosAll,
  mockAddressesUtxosNotFound,
  mockAssetsById,
  mockBlockLatest,
  mockBlocks,
  mockBlocksTxsAll,
  mockEpochsLatestParameters,
  mockTxs,
  mockTxsMetadata,
  mockTxsNotFound,
  mockTxsUtxos,
  mockTxsUtxosNotFound,
} from './mocked/BlockFrostAPI.mock';
import { TestCardanoBlockFrostNetwork } from './TestCardanoBlockFrostNetwork';
import { FailedError } from '@rosen-chains/abstract-chain';

describe('CardanoBlockFrostNetwork', () => {
  const mockNetwork = () =>
    new TestCardanoBlockFrostNetwork(
      'testProjectId',
      'lockAddress',
      {
        idKeys: {},
        tokens: [],
      },
      'http://blockfrost_test_url.test'
    );

  describe('constructor', () => {
    /**
     * @target constructor of `CardanoBlockFrostNetwork` should set extractor
     * @dependencies
     * @scenario
     * - construct an `CardanoBlockFrostNetwork`
     * @expected
     * - extractor of network should be defined
     */
    it('should set extractor', () => {
      const network = mockNetwork();

      expect(network.extractor).toBeDefined();
    });
  });

  describe('getHeight', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getHeight` should return block height successfully
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.blocksLatest`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked block height
     */
    it('should return block height successfully', async () => {
      // mock client response
      const network = mockNetwork();
      mockBlockLatest(network.getClient());

      // run test
      const result = await network.getHeight();

      // check returned value
      expect(result).toEqual(testData.blockHeight);
    });
  });

  describe('getTxConfirmation', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getTxConfirmation` should return tx confirmation
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.blocksLatest`
     * - mock `BlockFrostAPI.txs`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked tx confirmation
     */
    it('should return tx confirmation', async () => {
      // mock client response
      const network = mockNetwork();
      const client = network.getClient();
      mockBlockLatest(client);
      mockTxs(client, testData.rosenTransaction);

      // run test
      const result = await network.getTxConfirmation(
        testData.rosenTransaction.hash
      );

      // check returned value
      expect(result).toEqual(
        testData.blockHeight - testData.rosenTransaction.block_height
      );
    });

    /**
     * @target `CardanoBlockFrostNetwork.getTxConfirmation` should return -1
     * when transaction is not found
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.blocksLatest`
     * - mock `BlockFrostAPI.txs`
     * - run test
     * - check returned value
     * @expected
     * - it should be -1
     */
    it('should return -1 when transaction is not found', async () => {
      // mock client response
      const network = mockNetwork();
      const client = network.getClient();
      mockBlockLatest(client);
      mockTxsNotFound(client);

      // run test
      const result = await network.getTxConfirmation(
        testData.rosenTransaction.hash
      );

      // check returned value
      expect(result).toEqual(-1);
    });
  });

  describe('getAddressAssets', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getAddressAssets` should return address assets
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.addresses`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked assets
     */
    it('should return address assets', async () => {
      // mock client response
      const network = mockNetwork();
      mockAddresses(network.getClient(), testData.addressInfo);

      // run test
      const result = await network.getAddressAssets(testData.address);

      // check returned value
      expect(result).toEqual({
        nativeToken: testData.addressBalance,
        tokens: testData.addressAssets.map((asset) => ({
          id: `${asset.policy_id}.${asset.asset_name}`,
          value: BigInt(asset.quantity),
        })),
      });
    });

    /**
     * @target `CardanoBlockFrostNetwork.getAddressAssets` should return address assets
     * even when address has no assets
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.addresses`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked assets
     */
    it('should return address assets even when address has no assets', async () => {
      // mock client response
      const network = mockNetwork();
      mockAddresses(network.getClient(), testData.emptyAddressInfo);

      // run test
      const result = await network.getAddressAssets(testData.address);

      // check returned value
      expect(result).toEqual({
        nativeToken: 0n,
        tokens: [],
      });
    });

    /**
     * @target `CardanoBlockFrostNetwork.getAddressAssets` should return address assets
     * even when address has no history of transactions
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.addresses`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked assets
     */
    it('should return address assets even when address has no history of transactions', async () => {
      // mock client response
      const network = mockNetwork();
      mockAddressesNotFound(network.getClient());

      // run test
      const result = await network.getAddressAssets(testData.address);

      // check returned value
      expect(result).toEqual({
        nativeToken: 0n,
        tokens: [],
      });
    });
  });

  describe('getBlockTransactionIds', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getBlockTransactionIds` should return
     * id of block transactions
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.blocksTxsAll`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked transaction hashes
     */
    it('should return id of block transactions', async () => {
      // mock client response
      const network = mockNetwork();
      mockBlocksTxsAll(network.getClient());

      // run test
      const result = await network.getBlockTransactionIds(testData.blockId);

      // check returned value
      expect(result).toEqual(testData.txHashes);
    });
  });

  describe('getBlockInfo', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getBlockInfo` should return
     * block hash, parent hash and height
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.blocks`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked block info
     */
    it('should return block hash, parent hash and height', async () => {
      // mock client response
      const network = mockNetwork();
      mockBlocks(network.getClient());

      // run test
      const result = await network.getBlockInfo(testData.blockId);

      // check returned value
      expect(result).toEqual({
        hash: testData.blockInfo.hash,
        height: testData.blockInfo.height,
        parentHash: testData.blockInfo.previous_block,
      });
    });
  });

  describe('getTransaction', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getTransaction` should return transaction
     * with no metadata
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txs`
     * - mock `BlockFrostAPI.txsUtxos`
     * - mock `BlockFrostAPI.txsMetadata`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked transaction
     */
    it('should return transaction with no metadata', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxs(network.getClient(), testData.noMetadataTransaction);
      mockTxsUtxos(network.getClient(), testData.noMetadataTransactionUtxos);
      mockTxsMetadata(
        network.getClient(),
        testData.noMetadataTransactionMetadata
      );

      // run test
      const result = await network.getTransaction(
        testData.noMetadataTransaction.hash,
        testData.noMetadataTransaction.block
      );
      // check returned value
      expect(result).toEqual(testData.noMetadataTransactionInCardanoTx);
    });

    /**
     * @target `CardanoBlockFrostNetwork.getTransaction` should return transaction
     * with rosen metadata
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txs`
     * - mock `BlockFrostAPI.txsUtxos`
     * - mock `BlockFrostAPI.txsMetadata`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked transaction
     */
    it('should return transaction with rosen metadata', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxs(network.getClient(), testData.rosenTransaction);
      mockTxsUtxos(network.getClient(), testData.rosenTransactionUtxos);
      mockTxsMetadata(network.getClient(), testData.rosenTransactionMetadata);

      // run test
      const result = await network.getTransaction(
        testData.rosenTransaction.hash,
        testData.rosenTransaction.block
      );
      // check returned value
      expect(result).toEqual(testData.rosenTransactionInCardanoTx);
    });

    /**
     * @target `CardanoBlockFrostNetwork.getTransaction` should return transaction
     * with different metadata
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txs`
     * - mock `BlockFrostAPI.txsUtxos`
     * - mock `BlockFrostAPI.txsMetadata`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked transaction
     */
    it('should return transaction with different metadata', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxs(network.getClient(), testData.differentMetadataTransaction);
      mockTxsUtxos(
        network.getClient(),
        testData.differentMetadataTransactionUtxos
      );
      mockTxsMetadata(
        network.getClient(),
        testData.differentMetadataTransactionMetadata
      );

      // run test
      const result = await network.getTransaction(
        testData.differentMetadataTransaction.hash,
        testData.differentMetadataTransaction.block
      );
      // check returned value
      expect(result).toEqual(testData.differentMetadataTransactionInCardanoTx);
    });
  });

  describe('getAddressBoxes', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getAddressBoxes` should return address Utxos
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.addressUtxos`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked utxos
     */
    it('should return address Utxos', async () => {
      // mock client response
      const network = mockNetwork();
      mockAddressesUtxos(network.getClient(), testData.addressUtxoSet);

      // run test
      const result = await network.getAddressBoxes(testData.address, 0, 100);

      // check returned value
      expect(result).toEqual(testData.expectedAddressUtxoSet);
    });

    /**
     * @target `CardanoBlockFrostNetwork.getAddressBoxes` should return empty
     * list when address has no boxes
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.addressUtxos`
     * - run test
     * - check returned value
     * @expected
     * - it should be empty list
     */
    it('should return empty list when address has no boxes', async () => {
      // mock client response
      const network = mockNetwork();
      mockAddressesUtxos(network.getClient(), []);

      // run test
      const result = await network.getAddressBoxes(testData.address, 0, 100);

      // check returned value
      expect(result).toEqual([]);
    });

    /**
     * @target `CardanoBlockFrostNetwork.getAddressBoxes` should return empty
     * list when address has no history of transactions
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.addressUtxos`
     * - run test
     * - check returned value
     * @expected
     * - it should be empty list
     */
    it('should return empty list when address has no history of transactions', async () => {
      // mock client response
      const network = mockNetwork();
      mockAddressesUtxosNotFound(network.getClient());

      // run test
      const result = await network.getAddressBoxes(testData.address, 0, 100);

      // check returned value
      expect(result).toEqual([]);
    });
  });

  describe('isBoxUnspentAndValid', () => {
    /**
     * @target `CardanoBlockFrostNetwork.isBoxUnspentAndValid` should return true
     * when box is unspent and valid
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txUtxos`
     * - mock `BlockFrostAPI.addressUtxos`
     * - run test
     * - check returned value
     * @expected
     * - it should be true
     */
    it('should return true when box is unspent and valid', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxsUtxos(network.getClient(), testData.boxValidationTxUtxos);
      mockAddressesUtxosAll(network.getClient(), testData.addressUtxoSet);

      // run test
      const result = await network.isBoxUnspentAndValid(testData.unspentBoxId);

      // check returned value
      expect(result).toEqual(true);
    });

    /**
     * @target `CardanoBlockFrostNetwork.isBoxUnspentAndValid` should return false
     * when box is spent
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txUtxos`
     * - mock `BlockFrostAPI.addressUtxos`
     * - run test
     * - check returned value
     * @expected
     * - it should be false
     */
    it('should return false when box is spent', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxsUtxos(network.getClient(), testData.boxValidationTxUtxos);
      mockAddressesUtxosAll(network.getClient(), testData.addressUtxoSet);

      // run test
      const result = await network.isBoxUnspentAndValid(testData.spentBoxId);

      // check returned value
      expect(result).toEqual(false);
    });

    /**
     * @target `CardanoBlockFrostNetwork.isBoxUnspentAndValid` should return false
     * when box is invalid (source tx is not found)
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txUtxos`
     * - mock `BlockFrostAPI.addressUtxos`
     * - run test
     * - check returned value
     * @expected
     * - it should be false
     */
    it('should return false when box is invalid', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxsUtxosNotFound(network.getClient());
      mockAddressesUtxosAll(network.getClient(), testData.addressUtxoSet);

      // run test
      const result = await network.isBoxUnspentAndValid(testData.unspentBoxId);

      // check returned value
      expect(result).toEqual(false);
    });
  });

  describe('currentSlot', () => {
    /**
     * @target `CardanoBlockFrostNetwork.currentSlot` should return current slot successfully
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.blocksLatest`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked current slot
     */
    it('should return current slot successfully', async () => {
      // mock client response
      const network = mockNetwork();
      mockBlockLatest(network.getClient());

      // run test
      const result = await network.currentSlot();

      // check returned value
      expect(result).toEqual(testData.absoluteSlot);
    });
  });

  describe('getUtxo', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getUtxo` should return utxo successfully
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txUtxos`
     * - run test
     * - check returned value
     * @expected
     * - it should be true
     */
    it('should return utxo successfully', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxsUtxos(network.getClient(), testData.boxValidationTxUtxos);

      // run test
      const result = await network.getUtxo(testData.unspentBoxId);

      // check returned value
      expect(result).toEqual(testData.txUtxo);
    });

    /**
     * @target `CardanoBlockFrostNetwork.getUtxo` should throw Error
     * when box tx is not found
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.txUtxos`
     * - call the function and expect error
     * @expected
     * - it should throw FailedError
     */
    it('should throw Error when box tx is not found', async () => {
      // mock client response
      const network = mockNetwork();
      mockTxsUtxosNotFound(network.getClient());

      // call the function and expect error
      await expect(async () => {
        await network.getUtxo(testData.unspentBoxId);
      }).rejects.toThrow(FailedError);
    });
  });

  describe('getProtocolParameters', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getProtocolParameters` should return required parameters
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.epochsLatestParameters`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked slot
     */
    it('should return required parameters', async () => {
      // mock client response
      const network = mockNetwork();
      mockEpochsLatestParameters(network.getClient());

      // run test
      const result = await network.getProtocolParameters();

      // check returned value
      expect(result).toEqual(testData.expectedRequiredParams);
    });
  });

  describe('getTokenDetail', () => {
    /**
     * @target `CardanoBlockFrostNetwork.getTokenDetail` should return token detail successfully
     * @dependencies
     * @scenario
     * - mock `BlockFrostAPI.assetsById`
     * - run test
     * - check returned value
     * @expected
     * - it should be mocked token data
     */
    it('should return token detail successfully', async () => {
      // mock client response
      const network = mockNetwork();
      mockAssetsById(network.getClient());

      // run test
      const result = await network.getTokenDetail(testData.assetId);

      // check returned value
      expect(result).toEqual(testData.expectedTokenDetail);
    });
  });
});
