import {
  clearDB,
  eventTriggerTxGenerator,
  loadDataBase,
} from './utilsFunctions.mock';
import EventTriggerExtractor from './EventTriggerExtractor';
import EventTriggerEntity from '../entities/EventTriggerEntity';
import { block, eventTriggerAddress, RWTId } from './utilsVariable.mock';
import { DataSource } from 'typeorm';
import { sampleEventEntity } from '../actions/EventTrigger.spec';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { JsonBI } from '../network/parser';

let dataSource: DataSource;
const sampleEventData = [
  'f1',
  'ergo',
  'cardano',
  'addr1',
  'cardanoAddr2',
  '11',
  '22',
  '33',
  'a1',
  'a2',
  'b1',
];

describe('EventTriggerExtractor', () => {
  beforeAll(async () => {
    dataSource = await loadDataBase();
  });

  beforeEach(async () => {
    await clearDB(dataSource);
  });

  describe('getId', () => {
    /**
     * getting id of the extractor tests
     * Dependency: Nothing
     * Scenario: calling getId of CommitmentExtractor
     * Expected: getId should return 'extractorId'
     */
    it('should return id of the extractor', async () => {
      const extractor = new EventTriggerExtractor(
        'extractorId',
        dataSource,
        eventTriggerAddress,
        RWTId
      );
      const data = extractor.getId();
      expect(data).toBe('extractorId');
    });
  });

  describe('processTransaction', () => {
    /**
     * 1 valid eventTrigger should save successfully
     * Dependency: Nothing
     * Scenario: block with 1 transaction passed to the function and 1 of the transactions are valid eventTrigger
     * Expected: processTransactions should returns true and database row count should be 1
     */
    it('should save one eventTrigger successfully', async () => {
      const extractor = new EventTriggerExtractor(
        'extractorId',
        dataSource,
        eventTriggerAddress,
        RWTId
      );
      const tx1 = eventTriggerTxGenerator(true, ['ff'], sampleEventData);
      const res = await extractor.processTransactions([tx1], block);
      expect(res).toBeTruthy();
      const repository = dataSource.getRepository(EventTriggerEntity);
      const [event, rowsCount] = await repository.findAndCount();
      const box = ergoLib.ErgoBox.from_json(JsonBI.stringify(tx1.outputs[0]));
      expect(event[0]).toEqual({
        id: 1,
        extractor: 'extractorId',
        boxId: box.box_id().to_str(),
        boxSerialized: Buffer.from(box.sigma_serialize_bytes()).toString(
          'base64'
        ),
        block: 'hash',
        height: 10,
        toAddress: 'cardanoAddr2',
        fromChain: sampleEventData[1],
        toChain: sampleEventData[2],
        fromAddress: sampleEventData[3],
        amount: '17',
        bridgeFee: '34',
        networkFee: '51',
        sourceChainTokenId: sampleEventData[8],
        targetChainTokenId: sampleEventData[9],
        sourceTxId: sampleEventData[0],
        sourceBlockId: sampleEventData[10],
        WIDs: 'ff',
        spendBlock: null,
        spendHeight: null,
      });
      expect(rowsCount).toBe(1);
    });

    /**
     * 2 valid eventTrigger should save successfully
     * Dependency: Nothing
     * Scenario: block with 5 transaction passed to the function and 2 of the transactions are valid eventTrigger
     * Expected: processTransactions should returns true and database row count should be 2
     */
    it('should save 2 eventTrigger successfully out of 5 transaction', async () => {
      const dataSource = await loadDataBase('eventTriggerExtractor');
      const repository1 = dataSource.getRepository(EventTriggerEntity);
      const [, rowsCount1] = await repository1.findAndCount();
      expect(rowsCount1).toBe(0);
      const extractor = new EventTriggerExtractor(
        'extractorId',
        dataSource,
        eventTriggerAddress,
        RWTId
      );
      const tx1 = eventTriggerTxGenerator(true, ['wid1'], sampleEventData);
      const tx2 = eventTriggerTxGenerator(true, [], sampleEventData);
      const tx3 = eventTriggerTxGenerator(false, ['wid3'], sampleEventData);
      const tx4 = eventTriggerTxGenerator(true, ['wid4'], sampleEventData);
      const tx5 = eventTriggerTxGenerator(true, ['wid5'], []);
      const res = await extractor.processTransactions(
        [tx1, tx2, tx3, tx4, tx5],
        block
      );
      expect(res).toBeTruthy();
      const repository = dataSource.getRepository(EventTriggerEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(2);
    });
  });

  describe('forkBlock', () => {
    /**
     * forkBlock should delete events with specific block and extractor from database
     * Dependency:
     *  1- sample event data should insert to the empty database
     * Scenario: calling forkBlock with extractor with specific extractorId on the dataBase
     * Expected: afterCalling forkBlock database row count should be 2
     */
    it('should remove only block with specific block id and extractor', async () => {
      const extractor = new EventTriggerExtractor(
        'extractorId',
        dataSource,
        eventTriggerAddress,
        RWTId
      );
      const repository = dataSource.getRepository(EventTriggerEntity);
      await repository.insert([
        sampleEventEntity,
        {
          ...sampleEventEntity,
          boxId: '22',
          block: 'hash2',
          id: 2,
        },
        {
          ...sampleEventEntity,
          boxId: '33',
          extractor: 'secondExtractor',
          id: 3,
        },
      ]);
      await extractor.forkBlock('hash');
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(2);
      expect(rows[0].block).toBe('hash2');
      expect(rows[1].extractor).toBe('secondExtractor');
    });
  });
});
