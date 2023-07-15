import { DataSource, Repository } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { OutputInfo } from '@rosen-clients/ergo-explorer/dist/src/v1/types';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { ErgoUTXOExtractor } from '../../lib';
import { BoxEntity } from '../../lib';
import {
  addressBoxes,
  generateBlockEntity,
  createDatabase,
  tx1,
  insertBoxEntity,
} from './utils.mock';
import { ExtractedBox } from '../../lib/interfaces/types';

jest.mock('@rosen-clients/ergo-explorer');
let dataSource: DataSource;

describe('extractorErgo', () => {
  let repository: Repository<BoxEntity>;
  beforeEach(async () => {
    dataSource = await createDatabase();
    repository = dataSource.getRepository(BoxEntity);
  });

  describe('processTransactions', () => {
    /**
     * extract one box with address from transaction
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: stored one box with expected id and information into database
     */
    it('checks transaction by address', async () => {
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2'
      );
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await extractor.processTransactions([tx1], block);
      expect(await repository.count()).toEqual(1);
      const boxEntity = (await repository.find())[0];
      expect(boxEntity.boxId).toEqual(
        '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542'
      );
    });

    /**
     * extract one box with one tokens from transaction
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: stored one box with expected id and information into database
     */
    it('checks transaction by tokens', async () => {
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        undefined,
        ['ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367']
      );
      await extractor.processTransactions([tx1], block);
      expect(await repository.count()).toEqual(2);
      const boxIds = (await repository.find()).map((item) => item.boxId).sort();
      expect(boxIds).toEqual([
        '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542',
        '46220fcb528daed856ce06f4225bd32fced8eac053922b77bee3e8e776252e28',
      ]);
    });

    /**
     * extract one box with two tokens from transaction
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: stored one box with expected id and information into database
     */
    it('checks transaction by tokens', async () => {
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        undefined,
        [
          'ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367',
          '3df73b29204ffa2085c38a958d322c86bee0471a5a1296b031f137236e038c6d',
        ]
      );
      await extractor.processTransactions([tx1], block);
      expect(await repository.count()).toEqual(1);
      const boxEntity = (await repository.find())[0];
      expect(boxEntity.boxId).toEqual(
        '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542'
      );
    });

    /**
     * extract one box with address and two tokens from transaction
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: stored one box with expected id and information into database
     */
    it('checks transaction by tokens and address', async () => {
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        [
          'ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367',
          '3df73b29204ffa2085c38a958d322c86bee0471a5a1296b031f137236e038c6d',
        ]
      );
      await extractor.processTransactions([tx1], block);
      expect(await repository.count()).toEqual(1);
      const boxEntity = (await repository.find())[0];
      expect(boxEntity.boxId).toEqual(
        '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542'
      );
    });
  });

  describe('boxHasToken', () => {
    let extractor: ErgoUTXOExtractor;
    beforeAll(() => {
      extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        undefined,
        ['tokenId']
      );
    });

    /**
     * @target ergoUtxoExtractor.boxHasToken should return true when box has the required token
     * @dependencies
     * @scenario
     * - mock a box with token
     * - check boxHasToken for the box
     * @expected
     * - it should return true when box has the required token
     */
    it('should return true when box has the required token', () => {
      const box: OutputInfo = {
        assets: [
          {
            tokenId: 'tokenId',
            amount: 1000n,
          },
          {
            tokenId: 'tokenId2',
            amount: 1000n,
          },
        ],
      } as any;
      const result = extractor.boxHasToken(box);
      expect(result).toEqual(true);
    });

    /**
     * @target ergoUtxoExtractor.boxHasToken should return false when box doesn't have the required token
     * @dependencies
     * @scenario
     * - mock a box without token
     * - check boxHasToken for the box
     * @expected
     * - it should return false when box doesn't have the required token
     */
    it("should return false when box doesn't have the required token", () => {
      const box: OutputInfo = {
        assets: [
          {
            tokenId: 'tokenId2',
            amount: 1000n,
          },
        ],
      } as any;
      const result = extractor.boxHasToken(box);
      expect(result).toEqual(false);
    });
  });

  describe('extractBoxData', () => {
    /**
     * @target ergoUtxoExtractor.extractBoxData should extract box data from api output
     * @dependencies
     * @scenario
     * - call extractBoxData with api output
     * - check the extract info
     * @expected
     * - should extract box data from api output
     */
    it('should extract box data from api output', async () => {
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        undefined,
        ['tokenId']
      );
      const boxData = await extractor.extractBoxData([addressBoxes.items[0]]);
      expect(boxData[0]).toEqual({
        boxId:
          'bc44f3f1110abb9ada12c4cf62c759b0c1ed911cca9b608f85f7ba141dff602d',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        serialized:
          'gLqWnCUACM0Ci8yF+iIAb6E3Z6sAryiuCyOJ1Xb7Wc/Q5Ghl4ESe64qMkhIBA2iZQXRnF83dBcUvRU40624gOoT5Mf3EfFL0RYn4NJbwLgAuAd1xjCyFJHU1IObrJHTblNF+XJVoI3TbyRHn9QOVHgE=',
        blockId:
          'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9',
        height: 297230,
        spendBlock: undefined,
        spendHeight: undefined,
      });
    });
  });

  describe('getTxBlock', () => {
    /**
     * @target ergoUtxoExtractor.getTxBlock should extract block id and height for a transaction
     * @dependencies
     * @scenario
     * - call getTxBlock with api output
     * - check the extract info
     * @expected
     * - should extract block data from api output
     */
    it('should extract block id and height for a transaction', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1TransactionsP1: async () => ({
            blockId: 'blockId',
            inclusionHeight: 100,
          }),
        },
      } as any);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        undefined,
        ['tokenId']
      );
      const boxData = await extractor.getTxBlock('txId');
      expect(boxData).toEqual({
        id: 'blockId',
        height: 100,
      });
    });
  });

  describe('getUnspentBoxes', () => {
    /**
     * @target ergoUtxoExtractor.getUnspentBoxes should iterate on api when data count is more than api limit
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesUnspentBytokenidP1 explorer api to return 120 boxes
     * - mock extractBoxData
     * - call getUnspentBoxes
     * - check extractBoxData have been called twice
     * @expected
     * - should get data and extract information twice when data count is more than api limit
     */
    it('should iterate on api when data count is more than api limit', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesUnspentByergotreeP1: async () => ({
            items: [],
            total: 120,
          }),
        },
      } as any);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        ['tokenId']
      );
      const extractedBox = {
        boxId: 'boxId',
        address: 'address',
        serialized: 'serialized',
      };
      const spy = jest
        .spyOn(extractor, 'extractBoxData')
        .mockResolvedValue([extractedBox]);
      const result = await extractor.getUnspentBoxes(100);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(result).toEqual([extractedBox, extractedBox]);
    });

    /**
     * @target ergoUtxoExtractor.getUnspentBoxes should filter the boxes with required token and initialHeight
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesUnspentBytokenidP1 to return 3 boxes with different conditions
     * - call getUnspentBoxes
     * - check the extractBoxData to have been called with the correct box
     * @expected
     * - should filter one box with proper height and token and extract its data
     */
    it('should filter the boxes with required token and initialHeight', async () => {
      const boxes = [
        {
          assets: [
            {
              tokenId: 'tokenId',
              amount: 1000n,
            },
          ],
          creationHeight: 100,
        },
        {
          creationHeight: 100,
        },
        {
          assets: [
            {
              tokenId: 'tokenId',
              amount: 1000n,
            },
          ],
          creationHeight: 120,
        },
      ];
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesUnspentBytokenidP1: async () => ({
            items: boxes,
            total: 20,
          }),
        },
      } as any);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        undefined,
        ['tokenId']
      );
      const spy = jest.spyOn(extractor, 'extractBoxData').mockResolvedValue([]);
      await extractor.getUnspentBoxes(110);
      expect(spy).toHaveBeenCalledWith([boxes[0]]);
    });
  });

  describe('getBoxInfoWithBoxId', () => {
    /**
     * @target ergoUtxoExtractor.getBoxInfoWithBoxId should extract box info by boxId
     * @dependencies
     * @scenario
     * - mock box and extracted box
     * - mock getApiV1BoxesP1 to getApiV1BoxesP1 to return the box
     * - mock extractBoxData to return the extracted box
     * - run getBoxInfoWithBoxId
     * - check the extractBoxData input and function output
     * @expected
     * - it should call extractBoxData with proper data
     * - it should return the extracted information correctly
     */
    it('should extract box info by boxId', async () => {
      const box = {
        boxId: 'boxId',
        blockId: 'blockId',
      };
      const extractedBox = {
        boxId: 'boxId',
        address: 'address',
        serialized: 'serialized',
      };
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesP1: async () => box,
        },
      } as any);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        undefined,
        ['tokenId']
      );
      const spy = jest
        .spyOn(extractor, 'extractBoxData')
        .mockResolvedValue([extractedBox]);
      const boxData = await extractor.getBoxInfoWithBoxId('boxId');
      expect(spy).toHaveBeenCalledWith([box]);
      expect(boxData).toEqual(extractedBox);
    });
  });

  describe('validateOldStoredBoxes', () => {
    let extractor: ErgoUTXOExtractor;
    beforeEach(() => {
      extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        undefined,
        ['tokenId']
      );
    });

    /**
     * @target ergoUtxoExtractor.validateOldStoredBoxes should remove invalid box from database
     * @dependencies
     * @scenario
     * - insert a mocked box in database
     * - mock getBoxInfoWithBoxId to return undefined (no information found for this box)
     * - run validateOldStoredBoxes
     * - check removing the box
     * @expected
     * - since box data doesn't exist in network, its invalid,
     * - it should remove the invalid box
     */
    it('should remove invalid box from database', async () => {
      insertBoxEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getBoxInfoWithBoxId')
        .mockResolvedValue(undefined);

      await extractor.validateOldStoredBoxes(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const box = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(box).toBeNull();
    });

    /**
     * @target ergoUtxoExtractor.validateOldStoredBoxes should update valid box information when spent bellow the initial height
     * @dependencies
     * @scenario
     * - insert a mocked box in database
     * - mock getBoxInfoWithBoxId to return box information
     * - run validateOldStoredBoxes
     * - check updated box fields
     * @expected
     * - it should update spending information of a valid box spent bellow the initial height
     */
    it('should update valid box information when spent bellow the initial height', async () => {
      insertBoxEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getBoxInfoWithBoxId')
        .mockResolvedValue({
          spendBlock: 'spendBlockId',
          spendHeight: 99,
        } as any);

      await extractor.validateOldStoredBoxes(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const box = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(box).not.toBeNull();
      expect(box!.spendBlock).toEqual('spendBlockId');
      expect(box!.spendHeight).toEqual(99);
    });

    /**
     * @target ergoUtxoExtractor.validateOldStoredBoxes should not change valid box information when spent after the initial height
     * @dependencies
     * @scenario
     * - insert a mocked box in database
     * - mock getBoxInfoWithBoxId to return box information
     * - run validateOldStoredBoxes
     * - check updated box fields
     * @expected
     * - it should not change the box information since its valid and spent after the initial height
     */
    it('should not change valid box information when spent after the initial height', async () => {
      insertBoxEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getBoxInfoWithBoxId')
        .mockResolvedValue({
          spendBlock: 'spendBlockId',
          spendHeight: 120,
        } as any);

      await extractor.validateOldStoredBoxes(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const box = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(box).not.toBeNull();
      expect(box!.spendBlock).toBeNull();
      expect(box!.spendHeight).toBeNull();
    });
  });

  describe('initializeBoxes', () => {
    let extractor: ErgoUTXOExtractor;
    beforeEach(() => {
      extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor',
        ergoLib.NetworkPrefix.Mainnet,
        'url',
        undefined,
        ['tokenId']
      );
    });

    /**
     * @target ergoUtxoExtractor.initializeBoxes should insert new found box and validate the old existing box
     * @dependencies
     * @scenario
     * - insert a mocked box in database
     * - mock getUnspentBoxes to return new extracted box
     * - mock validateOldStoredBoxes
     * - run initializeBoxes
     * - should store the new box
     * - should call validateOldStoredBoxes with the old existing box
     * @expected
     * - it should store the new box (boxId2) information
     * - it should validate the existing box1 (boxId1)
     */
    it('should insert new found box and validate the old existing box', async () => {
      insertBoxEntity(dataSource, 'boxId1');
      const extractedBoxes: Array<ExtractedBox> = [
        {
          boxId: 'boxId2',
          address: 'address2',
          serialized: 'serialized2',
          blockId: 'blockId',
          height: 99,
        },
      ];
      jest
        .spyOn(extractor, 'getUnspentBoxes')
        .mockResolvedValue(extractedBoxes);
      const spy = jest
        .spyOn(extractor, 'validateOldStoredBoxes')
        .mockImplementation();
      await extractor.initializeBoxes(100);
      const box = await repository.findOne({ where: { boxId: 'boxId2' } });
      expect(box).not.toBeNull();
      expect(box?.address).toEqual('address2');
      expect(box?.createBlock).toEqual('blockId');
      expect(box?.serialized).toEqual('serialized2');
      expect(box?.creationHeight).toEqual(99);
      expect(spy).toHaveBeenCalledWith(['boxId1'], 100);
    });

    /**
     * @target ergoUtxoExtractor.initializeBoxes should update the unspent existing box information
     * @dependencies
     * @scenario
     * - insert a mocked box in database
     * - mock getUnspentBoxes to return new extracted box
     * - mock validateOldStoredBoxes
     * - run initializeBoxes
     * - should update the unspent box information
     * - should call validateOldStoredBoxes with nothing
     * @expected
     * - it should update the existing box1 (boxId1) information
     * - it should not validate anything
     */
    it('should update the unspent existing box information', async () => {
      const extractedBoxes: Array<ExtractedBox> = [
        {
          boxId: 'boxId1',
          address: 'address',
          serialized: 'newSerialized',
          blockId: 'blockId',
          height: 99,
        },
      ];
      jest
        .spyOn(extractor, 'getUnspentBoxes')
        .mockResolvedValue(extractedBoxes);
      const spy = jest
        .spyOn(extractor, 'validateOldStoredBoxes')
        .mockImplementation();
      insertBoxEntity(dataSource, 'boxId1');
      await extractor.initializeBoxes(100);
      const box = await repository.findOne({ where: { boxId: 'boxId1' } });
      expect(box).not.toBeNull();
      expect(box?.serialized).toEqual('newSerialized');
      expect(spy).toHaveBeenCalledWith([], 100);
    });
  });
});
