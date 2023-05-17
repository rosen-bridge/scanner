import { ErgoUTXOExtractor } from '../../lib';
import { BoxEntity } from '../../lib';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import {
  addressBoxes,
  generateBlockEntity,
  loadDataBase,
  tokenBoxes,
  tx1,
} from './utils.mock';
import { JsonBI } from '../../lib/network/parser';
import { Buffer } from 'buffer';
import ExtractedBox from '../../lib/interfaces/ExtractedBox';

describe('extractorErgo', () => {
  describe('processTransactions', () => {
    /**
     * extract one box with address from transaction
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: stored one box with expected id and information into database
     */
    it('checks transaction by address', async () => {
      const dataSource = await loadDataBase();
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
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
      const dataSource = await loadDataBase();
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
      const dataSource = await loadDataBase();
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
      const dataSource = await loadDataBase();
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
      const repository = dataSource.getRepository(BoxEntity);
      expect(await repository.count()).toEqual(1);
      const boxEntity = (await repository.find())[0];
      expect(boxEntity.boxId).toEqual(
        '03a6b9d06c50e8895a1e1c02365d1e2e4becd71efe188b341ca84b228ee26542'
      );
    });
  });

  describe('initializeBoxes', () => {
    let extractedBox1: ExtractedBox, extractedBox2: ExtractedBox;
    beforeAll(() => {
      const box1 = ergoLib.ErgoBox.from_json(
        JsonBI.stringify(addressBoxes.items[0])
      );
      const box2 = ergoLib.ErgoBox.from_json(
        JsonBI.stringify(addressBoxes.items[1])
      );
      extractedBox1 = {
        boxId:
          'bc44f3f1110abb9ada12c4cf62c759b0c1ed911cca9b608f85f7ba141dff602d',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        serialized: Buffer.from(box1.sigma_serialize_bytes()).toString(
          'base64'
        ),
        blockId:
          'eedc45c53ecd32d565ae04badf86aa2448a657b7c9e8e30a612338a9c0eb06d9',
        height: 297230,
      };
      extractedBox2 = {
        boxId:
          '25e73eaeed1117ad896f01f5dafe02630b58048c39012094ca8c561dc90765b5',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        serialized: Buffer.from(box2.sigma_serialize_bytes()).toString(
          'base64'
        ),
        blockId:
          '938d088d28030f17fa505283b4d0a1abbcd0b57e78399b3ab1fe03799374929c',
        height: 249174,
      };
    });

    /**
     * extract two boxes with the specified address
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: extract two box and store it into the database
     */
    it('extracts the initial boxes with address', async () => {
      const dataSource = await loadDataBase();
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',

        '9eaHUvGekJKwEkMBvBY1h2iM9z2NijA7PRhFLGruwvff3Uc7WvZ'
      );
      const spy = jest
        .spyOn(extractor.explorerApi, 'getBoxesForAddress')
        .mockResolvedValue(addressBoxes);
      const spy2 = jest
        .spyOn(extractor.actions, 'storeInitialBoxes')
        .mockImplementation(() => Promise.resolve(true));
      await extractor.initializeBoxes(390000);
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith(
        [extractedBox1, extractedBox2],
        390000,
        'extractor1'
      );
    });

    /**
     * extract one box with the specified address and token
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: extract one box and store it into the database
     */
    it('extracts one initial box with address and token', async () => {
      const dataSource = await loadDataBase();
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        '9eaHUvGekJKwEkMBvBY1h2iM9z2NijA7PRhFLGruwvff3Uc7WvZ',
        ['03689941746717cddd05c52f454e34eb6e203a84f931fdc47c52f44589f83496']
      );
      const spy = jest
        .spyOn(extractor.explorerApi, 'getBoxesForAddress')
        .mockResolvedValue(addressBoxes);
      const spy2 = jest
        .spyOn(extractor.actions, 'storeInitialBoxes')
        .mockImplementation(() => Promise.resolve(true));
      await extractor.initializeBoxes(390000);
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith([extractedBox1], 390000, 'extractor1');
    });

    /**
     * extract one box with the specified token
     * Dependency: nothing
     * Scenario: pass one transaction to method
     * Expected: extract one box and store it into the database
     */
    it('extracts the initial boxes with token', async () => {
      const dataSource = await loadDataBase();
      const extractor = new ErgoUTXOExtractor(
        dataSource,
        'extractor1',
        ergoLib.NetworkPrefix.Mainnet,
        'https://explorer.ergoplatform.com/',
        undefined,
        ['03689941746717cddd05c52f454e34eb6e203a84f931fdc47c52f44589f83496']
      );
      const spy = jest
        .spyOn(extractor.explorerApi, 'getBoxesByTokenId')
        .mockResolvedValue(tokenBoxes);
      const spy2 = jest
        .spyOn(extractor.actions, 'storeInitialBoxes')
        .mockImplementation(() => Promise.resolve(true));
      await extractor.initializeBoxes(390000);
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith([extractedBox1], 390000, 'extractor1');
    });
  });
});
