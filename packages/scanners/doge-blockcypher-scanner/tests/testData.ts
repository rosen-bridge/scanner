export const blockHeight = 5434656;
export const blockHash =
  'e4dc98a8e1faabf2c210e487027f1380a39a83cc22d7d7e38592f0ac30e0e847';

export const blockResponse = {
  hash: 'e4dc98a8e1faabf2c210e487027f1380a39a83cc22d7d7e38592f0ac30e0e847',
  height: 5434656,
  chain: 'DOGE.main',
  total: 202069047164,
  fees: 554527553,
  size: 6970,
  ver: 6422788,
  time: '2024-10-25T21:28:25Z',
  received_time: '2024-10-25T21:29:22.508Z',
  relayed_by: '204.16.242.107:8333',
  bits: 436250374,
  nonce: 0,
  n_tx: 25,
  prev_block:
    '7e1c0b269757d346b2b30183904ce70051f3dbac41fba1c5b467899fa2645fee',
  mrkl_root: '58e56706160fb162eb07de7b4101fe69a74070b1051c8413f785b7029423cc47',
  txids: [
    'dd28f94e3f008b51a5eff9f998c5d1db1965b11a3bf3dd76bae274419b7bb9c9',
    '18b2a545c9f60cdccbb28e9e7909da1eb279057d9342f234c1fc317bab6f1bdf',
  ],
  depth: 216026,
};

export const block = {
  parentHash:
    '7e1c0b269757d346b2b30183904ce70051f3dbac41fba1c5b467899fa2645fee',
  hash: 'e4dc98a8e1faabf2c210e487027f1380a39a83cc22d7d7e38592f0ac30e0e847',
  height: 5434656,
  timestamp: 1729891705,
  txCount: 25,
};

export const blockTxsPage0 = [
  {
    hash: 'dd28f94e3f008b51a5eff9f998c5d1db1965b11a3bf3dd76bae274419b7bb9c9',
    ver: 2,
    vin_sz: 1,
    vout_sz: 3,
    size: 285,
    weight: 0,
    fee: 40000000,
    relayed_by: '5.9.7.62:22155',
    lock_time: 0,
    txid: 'dd28f94e3f008b51a5eff9f998c5d1db1965b11a3bf3dd76bae274419b7bb9c9',
    confidence: 1,
    confirmed: '2024-10-25T21:28:25Z',
    received: '2024-10-25T21:27:50.202Z',
    double_spend: false,
    inputs: [
      {
        prev_hash:
          '8597e2de38e3b1e69db9b8a80463e149317e91f904df5d6fa26b71b962f29e34',
        output_index: 2,
        script:
          '47304402207e4cd2745243257f0749b4a41425c2075dfb199f47072bfbf7db14b02677a8ae02204682c5159737314f7c4ba0f7112876497171a7cee48dddf667dccd59cf8ae1280121022b9ed0a9139042921decc62603a4a07357b444da2e0bd6a96c27155117913037',
        output_value: 15534394312,
        sequence: 4294967295,
        addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        script_type: 'pay-to-pubkey-hash',
      },
    ],
    outputs: [
      {
        value: 0,
        script:
          '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        addresses: null,
        script_type: 'null-data',
      },
      {
        value: 1000000000,
        script: 'a914d4c141068ab3a242aed5081a27ac3f10ad99ac9887',
        addresses: ['ABqDRagXMAqcwxeqnvSZKGKBAqjFBiFcU4'],
        script_type: 'pay-to-script-hash',
      },
    ],
    block_height: 5434656,
    block_hash:
      'e4dc98a8e1faabf2c210e487027f1380a39a83cc22d7d7e38592f0ac30e0e847',
    confirmations: 225627,
  },
];

export const blockTxsPage1 = [
  {
    hash: '18b2a545c9f60cdccbb28e9e7909da1eb279057d9342f234c1fc317bab6f1bdf',
    ver: 2,
    vin_sz: 1,
    vout_sz: 2,
    size: 225,
    weight: 0,
    fee: 100000,
    relayed_by: '5.9.7.62:22155',
    lock_time: 0,
    txid: '18b2a545c9f60cdccbb28e9e7909da1eb279057d9342f234c1fc317bab6f1bdf',
    confidence: 1,
    confirmed: '2024-10-25T21:28:25Z',
    received: '2024-10-25T21:27:55.202Z',
    double_spend: false,
    inputs: [
      {
        prev_hash:
          '9597e2de38e3b1e69db9b8a80463e149317e91f904df5d6fa26b71b962f29e35',
        output_index: 1,
        script:
          '47304402207e4cd2745243257f0749b4a41425c2075dfb199f47072bfbf7db14b02677a8ae02204682c5159737314f7c4ba0f7112876497171a7cee48dddf667dccd59cf8ae1280121022b9ed0a9139042921decc62603a4a07357b444da2e0bd6a96c27155117913037',
        output_value: 1000000000,
        sequence: 4294967295,
        addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        script_type: 'pay-to-pubkey-hash',
      },
    ],
    outputs: [
      {
        value: 999900000,
        script: 'a914d4c141068ab3a242aed5081a27ac3f10ad99ac9887',
        addresses: ['ABqDRagXMAqcwxeqnvSZKGKBAqjFBiFcU4'],
        script_type: 'pay-to-script-hash',
      },
    ],
    block_height: 5434656,
    block_hash:
      'e4dc98a8e1faabf2c210e487027f1380a39a83cc22d7d7e38592f0ac30e0e847',
    confirmations: 225627,
  },
];
