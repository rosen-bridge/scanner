export const cardanoSampleObservation = {
  id: 'obs1',
  sourceTxId: 'tx123',
  height: 51,
};
export const cardanoSampleObservation2 = {
  id: 'obs2',
  sourceTxId: 'not-exist',
  height: 51,
};
export const cardanoSampleTx = { id: 'tx123', body: { foo: 1 } };
export const cardanoSampleBlock = {
  type: 'praos',
  transactions: [cardanoSampleTx],
};
export const cardanoSampleBlock2 = {
  type: 'praos',
  transactions: [{ id: 'other' }],
};
export const cardanoSampleIntersection = { slot: 100, id: 'abc' };
