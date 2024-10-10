import { DataSource, Repository } from 'typeorm';
import { Block } from '@rosen-bridge/abstract-extractor/lib/interfaces';

import { BoxEntityAction } from '../../lib/actions/boxAction';
import { createDatabase } from '../extractor/utils.mock';
import { BoxEntity } from '../../lib';
import { ExtractedBox } from '../../lib/interfaces/types';
import { block1, block2 } from './testData';

let dataSource: DataSource;
let action: BoxEntityAction;
let repository: Repository<BoxEntity>;

describe('BoxAction', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new BoxEntityAction(dataSource);
    repository = dataSource.getRepository(BoxEntity);
  });
  describe('storeBlockBoxes', () => {
    /**
     * store a box and check all stored information to be correct
     * Dependency: Nothing
     * Scenario: store one box
     * Expected: height, blockhash and box information must be correct
     */
    it('should checks boxes saved successfully', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor');
      expect(await repository.count()).toEqual(1);
      const stored = (await repository.find())[0];
      expect(stored.address).toEqual('address');
      expect(stored.boxId).toEqual('boxid');
      expect(stored.serialized).toEqual('serialized');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.createBlock).toEqual('block1');
    });

    /**
     * store an already stored box must update its content in database
     * Dependency: a stored box in database
     * Scenario: try to store above box into database
     * Expected: height, blockhash and box information must be correct
     */
    it('should update saved boxes successfully', async () => {
      await dataSource.getRepository(BoxEntity).insert({
        boxId: 'boxid',
        serialized: 'serialized-old',
        address: 'address-old',
        spendBlock: 'old spend',
        extractor: 'extractor',
        createBlock: 'create-block',
        creationHeight: 100,
      });
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized-new',
        address: 'address-new',
      };
      await action.insertBoxes([box], block1, 'extractor');
      expect(await repository.count()).toEqual(1);
      const stored = (await repository.find())[0];
      expect(stored.address).toEqual('address-new');
      expect(stored.boxId).toEqual('boxid');
      expect(stored.serialized).toEqual('serialized-new');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.createBlock).toEqual('block1');
    });

    /**
     * duplicate insert one box if extractor is different
     * Dependency: a stored box in database
     * Scenario: try to store above box with different extractor into database
     * Expected: new instance of box must inserted into database and height, blockhash and box information must be correct
     */
    it('should update saved boxes successfully', async () => {
      await dataSource.getRepository(BoxEntity).insert({
        boxId: 'boxid',
        serialized: 'serialized-old',
        address: 'address-old',
        spendBlock: 'old spend',
        extractor: 'extractor1',
        createBlock: 'create-block',
        creationHeight: 100,
      });
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized-new',
        address: 'address-new',
      };
      await action.insertBoxes([box], block1, 'extractor');
      expect(await repository.count()).toEqual(2);
      const stored = (await repository.findBy({ extractor: 'extractor' }))[0];
      expect(stored.address).toEqual('address-new');
      expect(stored.boxId).toEqual('boxid');
      expect(stored.serialized).toEqual('serialized-new');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.createBlock).toEqual('block1');
    });
  });

  describe('spendBoxes', () => {
    /**
     * spend box must update its corresponding box entity
     * Dependency: Stored box entity in database
     * Scenario: Call store block with stored box id
     * Expected: spendHeight of box in database must be updated
     */
    it('should set spendBlock on spend box', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor1');
      expect(await repository.count()).toEqual(1);
      await action.spendBoxes(
        [{ boxId: 'boxid', txId: 'txId', index: 0 }],
        { height: 100, hash: 'block1' } as Block,
        'extractor1'
      );
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toEqual('block1');
    });

    /**
     * spend box must not update other extractor
     * Dependency: Stored box entity in database
     * Scenario: Call store block with stored box id with different extractor
     * Expected: spendHeight of box must no changed
     */
    it("shouldn't change spend block of other extractor", async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor1');
      expect(await repository.count()).toEqual(1);
      await action.spendBoxes(
        [{ boxId: 'boxid', txId: 'txId', index: 0 }],
        { height: 100, hash: 'hash' } as Block,
        'extractor2'
      );
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toBeNull();
    });

    /**
     * create box must create a spend box when created and spend in same block
     * Dependency: Nothing
     * Scenario: call createBoxes with same boxes
     * Expected: must create a spend boxes
     */
    it('create a spend box in database', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor');
      await action.spendBoxes(
        [{ boxId: 'boxid', txId: 'txId', index: 0 }],
        { height: 100, hash: 'block1' } as Block,
        'extractor'
      );
      expect(await repository.count()).toEqual(1);
      const stored = (await repository.find())[0];
      expect(stored.creationHeight).toEqual(100);
      expect(stored.spendBlock).toEqual('block1');
      expect(stored.address).toEqual('address');
      expect(stored.boxId).toEqual('boxid');
      expect(stored.serialized).toEqual('serialized');
      expect(stored.createBlock).toEqual('block1');
    });
  });

  describe('deleteBlockBoxes', () => {
    /**
     * delete block boxes must delete created boxes
     * Dependency: Nothing
     * Scenario: create a box for specific block
     *           then call deleteBlockBoxes
     * Expected: must delete box from database
     */
    it('should delete box from database when call delete box with boxId', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor1');
      expect(await repository.count()).toEqual(1);
      await action.deleteBlockBoxes(block1.hash, 'extractor1');
      expect(await repository.count()).toEqual(0);
    });

    /**
     * delete block boxes must set spendBlock to null on fork
     * Dependency: A spent box with different created block and spend block
     * Scenario: insert an unspent box for specific block
     *           then call deleteBlockBoxes
     * Expected: must set spendBlock to null
     */
    it('should set spendBlock to null', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor1');
      await action.spendBoxes(
        [{ boxId: 'boxid', txId: 'txId', index: 0 }],
        block2,
        'extractor1'
      );
      expect(await repository.count()).toEqual(1);
      const boxEntity1 = (await repository.find())[0];
      expect(boxEntity1.spendBlock).not.toBeNull();
      await action.deleteBlockBoxes(block2.hash, 'extractor1');
      expect(await repository.count()).toEqual(1);
      const boxEntity2 = (await repository.find())[0];
      expect(boxEntity2.spendBlock).toBeNull();
    });

    /**
     * delete block boxes must not change other extractor boxes
     * Dependency: A spent box with different created block and spend block
     * Scenario: insert a spent box for specific block
     *           then call deleteBlockBoxes for other extractor
     * Expected: must not set spendBlock to null
     */
    it('should set spendBlock to null', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor1');
      await action.spendBoxes(
        [{ boxId: 'boxid', txId: 'txId', index: 0 }],
        block2,
        'extractor1'
      );
      expect(await repository.count()).toEqual(1);
      const boxEntity1 = (await repository.find())[0];
      expect(boxEntity1.spendBlock).not.toBeNull();
      await action.deleteBlockBoxes(block2.hash, 'extractor2');
      expect(await repository.count()).toEqual(1);
      const boxEntity2 = (await repository.find())[0];
      expect(boxEntity2.spendBlock).not.toBeNull();
    });

    /**
     * delete block boxes must delete boxes create and spend in one block
     * Dependency: A spent box with different created block and spend block
     * Scenario: create a box for specific block and spend it in same block
     *           then call deleteBlockBoxes for other extractor
     * Expected: must delete box
     */
    it('should set spendBlock to null', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor1');
      await action.spendBoxes(
        [{ boxId: 'boxid', txId: 'txId', index: 0 }],
        block1,
        'extractor1'
      );
      expect(await repository.count()).toEqual(1);
      const boxEntity1 = (await repository.find())[0];
      expect(boxEntity1.spendBlock).not.toBeNull();
      await action.deleteBlockBoxes(block1.hash, 'extractor1');
      expect(await repository.count()).toEqual(0);
    });
  });

  describe('removeAllData', () => {
    /**
     * @target boxAction.removeBox should remove the box in the database
     * @dependencies
     * @scenario
     * - insert a mocked box
     * - delete the box and check the deletion
     * @expected
     * - it should remove the box in the database
     */
    it('should remove the box in the database', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      await action.insertBoxes([box], block1, 'extractor');
      await action.removeAllData('extractor');
      expect(await repository.find()).toHaveLength(0);
    });
  });
});
