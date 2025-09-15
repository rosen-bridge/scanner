import { describe, expect, it, vi } from 'vitest';
import { cloneDeep } from 'lodash-es';

import { WorkerManager } from '../../lib/ergo/initializers/strategies/WorkerManager';
import {
  mockGetRangeTxCount,
  mockRangeList,
  mockRangeQuery,
} from './WorkerManager.mock';

describe('WorkerManager', () => {
  describe('isWorkerActive', () => {
    /**
     * @target isWorkerActive should return true when worker has ranges
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - set worker range list
     * - call isWorkerActive
     * @expected
     * - return true
     */
    it('should return true when worker has ranges', () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      manager['workersRangeList'][0] = cloneDeep(mockRangeList);
      expect(manager.isWorkerActive(0)).toBe(true);
    });

    /**
     * @target isWorkerActive should return false when worker has no ranges
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - call isWorkerActive
     * @expected
     * - return false
     */
    it('should return false when worker has no ranges', () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      expect(manager.isWorkerActive(0)).toBe(false);
    });
  });

  describe('registerWorker', () => {
    /**
     * @target registerWorker should initialize worker with correct range
     * @dependencies
     * - getRangeTxCount
     * @scenario
     * - create WorkerManager instance
     * - spy on getRangeTxCount
     * - call registerWorker
     * @expected
     * - worker should be initialized with correct range
     * - getRangeTxCount should be called
     */
    it('should initialize worker with correct range', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);

      await manager.registerWorker(0);

      expect(manager['workersRangeList'][0]).toHaveLength(1);
      expect(manager['workersRangeList'][0][0]).toEqual({
        start: 0,
        end: 4999,
        count: 4999,
      });
      expect(getRangeTxCountSpy).toHaveBeenCalled();
    });
  });

  describe('limitLastRange', () => {
    /**
     * @target limitLastRange should split the last range in half
     * @dependencies
     * - getRangeTxCount
     * @scenario
     * - create WorkerManager instance
     * - set worker range list
     * - spy on getRangeTxCount
     * - call limitLastRange
     * @expected
     * - last range should be split in half
     * - getRangeTxCount should be called
     */
    it('should split the last range in half', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      manager['workersRangeList'][0] = [cloneDeep(mockRangeQuery)];

      await manager.limitLastRange(0);

      expect(manager['workersRangeList'][0]).toHaveLength(2);
      expect(manager['workersRangeList'][0][1]).toEqual({
        start: 1000,
        end: 1500,
        count: 500,
      });
      expect(getRangeTxCountSpy).toHaveBeenCalled();
    });

    /**
     * @target limitLastRange should throw error when worker has no ranges
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - call limitLastRange
     * @expected
     * - throw error
     */
    it('should throw error when worker has no ranges', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      await expect(manager.limitLastRange(0)).rejects.toThrow();
    });
  });

  describe('popLastRangeQuery', () => {
    /**
     * @target popLastRangeQuery should remove last range and update others
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - set worker range list
     * - call popLastRangeQuery
     * @expected
     * - last range should be removed
     * - other ranges should be updated
     */
    it('should remove last range and update others', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      manager['workersRangeList'][0] = cloneDeep(mockRangeList);

      await manager.popLastRangeQuery(0);

      expect(manager['workersRangeList'][0]).toHaveLength(2);
      expect(manager['workersRangeList'][0][0]).toEqual({
        start: 1251,
        end: 2000,
        count: 75,
      });
      expect(manager['workersRangeList'][0][1]).toEqual({
        start: 1251,
        end: 1500,
        count: 25,
      });
    });

    /**
     * @target popLastRangeQuery should throw error when worker has no ranges
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - call popLastRangeQuery
     * @expected
     * - throw error
     */
    it('should throw error when worker has no ranges', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      await expect(manager.popLastRangeQuery(0)).rejects.toThrow();
    });
  });

  describe('reassignIdleWorkers', () => {
    /**
     * @target reassignIdleWorkers should reassign work to idle workers
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - set worker range lists
     * - call reassignIdleWorkers
     * @expected
     * - idle workers should get new ranges
     * - original worker should have updated range
     */
    it('should reassign work to idle workers', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 3, getRangeTxCountSpy);
      manager['workersRangeList'][0] = cloneDeep(mockRangeList);

      const newWorkers = await manager.reassignIdleWorkers();

      expect(newWorkers).toHaveLength(2);
      expect(manager['workersRangeList'][1]).toEqual([
        {
          start: 1501,
          end: 2000,
          count: 50,
        },
      ]);
      expect(manager['workersRangeList'][2]).toEqual([
        {
          start: 1251,
          end: 1500,
          count: 25,
        },
      ]);
      expect(manager['workersRangeList'][0]).toHaveLength(1);
      expect(manager['workersRangeList'][0][0]).toEqual({
        start: 1000,
        end: 1250,
        count: 25,
      });
    });

    /**
     * @target reassignIdleWorkers should return empty array when no idle workers
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - set all workers as active
     * - call reassignIdleWorkers
     * @expected
     * - return empty array
     */
    it('should return empty array when no idle workers', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      manager['workersRangeList'][0] = cloneDeep(mockRangeList);
      manager['workersRangeList'][1] = cloneDeep(mockRangeList);

      const newWorkers = await manager.reassignIdleWorkers();

      expect(newWorkers).toHaveLength(0);
    });
  });

  describe('getLastRange', () => {
    /**
     * @target getLastRange should return last range when all ranges are above threshold
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - set worker range list
     * - call getLastRange with high threshold
     * @expected
     * - return last range
     */
    it('should return last range when all ranges are above threshold', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      manager['workersRangeList'][0] = cloneDeep(mockRangeList);

      const range = await manager.getLastRange(0, 20);

      expect(range).toEqual(mockRangeList[2]);
    });

    /**
     * @target getLastRange should return second range when its range is below threshold
     * @dependencies
     * - none
     * @scenario
     * - create WorkerManager instance
     * - set worker range list
     * - call getLastRange with low threshold
     * @expected
     * - return first range
     */
    it('should return second range when its range is below threshold', async () => {
      const getRangeTxCountSpy = vi
        .fn()
        .mockImplementation(mockGetRangeTxCount);
      const manager = new WorkerManager(10000, 2, getRangeTxCountSpy);
      manager['workersRangeList'][0] = cloneDeep(mockRangeList);

      const range = await manager.getLastRange(0, 50);

      expect(range).toEqual(mockRangeList[1]);
    });
  });
});
