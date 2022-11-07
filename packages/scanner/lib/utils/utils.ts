export const retryRequest = async <D>(
  promiseGenerator: () => Promise<D>,
  retriesCount: number,
  retrialPredicate: (data: D) => boolean
) => {
  let remainingRetial = retriesCount;
  while (remainingRetial--) {
    try {
      const res = await promiseGenerator();
      if (retrialPredicate(res)) continue;
      return res;
    } catch (e) {
      console.warn('An error accured while trying on requests: ' + e);
    }
  }
  throw Error("Retrial finished and didn't get the required result");
};
