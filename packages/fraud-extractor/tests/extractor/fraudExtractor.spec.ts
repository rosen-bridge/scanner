import { DataSource, Repository } from 'typeorm';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { FraudExtractor } from '../../lib';
import { FraudEntity } from '../../lib';
import {
  createDatabase,
  generateFraudTx,
  insertFraudEntity,
} from './utils.mock';
import { ExtractedFraud } from '../../lib/interfaces/types';
import { block } from '../actions/fraudActionTestData';
import {
  fraudBox,
  extractedFraud,
  fraudApiOutputBoxes,
} from './fraudExtractorTestData';

jest.mock('@rosen-clients/ergo-explorer');
let dataSource: DataSource;

describe('fraudExtractor', () => {
  let repository: Repository<FraudEntity>;
  let extractor: FraudExtractor;
  beforeEach(async () => {
    dataSource = await createDatabase();
    repository = dataSource.getRepository(FraudEntity);
    extractor = new FraudExtractor(
      dataSource,
      'extractor',
      'explorerUrl',
      '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
      'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9'
    );
  });

  describe('processTransactions', () => {
    /**
     * @target fraudExtractor.processTransactions should save a fraud from the transaction
     * @dependencies
     * - Database
     * @scenario
     * - mock a block and fraud transaction
     * - process fraud transaction
     * - check the stored information
     * @expected
     * - should store one fraud in the database
     */
    it('should save a fraud from the transaction', async () => {
      await extractor.processTransactions(
        [
          generateFraudTx(
            'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9',
            '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542',
            '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2'
          ),
        ],
        block
      );
      expect(await repository.count()).toEqual(1);
      const fraud = (await repository.find())[0];
      expect(fraud.wid).toEqual(
        '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542'
      );
      expect(fraud.creationBlock).toEqual(block.hash);
      expect(fraud.creationHeight).toEqual(block.height);
    });
  });

  describe('getTxBlock', () => {
    /**
     * @target fraudExtractor.getTxBlock should extract block id and height for a transaction
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
      const extractor = new FraudExtractor(
        dataSource,
        'extractor1',
        'explorerUrl',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9'
      );
      const boxData = await extractor.getTxBlock('txId');
      expect(boxData).toEqual({
        id: 'blockId',
        height: 100,
      });
    });
  });

  describe('getUnspentFrauds', () => {
    /**
     * @target fraudExtractor.getUnspentFrauds should iterate on api when data count is more than api limit
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesUnspentByergotreeP1 explorer api to return 120 boxes
     * - mock extractBoxData
     * - call getUnspentFrauds
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
      const extractedFraud = {
        boxId: 'boxId',
        wid: 'wid',
        rwtCount: '10',
        triggerBoxId: 'triggerId',
        serialized: 'serialized',
      };
      const extractor = new FraudExtractor(
        dataSource,
        'extractor1',
        'explorerUrl',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9'
      );
      const spy = jest
        .spyOn(extractor, 'extractBoxData')
        .mockResolvedValue([extractedFraud]);
      const result = await extractor.getUnspentFrauds(100);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(result).toEqual([extractedFraud, extractedFraud]);
    });

    /**
     * @target fraudExtractor.getUnspentFrauds should filter the boxes with required token and initialHeight
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesUnspentByergotreeP1 to return 3 boxes with different conditions
     * - call getUnspentFrauds
     * - check the extractBoxData to have been called with the correct box
     * @expected
     * - should filter one box with proper height and token and extract its data
     */
    it('should filter the boxes with required token and initialHeight', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesUnspentByergotreeP1: async () => ({
            items: fraudApiOutputBoxes,
            total: 20,
          }),
        },
      } as any);
      const extractor = new FraudExtractor(
        dataSource,
        'extractor1',
        'explorerUrl',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9'
      );
      const spy = jest.spyOn(extractor, 'extractBoxData').mockResolvedValue([]);
      await extractor.getUnspentFrauds(110);
      expect(spy).toHaveBeenCalledWith([fraudApiOutputBoxes[0]]);
    });
  });

  describe('getFraudInfoWithBoxId', () => {
    /**
     * @target fraudExtractor.getFraudInfoWithBoxId should extract box info by boxId
     * @dependencies
     * @scenario
     * - mock box and extracted fraud
     * - mock getApiV1BoxesP1 to getApiV1BoxesP1 to return the box
     * - mock extractBoxData to return the extracted fraud
     * - run getFraudInfoWithBoxId
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
      const extractedFraud = {
        boxId: 'boxId',
        wid: 'wid',
        rwtCount: '10',
        triggerBoxId: 'triggerId',
        serialized: 'serialized',
      };
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesP1: async () => box,
        },
      } as any);
      const extractor = new FraudExtractor(
        dataSource,
        'extractor1',
        'explorerUrl',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9'
      );
      const spy = jest
        .spyOn(extractor, 'extractBoxData')
        .mockResolvedValue([extractedFraud]);
      const boxData = await extractor.getFraudInfoWithBoxId('boxId');
      expect(spy).toHaveBeenCalledWith([box]);
      expect(boxData).toEqual(extractedFraud);
    });

    /**
     * @target fraudExtractor.getFraudInfoWithBoxId should return undefined when box is forked
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesP1 to getApiV1BoxesP1 to throw Error
     * - mock extractBoxData to return the extracted fraud
     * - run getFraudInfoWithBoxId
     * - check the extractBoxData input and function output
     * @expected
     * - it should not call extractBoxData
     * - it should return undefined
     */
    it('should return undefined when box is forked', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesP1: async () => {
            throw new Error('404');
          },
        },
      } as any);
      const extractor = new FraudExtractor(
        dataSource,
        'extractor1',
        'explorerUrl',
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9'
      );
      const spy = jest.spyOn(extractor, 'extractBoxData').mockResolvedValue([]);
      const boxData = await extractor.getFraudInfoWithBoxId('boxId');
      expect(spy).not.toHaveBeenCalled();
      expect(boxData).toEqual(undefined);
    });
  });

  describe('validateOldStoredFrauds', () => {
    /**
     * @target fraudExtractor.validateOldStoredFrauds should remove invalid fraud from database
     * @dependencies
     * @scenario
     * - insert a mocked fraud in database
     * - mock getFraudInfoWithBoxId to return undefined (no information found for this fraud)
     * - run validateOldStoredFrauds
     * - check removing the fraud
     * @expected
     * - since fraud data doesn't exist in network, its invalid,
     * - it should remove the invalid fraud
     */
    it('should remove invalid fraud from database', async () => {
      insertFraudEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getFraudInfoWithBoxId')
        .mockResolvedValue(undefined);
      await extractor.validateOldStoredFrauds(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const box = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(box).toBeNull();
    });

    /**
     * @target fraudExtractor.validateOldStoredFrauds should update valid box information when spent bellow the initial height
     * @dependencies
     * @scenario
     * - insert a mocked box in database
     * - mock getFraudInfoWithBoxId to return box information
     * - run validateOldStoredFrauds
     * - check updated box fields
     * @expected
     * - it should update spending information of a valid box spent bellow the initial height
     */
    it('should update valid box information when spent bellow the initial height', async () => {
      insertFraudEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getFraudInfoWithBoxId')
        .mockResolvedValue({
          spendBlock: 'spendBlockId',
          spendHeight: 99,
        } as any);
      await extractor.validateOldStoredFrauds(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const box = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(box).not.toBeNull();
      expect(box!.spendBlock).toEqual('spendBlockId');
      expect(box!.spendHeight).toEqual(99);
    });

    /**
     * @target fraudExtractor.validateOldStoredFrauds should not change valid fraud information when spent after the initial height
     * @dependencies
     * @scenario
     * - insert a mocked fraud in database
     * - mock getFraudInfoWithBoxId to return fraud information
     * - run validateOldStoredFrauds
     * - check updated fraud fields
     * @expected
     * - it should not change the fraud information since its valid and spent after the initial height
     */
    it('should not change valid fraud information when spent after the initial height', async () => {
      insertFraudEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getFraudInfoWithBoxId')
        .mockResolvedValue({
          spendBlock: 'spendBlockId',
          spendHeight: 120,
        } as any);

      await extractor.validateOldStoredFrauds(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const box = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(box).not.toBeNull();
      expect(box!.spendBlock).toBeNull();
      expect(box!.spendHeight).toBeNull();
    });
  });

  describe('initializeBoxes', () => {
    /**
     * @target fraudExtractor.initializeBoxes should insert new found and validate the old existing fraud
     * @dependencies
     * @scenario
     * - insert a mocked fraud in database
     * - mock getUnspentFrauds to return new extracted fraud
     * - mock validateOldStoredFrauds
     * - run initializeBoxes
     * - should store the new fraud
     * - should call validateOldStoredFrauds with the old existing fraud
     * @expected
     * - it should store the new fraud (boxId2) information
     * - it should validate the existing fraud1 (boxId1)
     */
    it('should insert new found box and validate the old existing box', async () => {
      insertFraudEntity(dataSource, 'boxId1');
      const extractedFrauds: Array<ExtractedFraud> = [
        {
          boxId: 'boxId2',
          wid: 'wid2',
          rwtCount: '10',
          triggerBoxId: 'triggerId2',
          serialized: 'serialized2',
          blockId: 'blockId',
          height: 99,
          txId: 'txId',
        },
      ];
      jest
        .spyOn(extractor, 'getUnspentFrauds')
        .mockResolvedValue(extractedFrauds);
      const spy = jest
        .spyOn(extractor, 'validateOldStoredFrauds')
        .mockImplementation();
      await extractor.initializeBoxes(100);
      const box = await repository.findOne({ where: { boxId: 'boxId2' } });
      expect(box).not.toBeNull();
      expect(box?.wid).toEqual('wid2');
      expect(box?.creationBlock).toEqual('blockId');
      expect(box?.serialized).toEqual('serialized2');
      expect(box?.creationHeight).toEqual(99);
      expect(spy).toHaveBeenCalledWith(['boxId1'], 100);
    });

    /**
     * @target fraudExtractor.initializeBoxes should update the unspent existing fraud information
     * @dependencies
     * @scenario
     * - insert a mocked fraud in database
     * - mock getUnspentFrauds to return new extracted fraud
     * - mock validateOldStoredFrauds
     * - run initializeBoxes
     * - should update the unspent fraud information
     * - should call validateOldStoredFrauds with nothing
     * @expected
     * - it should update the existing fraud1 (boxId1) information
     * - it should not validate anything
     */
    it('should update the unspent existing fraud information', async () => {
      const extractedFrauds: Array<ExtractedFraud> = [
        {
          boxId: 'boxId1',
          wid: 'wid',
          rwtCount: '10',
          triggerBoxId: 'newTriggerId',
          serialized: 'newSerialized',
          blockId: 'blockId',
          height: 99,
          txId: 'txId',
        },
      ];
      jest
        .spyOn(extractor, 'getUnspentFrauds')
        .mockResolvedValue(extractedFrauds);
      const spy = jest
        .spyOn(extractor, 'validateOldStoredFrauds')
        .mockImplementation();
      insertFraudEntity(dataSource, 'boxId1');
      await extractor.initializeBoxes(100);
      const box = await repository.findOne({ where: { boxId: 'boxId1' } });
      expect(box).not.toBeNull();
      expect(box?.serialized).toEqual('newSerialized');
      expect(box?.triggerBoxId).toEqual('newTriggerId');
      expect(spy).toHaveBeenCalledWith([], 100);
    });
  });

  describe('extractBoxData', () => {
    /**
     * @target fraudExtractor.extractBoxData should extract fraud data from api output
     * @dependencies
     * @scenario
     * - call extractBoxData with api output
     * - check the extracted info
     * @expected
     * - should extract fraud data from api output
     */
    it('should extract fraud data from api output', async () => {
      jest.spyOn(extractor, 'getTriggerBoxId').mockResolvedValue('triggerId');
      const boxData = await extractor.extractBoxData([fraudBox]);
      expect(boxData[0]).toEqual(extractedFraud);
    });
  });
});
