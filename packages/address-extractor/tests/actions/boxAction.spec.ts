import { DataSource, Repository } from 'typeorm';
import { DummyLogger } from '@rosen-bridge/logger-interface';

import { BoxEntityAction } from '../../lib/actions/boxAction';
import { generateBlockEntity, createDatabase } from '../extractor/utils.mock';
import { BoxEntity } from '../../lib';
import { ExtractedBox } from '../../lib/interfaces/types';

const logger = new DummyLogger();
let dataSource: DataSource;
let action: BoxEntityAction;
let repository: Repository<BoxEntity>;

describe('BoxAction', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new BoxEntityAction(dataSource, logger);
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], [], block, 'extractor');
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], [], block, 'extractor');
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], [], block, 'extractor');
      expect(await repository.count()).toEqual(2);
      const stored = (await repository.findBy({ extractor: 'extractor' }))[0];
      expect(stored.address).toEqual('address-new');
      expect(stored.boxId).toEqual('boxid');
      expect(stored.serialized).toEqual('serialized-new');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.createBlock).toEqual('block1');
    });

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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], [], block, 'extractor1');
      expect(await repository.count()).toEqual(1);
      await action.storeBox([], ['boxid'], block, 'extractor1');
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], [], block, 'extractor1');
      expect(await repository.count()).toEqual(1);
      await action.storeBox([], ['boxid'], block, 'extractor2');
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], ['boxid'], block, 'extractor');
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], [], block, 'extractor1');
      expect(await repository.count()).toEqual(1);
      await action.deleteBlockBoxes(block.hash, 'extractor1');
      expect(await repository.count()).toEqual(0);
    });

    /**
     * delete block boxes must set spendBlock to null on fork
     * Dependency: A spent box with different created block and spend block
     * Scenario: create a box for specific block
     *           then spent it in other block
     *           then call deleteBlockBoxes
     * Expected: must set spendBlock to null
     */
    it('should set spendBlock to null', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      const block1 = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const block2 = generateBlockEntity(dataSource, 'block2', 'block1', 101);
      await action.storeBox([box], [], block1, 'extractor1');
      await action.storeBox([], ['boxid'], block2, 'extractor1');
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
     * Scenario: create a box for specific block
     *           then spent it in other block
     *           then call deleteBlockBoxes for other extractor
     * Expected: must not set spendBlock to null
     */
    it('should set spendBlock to null', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      const block1 = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      const block2 = generateBlockEntity(dataSource, 'block2', 'block1', 101);
      await action.storeBox([box], [], block1, 'extractor1');
      await action.storeBox([], ['boxid'], block2, 'extractor1');
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], ['boxid'], block, 'extractor1');
      expect(await repository.count()).toEqual(1);
      const boxEntity1 = (await repository.find())[0];
      expect(boxEntity1.spendBlock).not.toBeNull();
      await action.deleteBlockBoxes(block.hash, 'extractor1');
      expect(await repository.count()).toEqual(0);
    });
  });

  describe('insertBox', () => {
    /**
     * @target boxAction.insertBox should insert the new box at initialization
     * @dependencies
     * @scenario
     * - insert an initial box
     * - fetch and check the box information
     * @expected
     * - it should insert the new box
     */
    it('should insert the new box at initialization', async () => {
      const box: ExtractedBox = {
        boxId: 'boxId',
        serialized: 'serialized',
        address: 'address',
        blockId: 'blockId',
        height: 100,
      };
      await action.insertBox(box, 'extractor');
      const stored = (await repository.find())[0];
      expect(stored.address).toEqual('address');
      expect(stored.boxId).toEqual('boxId');
      expect(stored.serialized).toEqual('serialized');
      expect(stored.creationHeight).toEqual(100);
      expect(stored.createBlock).toEqual('blockId');
    });
  });

  describe('updateBox', () => {
    /**
     * @target boxAction.updateBox should update the unspent box information
     * @dependencies
     * @scenario
     * - insert a mocked box
     * - update the box with new spend block information
     * - fetch that box and check the result
     * @expected
     * - it should remove the spend block and spend height from existing entity
     */
    it('should update the unspent box information', async () => {
      await dataSource.getRepository(BoxEntity).insert({
        boxId: 'boxId',
        serialized: 'serialized',
        address: 'address',
        extractor: 'extractor',
        createBlock: 'createBlock',
        creationHeight: 100,
        spendBlock: 'spendBlock',
        spendHeight: 109,
      });
      const box: ExtractedBox = {
        boxId: 'boxId',
        serialized: 'serialized',
        address: 'address',
        blockId: 'createBlock',
        height: 100,
      };
      await action.updateBox(box, 'extractor');
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toBeNull();
      expect(stored.spendHeight).toEqual(0);
    });
  });

  describe('getAllBoxIds', () => {
    /**
     * @target boxAction.getAllBoxIds should return all boxIds in the database
     * @dependencies
     * @scenario
     * - insert two mocked boxes
     * - call getAllBoxIds
     * - check to have both boxIds
     * @expected
     * - it should return two boxIds stored in the database
     */
    it('should return all boxIds in the database', async () => {
      const box: ExtractedBox = {
        boxId: 'boxid',
        serialized: 'serialized',
        address: 'address',
      };
      const box2: ExtractedBox = {
        boxId: 'boxid2',
        serialized: 'serialized2',
        address: 'address',
      };
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box, box2], [], block, 'extractor');
      const boxIds = await action.getAllBoxIds('extractor');
      expect(boxIds).toHaveLength(2);
      expect(boxIds).toEqual([box.boxId, box2.boxId]);
    });
  });

  describe('removeBox', () => {
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
      const block = generateBlockEntity(dataSource, 'block1', 'block0', 100);
      await action.storeBox([box], [], block, 'extractor');
      const result = await action.removeBox(box.boxId, 'extractor');
      expect(result.affected).toEqual(1);
    });
  });

  describe('updateSpendBlock', () => {
    /**
     * @target boxAction.updateSpendBlock should update the spend block information
     * @dependencies
     * @scenario
     * - insert a mocked box
     * - update the box with new spend block information
     * - fetch that box and check the result
     * @expected
     * - it should update the box spend block id and height
     */
    it('should update the spend block information', async () => {
      await dataSource.getRepository(BoxEntity).insert({
        boxId: 'boxId',
        serialized: 'serialized',
        address: 'address',
        extractor: 'extractor',
        createBlock: 'createBlock',
        creationHeight: 100,
        spendBlock: 'spendBlock',
        spendHeight: 109,
      });
      await action.updateSpendBlock(
        'boxId',
        'extractor',
        'spendBlock-new',
        110
      );
      const stored = (await repository.find())[0];
      expect(stored.spendBlock).toEqual('spendBlock-new');
      expect(stored.spendHeight).toEqual(110);
    });
  });
});
