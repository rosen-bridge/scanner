import { RangeQuery } from '../../lib/ergo/interfaces';

export const mockRangeQuery: RangeQuery = {
  start: 1000,
  end: 2000,
  count: 100,
};

export const mockRangeList = [
  {
    start: 1000,
    end: 2000,
    count: 100,
  },
  {
    start: 1000,
    end: 1500,
    count: 50,
  },
  {
    start: 1000,
    end: 1250,
    count: 25,
  },
];

export const mockGetRangeTxCount = async (
  start: number,
  end: number
): Promise<number> => {
  return end - start;
};
