import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { eventTriggerTxGenerator, createDatabase } from './utilsFunctions.mock';
import EventTriggerExtractor from '../../lib/extractor/EventTriggerExtractor';
import EventTriggerEntity from '../../lib/entities/EventTriggerEntity';
import {
  block,
  eventTriggerAddress,
  RWTId,
  spendTriggerTx,
  spendTriggerTxOldFormat,
} from './utilsVariable.mock';
import { JsonBI } from '../../lib/utils';
import { sampleEventEntity } from './utilsVariable.mock';
import { EventResult } from '../../lib';

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
  '12',
];
const permitAddress =
  'EE7687i4URb4YuSGSQXPCb7yjKwPzLkrEB4u6kZdScqCkeY81qy66Mz69ohJQhx9whKit1dh7VuPpzSeuadba8PcuitfKL6xnBhHYHXc7Uf6i6tq8NkqfZi1HToyAbVPz4LgnGE9sDbJqgvtord736pvsVmdfmRmTvaEQ8VTDx7RoK71VhEXuwqZF2UjWdY3G3DpmdWPGKprtLg4kjB4ikRpYG9eG9rF33ucgQ1hHmu1UeAUXqhv9e2U7VfF2X6D9js7zc4FXJb1ct4H56eEgwLbKRDAegkHUmeH1TJSknxRqTP1W97E9b9tSRj8P3CEi58J7GzmoWVJUg1ZXmQGAHfFUvDVC6Kif9tNE9rwuvp43QzoFVHcNdNCXxpUhBs7FkKHaW8mBVxzMoXQnpekVVuFePqgNL5CDQ8CjbmwHCSkvbRyXifVr8bCqmxytfEiyGMVzAZjEu3TcoERSJYRt2QwsaJ4wCneFUbm7kvNJ9rDgJS9wzHGLKtbgVbh1STbRwp5Zo6TtvrnQkUkf2sMcnpeZn6LfQSQwdJXdXr';
const fraudAddress =
  'LFz5FPkW7nPVq2NA5YcZncXBMTAy5KmfaAtw3Xbdkq8Uv8vntZ5gbA8NrCrZvGTXm3A8QG2qeaLQh97w6mFnunMYVN19iXAzC8mhraST6bM2oTqqPP6srsXTwTfNpe4t9p7WXPtrxxe2nbBkjgmbbRyZDwnbhv9KKcD9RgiMjZQ4LEY2eaYv19JKhmbEgXr7QRAniXwvscuFhypNvP3FZtMvUMV7wupeBUEDQV23RciS918eVvBp5';

describe('EventTriggerExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
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
        RWTId,
        permitAddress,
        fraudAddress
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
        RWTId,
        permitAddress,
        fraudAddress
      );
      const tx1 = eventTriggerTxGenerator(true, ['ff'], sampleEventData);
      const res = await extractor.processTransactions([tx1], block);
      expect(res).toBeTruthy();
      const repository = dataSource.getRepository(EventTriggerEntity);
      const [event, rowsCount] = await repository.findAndCount();
      const box = ergoLib.ErgoBox.from_json(JsonBI.stringify(tx1.outputs[0]));
      expect(event[0]).toEqual({
        id: 1,
        txId: tx1.id,
        eventId:
          '1e379d551cf0aed106c21a9f4b42ddd3b36349a93de799ed54d600acbe05d313',
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
        sourceChainHeight: 12594,
        sourceChainTokenId: sampleEventData[8],
        targetChainTokenId: sampleEventData[9],
        sourceTxId: sampleEventData[0],
        sourceBlockId: sampleEventData[10],
        WIDsCount: 1,
        WIDsHash:
          'ac4e4076a883937282f1377ef5cacb8edd00e3c79629e43532464eb3be277367',
        spendBlock: null,
        spendHeight: null,
        spendTxId: null,
        result: null,
        paymentTxId: null,
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
      const repository1 = dataSource.getRepository(EventTriggerEntity);
      const [, rowsCount1] = await repository1.findAndCount();
      expect(rowsCount1).toBe(0);
      const extractor = new EventTriggerExtractor(
        'extractorId',
        dataSource,
        eventTriggerAddress,
        RWTId,
        permitAddress,
        fraudAddress
      );
      const tx1 = eventTriggerTxGenerator(true, ['aa'], sampleEventData);
      const tx2 = eventTriggerTxGenerator(true, [], sampleEventData);
      const tx3 = eventTriggerTxGenerator(false, ['bb'], sampleEventData);
      const tx4 = eventTriggerTxGenerator(true, ['cc'], sampleEventData);
      const tx5 = eventTriggerTxGenerator(true, ['dd'], []);
      const res = await extractor.processTransactions(
        [tx1, tx2, tx3, tx4, tx5],
        block
      );
      expect(res).toBeTruthy();
      const repository = dataSource.getRepository(EventTriggerEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(2);
    });

    /**
     * @target EventTriggerExtractor.processTransactions should extract result and
     * paymentTxId of the event in old format succesfully and save them into db
     * @dependencies
     * - EventTriggerAction
     * @scenario
     * - mock `spendEventTriggers` function of action
     * - run test
     * - check if function got called with correct argument
     * @expected
     * - `spendEventTriggers` should have been called with 'succesful' result
     *   and expected paymentTxId
     */
    it('should extract result and paymentTxId of the event in old format succesfully and save them into db', async () => {
      // mock `spendEventTriggers` function of action
      const extractor = new EventTriggerExtractor(
        'extractorId',
        dataSource,
        eventTriggerAddress,
        RWTId,
        permitAddress,
        fraudAddress
      );
      const spendTriggerSpy = jest.spyOn(
        (extractor as any).actions,
        'spendEventTriggers'
      );
      spendTriggerSpy.mockResolvedValue(undefined);
      const tx1 = spendTriggerTxOldFormat;
      const res = await extractor.processTransactions([tx1], block);
      expect(res).toEqual(true);
      expect(spendTriggerSpy).toHaveBeenCalledWith(
        expect.any(Array),
        block,
        extractor.id,
        tx1.id,
        EventResult.successful,
        '8379c632717b8e1b2291e63b2345d5c54ca8506dc9f69d8761da12bfb2904f57'
      );
    });

    /**
     * @target EventTriggerExtractor.processTransactions should extract result and
     * paymentTxId of the event succesfully and save them into db
     * @dependencies
     * - EventTriggerAction
     * @scenario
     * - mock `spendEventTriggers` function of action
     * - run test
     * - check if function got called with correct argument
     * @expected
     * - `spendEventTriggers` should have been called with 'succesful' result
     *   and expected paymentTxId
     */
    it('should extract result and paymentTxId of the event succesfully and save them into db', async () => {
      // mock `spendEventTriggers` function of action
      const extractor = new EventTriggerExtractor(
        'extractorId',
        dataSource,
        eventTriggerAddress,
        RWTId,
        permitAddress,
        fraudAddress
      );
      const spendTriggerSpy = jest.spyOn(
        (extractor as any).actions,
        'spendEventTriggers'
      );
      spendTriggerSpy.mockResolvedValue(undefined);
      const tx1 = spendTriggerTx;
      const res = await extractor.processTransactions([tx1], block);
      expect(res).toEqual(true);
      expect(spendTriggerSpy).toHaveBeenCalledWith(
        expect.any(Array),
        block,
        extractor.id,
        tx1.id,
        EventResult.successful,
        '8379c632717b8e1b2291e63b2345d5c54ca8506dc9f69d8761da12bfb2904f57'
      );
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
        RWTId,
        permitAddress,
        fraudAddress
      );
      const repository = dataSource.getRepository(EventTriggerEntity);
      await repository.insert([
        sampleEventEntity,
        {
          ...sampleEventEntity,
          boxId: '22',
          block: 'hash2',
          sourceChainHeight: 12,
          id: 2,
        },
        {
          ...sampleEventEntity,
          boxId: '33',
          extractor: 'secondExtractor',
          sourceChainHeight: 15,
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
