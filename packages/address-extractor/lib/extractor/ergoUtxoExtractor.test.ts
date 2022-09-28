import { ErgoUTXOExtractor } from './ergoUtxoExtractor';
import { BoxEntity } from '../entities/boxEntity';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import {
  addressBoxes,
  generateBlockEntity,
  loadDataBase,
  tx1,
} from './utils.mock';
import { JsonBI } from '../network/parser';
import { Buffer } from 'buffer';

describe('extractorErgo', () => {
  describe('processTransactions', () => {
    /**
     * extract one box with address from transaction
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: stored one box with expected id and information into database
     */
    it('checks transaction by address', async () => {
      const dataSource = await loadDataBase('processTransactionErgo1');
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        1000,
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2'
      );
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await extractor.processTransactions([tx1], block);
      const repository = dataSource.getRepository(BoxEntity);
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
      const dataSource = await loadDataBase('processTransactionErgo2');
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        1000,
        undefined,
        ['ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367']
      );
      await extractor.processTransactions([tx1], block);
      const repository = dataSource.getRepository(BoxEntity);
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
      const dataSource = await loadDataBase('processTransactionErgo3');
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        1000,
        undefined,
        [
          'ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367',
          '3df73b29204ffa2085c38a958d322c86bee0471a5a1296b031f137236e038c6d',
        ]
      );
      await extractor.processTransactions([tx1], block);
      const repository = dataSource.getRepository(BoxEntity);
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
      const dataSource = await loadDataBase('processTransactionErgo4');
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        1000,
        '9hdcMw4sc8a8kUv7RLKomSsBCP5xc6fJ9HwR8tJf8kJLaJh4fY2',
        [
          'ba698c3c943e06ad224d42c736826f8dc38981fb92814f577a89c0ad9361c367',
          '3df73b29204ffa2085c38a958d322c86bee0471a5a1296b031f137236e038c6d',
        ]
      );
      await extractor.processTransactions([tx1], block);
      const repository = dataSource.getRepository(BoxEntity);
      expect(await repository.count()).toEqual(1);
      const boxEntity = (await repository.find())[0];
      expect(boxEntity.boxId).toEqual(
        '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542'
      );
    });
  });

  describe('initializeBoxes', () => {
    it('extracts the initial boxes and save into the database', async () => {
      const dataSource = await loadDataBase('processTransactionErgo4');
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        390000,
        '9eaHUvGekJKwEkMBvBY1h2iM9z2NijA7PRhFLGruwvff3Uc7WvZ'
      );
      const spy = jest
        .spyOn(extractor.explorerApi, 'getBoxesForAddress')
        .mockResolvedValue(addressBoxes);
      const spy2 = jest
        .spyOn(extractor.actions, 'storeInitialBoxes')
        .mockImplementation(() => Promise.resolve(true));
      await extractor.initializeBoxes();
      const box = ergoLib.ErgoBox.from_json(
        JsonBI.stringify(addressBoxes.items[0])
      );
      const extracted = {
        boxId:
          'a620ace127594b5fcc97f7362c007d5141340a32be4acef3f6f628d9583ffd06',
        address: '9eaHUvGekJKwEkMBvBY1h2iM9z2NijA7PRhFLGruwvff3Uc7WvZ',
        serialized: Buffer.from(box.sigma_serialize_bytes()).toString('base64'),
        blockId:
          '63069a60bb76a163fbaf8d3af3adf4fdc2d092d679d246b7a3247201f61d2a46',
        height: 295129,
      };
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith([extracted], 'extractor1');
    });
  });
});
