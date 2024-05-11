import { DataSource } from 'typeorm';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { commitmentTxGenerator, createDatabase } from './utilsFunctions.mock';
import CommitmentExtractor from '../../lib/abstract-extractor/commitmentExtractor';
import CommitmentEntity from '../../lib/entities/CommitmentEntity';
import { block, commitmentAddress, RWTId } from './utilsVariable.mock';
import { JsonBI } from '../../lib/utils';

let dataSource: DataSource;

describe('CommitmentExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });

  /**
   * getting id of the extractor tests
   * Dependency: Nothing
   * Scenario: calling getId of CommitmentExtractor
   * Expected: getId should return 'extractorId'
   */
  describe('getId', () => {
    it('should return id of the extractor', async () => {
      const extractor = new CommitmentExtractor(
        'extractorId',
        [commitmentAddress],
        RWTId,
        dataSource
      );
      const data = extractor.getId();
      expect(data).toBe('extractorId');
    });
  });

  describe('processTransaction', () => {
    /**
     * 2 valid commitment should save successfully
     * Dependency: Nothing
     * Scenario: block with 3 transaction passed to the function and 2 of the transactions are valid commitment
     * Expected: processTransactions should returns true and database row count should be 2
     */
    it('should save 2 commitments', async () => {
      const extractor = new CommitmentExtractor(
        'extractorId',
        [commitmentAddress],
        RWTId,
        dataSource
      );
      const tx1 = commitmentTxGenerator(true, 'f1', '11', 'd1');
      const tx2 = commitmentTxGenerator(true, 'f2', '22', 'd2');
      const tx3 = commitmentTxGenerator(false, 'f3', '33', 'd3');
      const res = await extractor.processTransactions([tx1, tx3, tx2], block);
      expect(res).toBeTruthy();
      const repository = dataSource.getRepository(CommitmentEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(2);
      const commitment1 = rows[0];
      const commitment2 = rows[1];
      const box1 = ergoLib.ErgoBox.from_json(JsonBI.stringify(tx1.outputs[0]));
      const box2 = ergoLib.ErgoBox.from_json(JsonBI.stringify(tx2.outputs[0]));
      expect(commitment1).toEqual({
        id: 1,
        txId: tx1.id,
        WID: 'f1',
        commitment: 'd1',
        eventId: '11',
        boxId: box1.box_id().to_str(),
        boxSerialized: Buffer.from(box1.sigma_serialize_bytes()).toString(
          'base64'
        ),
        extractor: 'extractorId',
        block: 'hash',
        height: 10,
        spendBlock: null,
        spendHeight: null,
        spendTxId: null,
        spendIndex: null,
        rwtCount: '10',
      });
      expect(commitment2).toEqual({
        id: 2,
        txId: tx2.id,
        WID: 'f2',
        commitment: 'd2',
        eventId: '22',
        boxId: box2.box_id().to_str(),
        boxSerialized: Buffer.from(box2.sigma_serialize_bytes()).toString(
          'base64'
        ),
        extractor: 'extractorId',
        block: 'hash',
        height: 10,
        spendBlock: null,
        spendHeight: null,
        spendTxId: null,
        spendIndex: null,
        rwtCount: '10',
      });
    });
  });

  describe('forkBlock', () => {
    /**
     * forkBlock should delete block from database
     * Dependency: Nothing
     * Scenario: 2 valid commitment saved in the dataBase, and then we call forkBlock
     * Expected: afterCalling forkBlock database row count should be 0
     */
    it('should remove only block with specific block id and extractor id', async () => {
      const extractor = new CommitmentExtractor(
        'extractorId',
        [commitmentAddress],
        RWTId,
        dataSource
      );
      const tx1 = commitmentTxGenerator(true, 'wid1', '1', 'digest1');
      const tx2 = commitmentTxGenerator(true, 'wid2', '2', 'digest2');
      const tx3 = commitmentTxGenerator(false, 'wid2', '2', 'digest2');
      await extractor.processTransactions([tx1, tx2, tx3], block);
      await extractor.forkBlock('hash');
      const repository = dataSource.getRepository(CommitmentEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toBe(0);
    });
  });
});
