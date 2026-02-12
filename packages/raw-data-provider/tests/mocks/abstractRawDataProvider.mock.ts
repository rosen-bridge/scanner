export * from './actions/rawDataProviderStateEntityAction.mock';

export const mockedBlockTxs = [
  {
    tx_hash: 'tx_hash_1',
    block_hash: 'mocked_block_hash_1',
    block_height: 1,
    epoch_no: 1,
    absolute_slot: 1,
    tx_timestamp: 1,
    cbor: 'cbor_1',
    body: {
      fee: '0',
      inputs: [],
      outputs: [],
    },
    is_valid: true,
    witness_set: {},
  },
  {
    tx_hash: '',
    block_hash: '',
    block_height: 1,
    epoch_no: 1,
    absolute_slot: 1,
    tx_timestamp: 1,
    cbor: '',
    body: {
      fee: '0',
      inputs: [],
      outputs: [],
    },
    is_valid: true,
    witness_set: {},
  },
];
