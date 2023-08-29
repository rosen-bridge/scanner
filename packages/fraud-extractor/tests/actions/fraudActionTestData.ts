import { ExtractedFraud } from '../../lib/interfaces/types';

const fraud: ExtractedFraud = {
  boxId: 'boxId',
  serialized: 'serialized',
  triggerBoxId: 'triggerId',
  wid: 'wid',
  rwtCount: '1000',
};

const oldStoredFraud = {
  boxId: 'boxId',
  serialized: 'serialized-old',
  wid: 'wid-old',
  rwtCount: '1000',
  triggerBoxId: 'triggerId-old',
  extractor: 'extractor',
  createBlock: 'create-block',
  creationHeight: 100,
  spendBlock: 'old-spendBlock',
  spendHeight: 109,
};

export { fraud, oldStoredFraud };
