import { DataSource, Repository } from 'typeorm';
import { Buffer } from 'buffer';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { permitTxGenerator, createDatabase } from './utilsFunctions.mock';
import PermitExtractor from '../../lib/extractor/PermitExtractor';
import PermitEntity from '../../lib/entities/PermitEntity';
import {
  addressBoxes,
  block,
  permitAddress,
  RWTId,
} from './utilsVariable.mock';
import { JsonBI } from '../../lib/utils';
import { ErgoNetworkType } from '@rosen-bridge/abstract-extractor';

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
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        RWTId
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
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        RWTId
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
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        RWTId
      );
      const tx1 = permitTxGenerator(true, 'ff11');
      const tx2 = permitTxGenerator(false, 'ff22');
      const tx3 = permitTxGenerator(true, 'ff33');
      const tx4 = permitTxGenerator(false, 'ff33');
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
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        RWTId
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

  describe('extractBoxData', () => {
    /**
     * @target permitExtractor.extractBoxData should extract permit data from box
     * @dependencies
     * @scenario
     * - call extractBoxData with box
     * - check the extract info
     * @expected
     * - should extract permit data from box
     */
    it('should extract permit data from api output', async () => {
      const extractor = new PermitExtractor(
        'extractor1',
        dataSource,
        ErgoNetworkType.Explorer,
        'explorerUrl',
        permitAddress,
        'RWT'
      );
      const boxData = await extractor.extractBoxData(addressBoxes.items[0]);
      expect(boxData).toEqual({
        boxId:
          '84c19f45cdfc7c35547deefe0e513a7e42919365c17f588536ef61b6885765f1',
        boxSerialized:
          '4JFDEBMEAAQABAQEAAQCBAAOIKKdm7DWIuuLT4OjTEqxt9Pxiqqrw6podpEqPrrw2hAYBAQEAAQABAABAQQCBAAEAAQADiBkzHLzKfXbe2lmehCvPhcmFhubfOkYp5TqgLnDLEzjiAUCAQHYB9YBsqVzAADWAoyy22MIp3MBAAHWA661tKVzArGl2QEDY5Gx22MIcgNzA9kBA2Ou22MIcgPZAQVNDpOMcgUBcgLWBOTGpwQa1gWypXMEANYG22MIcgXWB65yBtkBB00Ok4xyBwFyApWTjLLbYwhyAXMFAAFzBtGWgwMB73IDk4yy22MIsqRzBwBzCAABsnIEcwkAlXIHloMCAZOMsnIGcwoAAXICk8JyBcKncwvYAdYIwqfRloMFAe9yA5PCcgFyCJPkxnIBBBpyBJOMsttjCLKkcwwAcw0AAbJyBHMOAJVyB9gB1gmycgZzDwCWgwcBk4xyCQFyApPLwnIFcxDmxnIFBRrmxnIFBg6T5MZyBQcOy3IIk+TGcgUEGnIEk4xyCQJzEXMS54ESAUlyh7mh7/ZDeRJ3dEp0t9WYuDTcYT8uvJcuM3Z8YawrCQEOIDWCsSq0QTyah3hF6PrxjVRtGuEd3XuzZcARjHq+/dFXBzQ1DcR2DlWWr0TedyodAM7YI6OgKpm86AfHZA5LctsA',
        WID: '3582b12ab4413c9a877845e8faf18d546d1ae11ddd7bb365c0118c7abefdd157',
        txId: '0734350dc4760e5596af44de772a1d00ced823a3a02a99bce807c7640e4b72db',
      });
    });
  });
});
