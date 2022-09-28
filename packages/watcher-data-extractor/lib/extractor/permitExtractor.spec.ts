import {
  clearDB,
  loadDataBase,
  permitTxGenerator,
} from './utilsFunctions.mock';
import PermitExtractor from './permitExtractor';
import PermitEntity from '../entities/PermitEntity';
import {
  addressBoxes,
  block,
  permitAddress,
  RWTId,
} from './utilsVariable.mock';
import { DataSource } from 'typeorm';
import { Buffer } from 'buffer';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { JsonBI } from '../network/parser';

let dataSource: DataSource;

describe('permitExtractor', () => {
  beforeAll(async () => {
    dataSource = await loadDataBase();
  });

  beforeEach(async () => {
    await clearDB(dataSource);
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
        'explorer',
        100
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
        'explorer',
        100
      );
      const tx1 = permitTxGenerator(true, 'ff11');
      const tx2 = permitTxGenerator(true, 'ff22');
      const tx3 = permitTxGenerator(true, 'ff33');
      const res = await extractor.processTransactions([tx1, tx2, tx3], block);
      expect(res).toBeTruthy();
      const repository = dataSource.getRepository(PermitEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(3);
      const permit1 = rows[0];
      const permit2 = rows[1];
      const permit3 = rows[2];
      const box1 = tx1.outputs().get(0);
      const box2 = tx2.outputs().get(0);
      const box3 = tx3.outputs().get(0);
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
        'explorer',
        100
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
      const repository = dataSource.getRepository(PermitEntity);
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
        'explorer',
        100
      );
      const tx1 = permitTxGenerator(true, 'wid1');
      const tx2 = permitTxGenerator(true, 'wid2');
      const tx3 = permitTxGenerator(true, 'wid3');
      await extractor.processTransactions([tx1, tx2, tx3], block);
      await extractor.forkBlock('hash');
      const repository = dataSource.getRepository(PermitEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(0);
    });
  });

  describe('initializeBoxes', () => {
    /**
     * initializing permits with old existing permits
     * Dependency: Nothing
     * Scenario: mocking explorer api then calling initial database
     * Expected: storing valid initial permits
     */
    it('should store initial permits', async () => {
      const extractor = new PermitExtractor(
        'extractorId',
        dataSource,
        'EE7687i4URb4YuSGSQXPCbAgnr73Bb67aXgwzpjguuNwyRrWwVamRPKsiE3hbewDFDzkQa2PDdQG1S3KGcPbbPqvaT15RXFcCELtrAJ5BeZJFf9EfumFNWKztr7Me5Z23TRUPNgbcYEpCkC3RJeui3Tv6jXbEF2v284inu65FisnWoicPvpbuJb3fHpLkr5JAFPcp6uGTqTaaNWMJxWrHRbpKtvwVjG2VibGBGZJPtMbG3pzryH7Aq6CtLKtCAkSivDUkQWbXpm7TuvMnRCL78LvdoqauB8fRHxxxMw5BbmhVqBsKigUa92WBJCdyM7efp5SM1EXvNskbDEtuHHiYbLPxBJHXvZWWa8XCKvbWVV5eWdWExzASe3KzPCDEFm5JY2Peq64SY5gz6yu9n23BxDtb7PueWCMYfJs2VaYcLbndFJpkcDJKDiaEm18wSd3oKQ9eENKNZ74H2JyqmjnX6yVXcecP6NUj5gE3N2b5Pm5MjL37wveibdWHeSRQZFepWQdVAK5TLTgDL9YEE4jv5RLqB6vZ5eMtfSjhZ2',
        '497287b9a1eff643791277744a74b7d598b834dc613f2ebc972e33767c61ac2b',
        'explorer',
        295140
      );
      const spy = jest
        .spyOn(extractor.explorerApi, 'getBoxesForAddress')
        .mockResolvedValue(addressBoxes);
      const spy2 = jest
        .spyOn(extractor.actions, 'storeInitialPermits')
        .mockImplementation(() => Promise.resolve(true));
      await extractor.initializeBoxes();
      const permit1 = ergoLib.ErgoBox.from_json(
        JsonBI.stringify(addressBoxes.items[1])
      );
      const permit2 = ergoLib.ErgoBox.from_json(
        JsonBI.stringify(addressBoxes.items[3])
      );
      const extracted = [
        {
          boxId:
            '4563bca501f0ffaac43464843f5343b82a42ebc9fa6e78d4d13faa4ca873daff',
          boxSerialized: Buffer.from(permit1.sigma_serialize_bytes()).toString(
            'base64'
          ),
          block:
            'f6acea8792c6dd98610d5cf50c191160e7c907868077cf6d0347428bf6a58d88',
          height: 295137,
          WID: '6eb97fd94107bd6d8a75b78b4229b5cd1af4ba9562038fa0bd5324306e1e1916',
        },
        {
          boxId:
            'df4aad257f5285621fdd1b5cb6e7b3d091cc551ed7952772bac9737e5660de2f',
          boxSerialized: Buffer.from(permit2.sigma_serialize_bytes()).toString(
            'base64'
          ),
          block:
            '80a5f45470674c59ec4d439487ea87fbeee43dead742aec82bc9d77d67c539f6',
          height: 284377,
          WID: 'a337e33042eaa1da67bcc7dfa5fcc444f63b8a695c9786494d7d22293eba542e',
        },
      ];
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith(extracted, 'extractorId');
    });
  });
});
