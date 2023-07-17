import { DataSource, Repository } from 'typeorm';
import { Buffer } from 'buffer';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import {
  permitTxGenerator,
  createDatabase,
  insertPermitEntity,
} from './utilsFunctions.mock';
import PermitExtractor from '../../lib/extractor/permitExtractor';
import PermitEntity from '../../lib/entities/PermitEntity';
import {
  addressBoxes,
  block,
  permitAddress,
  RWTId,
  sampleExtractedPermit,
} from './utilsVariable.mock';
import { JsonBI } from '../../lib/utils';
import { ExtractedPermit } from '../../lib/interfaces/extractedPermit';

jest.mock('@rosen-clients/ergo-explorer');
let dataSource: DataSource;
let repository: Repository<PermitEntity>;

describe('permitExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    repository = dataSource.getRepository(PermitEntity);
  });

  /**
   * getting id of the extractor tests
   * Dependency: Nothing
   * Scenario: calling getId of CommitmentExtractor
   * Expected: getId should return 'extractorId'
   */
  describe('getId', () => {
    it('should return id of the extractor', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        permitAddress,
        RWTId,
        'explorer'
      );
      const data = extractor.getId();
      expect(data).toBe('extractorId');
    });
  });
  describe('processTransactions', () => {
    /**
     * 3 valid commitment should save successfully
     * Dependency: Nothing
     * Scenario: block with 3 transaction passed to the function and 3 of the transactions are valid permit
     * Expected: processTransactions should returns true and database row count should be 3
     */
    it('should save 3 permits', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        permitAddress,
        RWTId,
        'explorer'
      );
      const tx1 = permitTxGenerator(true, 'ff11');
      const tx2 = permitTxGenerator(true, 'ff22');
      const tx3 = permitTxGenerator(true, 'ff33');
      const res = await extractor.processTransactions([tx1, tx2, tx3], block);
      expect(res).toBeTruthy();
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(3);
      const permit1 = rows[0];
      const permit2 = rows[1];
      const permit3 = rows[2];
      const box1 = ergoLib.ErgoBox.from_json(JsonBI.stringify(tx1.outputs[0]));
      const box2 = ergoLib.ErgoBox.from_json(JsonBI.stringify(tx2.outputs[0]));
      const box3 = ergoLib.ErgoBox.from_json(JsonBI.stringify(tx3.outputs[0]));
      expect(permit1).toEqual({
        id: 1,
        WID: 'ff11',
        extractor: 'extractorId',
        boxId: box1.box_id().to_str(),
        boxSerialized: Buffer.from(box1.sigma_serialize_bytes()).toString(
          'base64'
        ),
        block: 'hash',
        height: 10,
        spendBlock: null,
        spendHeight: null,
        txId: tx1.id,
      });
      expect(permit2).toEqual({
        id: 2,
        WID: 'ff22',
        extractor: 'extractorId',
        boxId: box2.box_id().to_str(),
        boxSerialized: Buffer.from(box2.sigma_serialize_bytes()).toString(
          'base64'
        ),
        block: 'hash',
        height: 10,
        spendBlock: null,
        spendHeight: null,
        txId: tx2.id,
      });
      expect(permit3).toEqual({
        id: 3,
        WID: 'ff33',
        extractor: 'extractorId',
        boxId: box3.box_id().to_str(),
        boxSerialized: Buffer.from(box3.sigma_serialize_bytes()).toString(
          'base64'
        ),
        block: 'hash',
        height: 10,
        spendBlock: null,
        spendHeight: null,
        txId: tx3.id,
      });
    });

    /**
     * 3 valid commitment should save successfully
     * Dependency: Nothing
     * Scenario: block with 3 transaction passed to the function and 2 of the transactions are valid permit
     * Expected: processTransactions should returns true and database row count should be 2
     */
    it('should save 2 permits out of 3 transaction', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        permitAddress,
        RWTId,
        'explorer'
      );
      const tx1 = permitTxGenerator(true, 'wid1');
      const tx2 = permitTxGenerator(false, 'wid2');
      const tx3 = permitTxGenerator(true, 'wid3');
      const tx4 = permitTxGenerator(false, 'wid3');
      const res = await extractor.processTransactions(
        [tx1, tx2, tx3, tx4],
        block
      );
      expect(res).toBeTruthy();
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(2);
    });
  });
  describe('forkBlock', () => {
    /**
     * forkBlock should delete block from database
     * Dependency: Nothing
     * Scenario: 3 valid permit saved in the dataBase, and then we call forkBlock
     * Expected: afterCalling forkBlock database row count should be 0
     */
    it('should remove only block with specific block id and extractor id', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        permitAddress,
        RWTId,
        'explorer'
      );
      const tx1 = permitTxGenerator(true, 'wid1');
      const tx2 = permitTxGenerator(true, 'wid2');
      const tx3 = permitTxGenerator(true, 'wid3');
      await extractor.processTransactions([tx1, tx2, tx3], block);
      await extractor.forkBlock('hash');
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(0);
    });
  });

  describe('extractPermitData', () => {
    /**
     * @target permitExtractor.extractPermitData should extract permit data from api output
     * @dependencies
     * @scenario
     * - call extractPermitData with api output
     * - check the extract info
     * @expected
     * - should extract permit data from api output
     */
    it('should extract permit data from api output', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1TransactionsP1: async () => ({
            blockId: 'blockId',
            inclusionHeight: 100,
          }),
        },
      } as any);
      const extractor = new PermitExtractor(
        'extractor1',
        dataSource,
        permitAddress,
        'RWT',
        'url'
      );
      const boxData = await extractor.extractPermitData([
        addressBoxes.items[0],
      ]);
      expect(boxData[0]).toEqual({
        boxId:
          'd4e292dbd4df2378f1392044b43922540ae7a0e9e9c3553549aa39557372e671',
        boxSerialized:
          '4JFDEBMEAAQABAQEAAQCBAAOIKKdm7DWIuuLT4OjTEqxt9Pxiqqrw6podpEqPrrw2hAYBAQEAAQABAABAQQCBAAEAAQADiBkzHLzKfXbe2lmehCvPhcmFhubfOkYp5TqgLnDLEzjiAUCAQHYB9YBsqVzAADWAoyy22MIp3MBAAHWA661tKVzArGl2QEDY5Gx22MIcgNzA9kBA2Ou22MIcgPZAQVNDpOMcgUBcgLWBOTGpwQa1gWypXMEANYG22MIcgXWB65yBtkBB00Ok4xyBwFyApWTjLLbYwhyAXMFAAFzBtGWgwMB73IDk4yy22MIsqRzBwBzCAABsnIEcwkAlXIHloMCAZOMsnIGcwoAAXICk8JyBcKncwvYAdYIwqfRloMFAe9yA5PCcgFyCJPkxnIBBBpyBJOMsttjCLKkcwwAcw0AAbJyBHMOAJVyB9gB1gmycgZzDwCWgwcBk4xyCQFyApPLwnIFcxDmxnIFBRrmxnIFBg6T5MZyBQcOy3IIk+TGcgUEGnIEk4xyCQJzEXMS54ESAUlyh7mh7/ZDeRJ3dEp0t9WYuDTcYT8uvJcuM3Z8YawrCQIaASA1grEqtEE8mod4Rej68Y1UbRrhHd17s2XAEYx6vv3RVw4BAEphs0e8grYfVpBBcUI+va+evhIh9fkw5pEOPmn2J2wjAA==',
        WID: '3582b12ab4413c9a877845e8faf18d546d1ae11ddd7bb365c0118c7abefdd157',
        txId: '4a61b347bc82b61f56904171423ebdaf9ebe1221f5f930e6910e3e69f6276c23',
        block:
          '29344bbae793ed459fed6ab319ce618b3a77b4fe9c41fb7d7f8f067e4f4a24bf',
        height: 295145,
        spendBlock: 'blockId',
        spendHeight: 100,
      });
    });
  });

  describe('getTxBlock', () => {
    /**
     * @target permitExtractor.getTxBlock should extract block id and height for a transaction
     * @dependencies
     * @scenario
     * - call getTxBlock with api output
     * - check the extract info
     * @expected
     * - should extract permit data from api output
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
      const extractor = new PermitExtractor(
        'extractor1',
        dataSource,
        permitAddress,
        'RWT',
        'url'
      );
      const boxData = await extractor.getTxBlock('txId');
      expect(boxData).toEqual({
        id: 'blockId',
        height: 100,
      });
    });
  });

  describe('getAllUnspentPermits', () => {
    /**
     * @target permitExtractor.getAllUnspentPermits should iterate on api when data count is more than api limit
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesUnspentBytokenidP1 explorer api to return 120 boxes
     * - mock extractBoxData
     * - call getAllUnspentPermits
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
      const extractor = new PermitExtractor(
        'extractor1',
        dataSource,
        permitAddress,
        'RWT',
        'url'
      );
      const spy = jest
        .spyOn(extractor, 'extractPermitData')
        .mockResolvedValue([sampleExtractedPermit]);
      const result = await extractor.getAllUnspentPermits(100);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(result).toEqual([sampleExtractedPermit, sampleExtractedPermit]);
    });

    /**
     * @target permitExtractor.getAllUnspentPermits should filter the permits created bellow the initialHeight
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesUnspentBytokenidP1 to return 3 permits with different conditions
     * - call getAllUnspentPermits
     * - check the extractPermitData to have been called with the correct permit
     * @expected
     * - should filter one permit with proper height and extract its data
     */
    it('should filter the permits created bellow the initialHeight', async () => {
      const boxes = [
        {
          creationHeight: 100,
        },
        {
          creationHeight: 120,
        },
      ];
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesUnspentByergotreeP1: async () => ({
            items: boxes,
            total: 20,
          }),
        },
      } as any);
      const extractor = new PermitExtractor(
        'extractor1',
        dataSource,
        permitAddress,
        'RWT',
        'url'
      );
      const spy = jest
        .spyOn(extractor, 'extractPermitData')
        .mockResolvedValue([]);
      await extractor.getAllUnspentPermits(110);
      expect(spy).toHaveBeenCalledWith([boxes[0]]);
    });
  });

  describe('getPermitWithBoxId', () => {
    /**
     * @target permitExtractor.getPermitWithBoxId should extract permit info by boxId
     * @dependencies
     * @scenario
     * - mock getApiV1BoxesP1 to getApiV1BoxesP1 to return a mocked permit
     * - mock extractBoxData to return the extracted permit
     * - run getPermitWithBoxId
     * - check the extractBoxData input and function output
     * @expected
     * - it should call extractBoxData with proper data
     * - it should return the extracted information correctly
     */
    it('should extract permit info by boxId', async () => {
      const box = {
        boxId: 'boxId',
      };
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesP1: async () => box,
        },
      } as any);
      const extractor = new PermitExtractor(
        'extractor1',
        dataSource,
        permitAddress,
        'RWT',
        'url'
      );
      const spy = jest
        .spyOn(extractor, 'extractPermitData')
        .mockResolvedValue([sampleExtractedPermit]);
      const boxData = await extractor.getPermitWithBoxId('boxId');
      expect(spy).toHaveBeenCalledWith([box]);
      expect(boxData).toEqual(sampleExtractedPermit);
    });
  });

  describe('validateOldStoredPermits', () => {
    let extractor: PermitExtractor;
    beforeEach(() => {
      extractor = new PermitExtractor(
        'extractor',
        dataSource,
        permitAddress,
        'RWT',
        'url'
      );
    });

    /**
     * @target PermitExtractor.validateOldStoredPermits should remove invalid permit from database
     * @dependencies
     * @scenario
     * - insert a mocked permit in database
     * - mock getPermitWithBoxId to return undefined (no information found for this permit)
     * - run validateOldStoredPermits
     * - check removing the permit
     * @expected
     * - since permit data doesn't exist in network, its invalid,
     * - it should remove the invalid permit
     */
    it('should remove invalid permit from database', async () => {
      await insertPermitEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getPermitWithBoxId')
        .mockResolvedValue(undefined);

      await extractor.validateOldStoredPermits(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const permit = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(permit).toBeNull();
    });

    /**
     * @target PermitExtractor.validateOldStoredPermits should update valid permit information when spent bellow the initial height
     * @dependencies
     * @scenario
     * - insert a mocked box in database
     * - mock getPermitWithBoxId to return box information
     * - run validateOldStoredPermits
     * - check updated box fields
     * @expected
     * - it should update spending information of a valid permit spent bellow the initial height
     */
    it('should update valid box information when spent bellow the initial height', async () => {
      await insertPermitEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getPermitWithBoxId')
        .mockResolvedValue({
          spendBlock: 'spendBlockId',
          spendHeight: 99,
        } as any);

      await extractor.validateOldStoredPermits(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const permit = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(permit).not.toBeNull();
      expect(permit!.spendBlock).toEqual('spendBlockId');
      expect(permit!.spendHeight).toEqual(99);
    });

    /**
     * @target PermitExtractor.validateOldStoredPermits should not change valid permit information when spent after the initial height
     * @dependencies
     * @scenario
     * - insert a mocked permit in database
     * - mock getPermitWithBoxId to return permit information
     * - run validateOldStoredPermits
     * - check updated permit fields
     * @expected
     * - it should not change the permit information since its valid and spent after the initial height
     */
    it('should not change valid permit information when spent after the initial height', async () => {
      await insertPermitEntity(dataSource, 'boxId');
      const spy = jest
        .spyOn(extractor, 'getPermitWithBoxId')
        .mockResolvedValue({
          spendBlock: 'spendBlockId',
          spendHeight: 120,
        } as any);

      await extractor.validateOldStoredPermits(['boxId'], 100);
      expect(spy).toHaveBeenCalledWith('boxId');
      const permit = await repository.findOne({ where: { boxId: 'boxId' } });
      expect(permit).not.toBeNull();
      expect(permit!.spendBlock).toBeNull();
      expect(permit!.spendHeight).toBeNull();
    });
  });

  describe('initializeBoxes', () => {
    let extractor: PermitExtractor;
    beforeEach(() => {
      extractor = new PermitExtractor(
        'extractor',
        dataSource,
        permitAddress,
        'RWT',
        'url'
      );
    });

    /**
     * @target PermitExtractor.initializeBoxes should insert new found permit and validate the old existing permit
     * @dependencies
     * @scenario
     * - insert a mocked bpermitox in database
     * - mock getUnspentBoxes to return new extracted permit
     * - mock validateOldStoredPermits
     * - run initializeBoxes
     * - should store the new permit
     * - should call validateOldStoredPermits with the old existing permit
     * @expected
     * - it should store the new permit2 (boxId2) information
     * - it should validate the existing permit1 (boxId1)
     */
    it('should insert new found permit and validate the old existing permit', async () => {
      await insertPermitEntity(dataSource, 'boxId1');
      const extractedPermit: ExtractedPermit = {
        boxId: 'boxId2',
        txId: 'txId',
        boxSerialized: 'serialized2',
        block: 'blockId2',
        height: 99,
        WID: 'wid2',
      };
      jest
        .spyOn(extractor, 'getAllUnspentPermits')
        .mockResolvedValue([extractedPermit]);
      const spy = jest
        .spyOn(extractor, 'validateOldStoredPermits')
        .mockImplementation();
      await extractor.initializeBoxes(100);
      const permit = await repository.findOne({ where: { boxId: 'boxId2' } });
      expect(permit).not.toBeNull();
      expect(permit?.boxId).toEqual('boxId2');
      expect(permit?.block).toEqual('blockId2');
      expect(permit?.boxSerialized).toEqual('serialized2');
      expect(permit?.height).toEqual(99);
      expect(permit?.WID).toEqual('wid2');
      expect(spy).toHaveBeenCalledWith(['boxId1'], 100);
    });

    /**
     * @target PermitExtractor.initializeBoxes should update the unspent existing permit information
     * @dependencies
     * @scenario
     * - insert a mocked permit in database
     * - mock getUnspentBoxes to return new extracted permit
     * - mock validateOldStoredPermits
     * - run initializeBoxes
     * - should update the unspent permit information
     * - should call validateOldStoredPermits with nothing
     * @expected
     * - it should update the existing permit1 (boxId1) information
     * - it should not validate anything
     */
    it('should update the unspent existing permit information', async () => {
      const extractedPermit: ExtractedPermit = {
        boxId: 'boxId1',
        txId: 'txId',
        boxSerialized: 'newSerialized',
        block: 'blockId',
        height: 100,
        WID: 'wid',
      };
      jest
        .spyOn(extractor, 'getAllUnspentPermits')
        .mockResolvedValue([extractedPermit]);
      const spy = jest
        .spyOn(extractor, 'validateOldStoredPermits')
        .mockImplementation();
      await insertPermitEntity(dataSource, 'boxId1');
      await extractor.initializeBoxes(100);
      const permit = await repository.findOne({ where: { boxId: 'boxId1' } });
      expect(permit).not.toBeNull();
      expect(permit?.boxSerialized).toEqual('newSerialized');
      expect(spy).toHaveBeenCalledWith([], 100);
    });
  });
});
