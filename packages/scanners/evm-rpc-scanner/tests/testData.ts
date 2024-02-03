import { components } from '@blockfrost/openapi';
import { CardanoTx, CardanoUtxo } from '@rosen-chains/cardano';

export const blockHeight = 9511863;
export const absoluteSlot = 107701834;

export const address =
  'addr1qxxa3kfnnh40yqtepa5frt0tkw4a0rys7v33422lzt8glx43sqtd4vkhjzawajej8aujh27p5a54zx62xf3wvuplynqs3fsqet';

export const blockInfo = {
  time: 1699268125,
  height: blockHeight,
  hash: '799da32b0c2638beb49ec589eb09bf8b27d20cbcb2d95fdce8b83eade762580b',
  slot: 107701834,
  epoch: 446,
  epoch_slot: 393034,
  slot_leader: 'slot_leader',
  size: 5407,
  tx_count: 7,
  output: '838285457542',
  fees: '2665657',
  block_vrf: 'block_vrf',
  op_cert: 'op_cert',
  op_cert_counter: '14',
  previous_block:
    'ac50a85c70509bd9e900fe22c30e483ccdb42aae9cad0330fcea2de5e1a8a3a4',
  next_block: null,
  confirmations: 0,
};

export const noMetadataTransaction = {
  hash: '5ecf1335f943526c84e5a53201e21344ccbbeda93f9fcae4c642b78214cd1052',
  block: '2e182672a18fa13e6941cd362e28d07854ba3828e63fc8419df908e38972bc44',
  block_height: 8780451,
  block_time: 1684231960,
  slot: 92665669,
  index: 7,
  output_amount: [
    {
      unit: 'lovelace',
      quantity: '608782432',
    },
  ],
  fees: '168500',
  deposit: '0',
  size: 233,
  invalid_before: null,
  invalid_hereafter: '92671657',
  utxo_count: 3,
  withdrawal_count: 0,
  mir_cert_count: 0,
  delegation_count: 0,
  stake_cert_count: 0,
  pool_update_count: 0,
  pool_retire_count: 0,
  asset_mint_or_burn_count: 0,
  redeemer_count: 0,
  valid_contract: true,
};
export const noMetadataTransactionUtxos = {
  hash: '5ecf1335f943526c84e5a53201e21344ccbbeda93f9fcae4c642b78214cd1052',
  inputs: [
    {
      address: 'addr1v8djv8h2ws084wc92rwau0u73wtnsw8x3fm6uw292npscwsx2xc98',
      amount: [
        {
          unit: 'lovelace',
          quantity: '608950932',
        },
      ],
      tx_hash:
        '4f868ccfc7abfc70a154e4fbe6e8c671add4852716fbb56bc713305744360f22',
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      reference_script_hash: null,
      collateral: false,
      reference: false,
    },
  ],
  outputs: [
    {
      address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
      amount: [
        {
          unit: 'lovelace',
          quantity: '605950932',
        },
      ],
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
    {
      address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
      amount: [
        {
          unit: 'lovelace',
          quantity: '2831500',
        },
      ],
      output_index: 1,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
  ],
};
export const noMetadataTransactionMetadata = [];
export const noMetadataTransactionInCardanoTx: CardanoTx = {
  id: noMetadataTransaction.hash,
  inputs: [
    {
      txId: '4f868ccfc7abfc70a154e4fbe6e8c671add4852716fbb56bc713305744360f22',
      index: 0,
      value: 608950932n,
      assets: [],
    },
  ],
  outputs: [
    {
      address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
      value: 605950932n,
      assets: [],
    },
    {
      address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
      value: 2831500n,
      assets: [],
    },
  ],
  fee: BigInt(noMetadataTransaction.fees),
};

export const rosenTransaction = {
  hash: '98884bf40d8ebbd89ad78c6deaa31f0cc47938d941bfc0452bbc9a13aeb37cd3',
  block: '4d321fbd03eca67baa9e581b1355a14d7193f1193494f3be40898ff1110f04e0',
  block_height: 8555968,
  block_time: 1679616971,
  slot: 88050680,
  index: 28,
  output_amount: [
    {
      unit: 'lovelace',
      quantity: '2731375',
    },
    {
      unit: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b952535457',
      quantity: '1455',
    },
  ],
  fees: '268625',
  deposit: '0',
  size: 660,
  invalid_before: null,
  invalid_hereafter: null,
  utxo_count: 3,
  withdrawal_count: 0,
  mir_cert_count: 0,
  delegation_count: 0,
  stake_cert_count: 0,
  pool_update_count: 0,
  pool_retire_count: 0,
  asset_mint_or_burn_count: 0,
  redeemer_count: 0,
  valid_contract: true,
};
export const rosenTransactionUtxos = {
  hash: '98884bf40d8ebbd89ad78c6deaa31f0cc47938d941bfc0452bbc9a13aeb37cd3',
  inputs: [
    {
      address:
        'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
      amount: [
        {
          unit: 'lovelace',
          quantity: '3000000',
        },
        {
          unit: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b952535457',
          quantity: '1455',
        },
      ],
      tx_hash:
        'ed688bc21f5ed822adadd1f61415821def778201323c8e998baf350e0647ce49',
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      reference_script_hash: null,
      collateral: false,
      reference: false,
    },
  ],
  outputs: [
    {
      address: 'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuzv',
      amount: [
        {
          unit: 'lovelace',
          quantity: '1286857',
        },
      ],
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
    {
      address:
        'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
      amount: [
        {
          unit: 'lovelace',
          quantity: '1444518',
        },
        {
          unit: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b952535457',
          quantity: '1455',
        },
      ],
      output_index: 1,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
  ],
};
export const rosenTransactionMetadata = [
  {
    label: '0',
    json_metadata: {
      to: 'ergo',
      bridgeFee: '300000',
      toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
      networkFee: '500000',
      fromAddress: [
        'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwf',
        'q8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
      ],
    },
  },
];
export const rosenTransactionInCardanoTx: CardanoTx = {
  id: rosenTransaction.hash,
  inputs: [
    {
      txId: 'ed688bc21f5ed822adadd1f61415821def778201323c8e998baf350e0647ce49',
      index: 0,
      value: 3000000n,
      assets: [
        {
          policy_id: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9',
          asset_name: '52535457',
          quantity: 1455n,
        },
      ],
    },
  ],
  outputs: [
    {
      address: 'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuzv',
      value: 1286857n,
      assets: [],
    },
    {
      address:
        'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
      value: 1444518n,
      assets: [
        {
          policy_id: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9',
          asset_name: '52535457',
          quantity: 1455n,
        },
      ],
    },
  ],
  fee: BigInt(rosenTransaction.fees),
  metadata: {
    '0': {
      to: 'ergo',
      bridgeFee: '300000',
      toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
      networkFee: '500000',
      fromAddress: [
        'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwf',
        'q8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
      ],
    },
  },
};

export const differentMetadataTransaction = {
  hash: 'dd8fc82e9ca2d38cffdfb2ab9ec51ea8158f7ade67b95c2dece63de3b8f836a7',
  block: '87d22e3a156ea1a984bbf7758c29c7efb58cf1b6a4e05e853c3e30d42262ae9c',
  block_height: 8780716,
  block_time: 1684237003,
  slot: 92670712,
  index: 28,
  output_amount: [
    {
      unit: 'lovelace',
      quantity: '1281849555',
    },
    {
      unit: '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728436c61794e6174696f6e39353837',
      quantity: '1',
    },
  ],
  fees: '227681',
  deposit: '0',
  size: 1047,
  invalid_before: null,
  invalid_hereafter: '92671082',
  utxo_count: 4,
  withdrawal_count: 0,
  mir_cert_count: 0,
  delegation_count: 0,
  stake_cert_count: 0,
  pool_update_count: 0,
  pool_retire_count: 0,
  asset_mint_or_burn_count: 0,
  redeemer_count: 1,
  valid_contract: true,
};
export const differentMetadataTransactionUtxos = {
  hash: 'dd8fc82e9ca2d38cffdfb2ab9ec51ea8158f7ade67b95c2dece63de3b8f836a7',
  inputs: [
    {
      address: 'addr1w8cvzcnclvkua25vx26j72pddatuedsxspm62mr63urs0fctuuzfv',
      amount: [
        {
          unit: 'lovelace',
          quantity: '932000000',
        },
        {
          unit: '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728436c61794e6174696f6e39353837',
          quantity: '1',
        },
      ],
      tx_hash:
        '6173600230d8e09bd61520c4f451ab9f1efca9e3a082a149bcc6914896997695',
      output_index: 1,
      data_hash:
        'f12f4e3c4624767d580206eb0293b564e98cffd31f485494ce20644d97cb72a0',
      inline_datum: null,
      reference_script_hash: null,
      collateral: false,
      reference: false,
    },
    {
      address:
        'addr1qxmpg2p8xfrk0qyz5ksjqtk93u04vd6alds3w6dhrj4vcsvzc3ed2wp3m7m7m7pjt8x5qlh8v9we55n3kg4duw7kcwxsxt52zf',
      amount: [
        {
          unit: 'lovelace',
          quantity: '350077236',
        },
      ],
      tx_hash:
        '86bd079733207c6b4ba764fb5408fa59b74ef1733e8b3f9f6e8ef41ac3c048f9',
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      reference_script_hash: null,
      collateral: false,
      reference: false,
    },
    {
      address:
        'addr1qx0te49322dxa6fryvfmsazxfyjvplxhwc2rj3xwjf3lnmyzc3ed2wp3m7m7m7pjt8x5qlh8v9we55n3kg4duw7kcwxsdhkgkw',
      amount: [
        {
          unit: 'lovelace',
          quantity: '5000000',
        },
      ],
      tx_hash:
        'f8b1f77f72c28b2a99ebab191b28d9d7959f0fc9f07c912470050b9ea9a82ce6',
      output_index: 4,
      data_hash: null,
      inline_datum: null,
      reference_script_hash: null,
      collateral: true,
      reference: false,
    },
  ],
  outputs: [
    {
      address:
        'addr1qxmpg2p8xfrk0qyz5ksjqtk93u04vd6alds3w6dhrj4vcsvzc3ed2wp3m7m7m7pjt8x5qlh8v9we55n3kg4duw7kcwxsxt52zf',
      amount: [
        {
          unit: 'lovelace',
          quantity: '319849555',
        },
      ],
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
    {
      address: 'addr1w8cvzcnclvkua25vx26j72pddatuedsxspm62mr63urs0fctuuzfv',
      amount: [
        {
          unit: 'lovelace',
          quantity: '962000000',
        },
        {
          unit: '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728436c61794e6174696f6e39353837',
          quantity: '1',
        },
      ],
      output_index: 1,
      data_hash:
        'f12f4e3c4624767d580206eb0293b564e98cffd31f485494ce20644d97cb72a0',
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
  ],
};

export const differentMetadataTransactionMetadata = [
  {
    label: '674',
    json_metadata: {
      msg: [
        'Mutant Labs Raffle',
        'Buy 5 tickets for Raffle 64625b85e66d67ce15babf40',
      ],
    },
  },
];
export const differentMetadataTransactionInCardanoTx: CardanoTx = {
  id: differentMetadataTransaction.hash,
  inputs: [
    {
      txId: '6173600230d8e09bd61520c4f451ab9f1efca9e3a082a149bcc6914896997695',
      index: 1,
      value: 932000000n,
      assets: [
        {
          policy_id: '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728',
          asset_name: '436c61794e6174696f6e39353837',
          quantity: 1n,
        },
      ],
    },
    {
      txId: '86bd079733207c6b4ba764fb5408fa59b74ef1733e8b3f9f6e8ef41ac3c048f9',
      index: 0,
      value: 350077236n,
      assets: [],
    },
    {
      txId: 'f8b1f77f72c28b2a99ebab191b28d9d7959f0fc9f07c912470050b9ea9a82ce6',
      index: 4,
      value: 5000000n,
      assets: [],
    },
  ],
  outputs: [
    {
      address:
        'addr1qxmpg2p8xfrk0qyz5ksjqtk93u04vd6alds3w6dhrj4vcsvzc3ed2wp3m7m7m7pjt8x5qlh8v9we55n3kg4duw7kcwxsxt52zf',
      value: 319849555n,
      assets: [],
    },
    {
      address: 'addr1w8cvzcnclvkua25vx26j72pddatuedsxspm62mr63urs0fctuuzfv',
      value: 962000000n,
      assets: [
        {
          policy_id: '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728',
          asset_name: '436c61794e6174696f6e39353837',
          quantity: 1n,
        },
      ],
    },
  ],
  fee: BigInt(differentMetadataTransaction.fees),
  metadata: {
    '674': {
      msg: [
        'Mutant Labs Raffle',
        'Buy 5 tickets for Raffle 64625b85e66d67ce15babf40',
      ],
    },
  },
};

export const addressBalance = 99000000n;
export const addressAssets = [
  {
    address: address,
    decimals: 0n,
    quantity: '15888202094',
    policy_id: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f47',
    asset_name: '5273455247',
  },
  {
    address: address,
    decimals: 0n,
    quantity: '1866325',
    policy_id: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9',
    asset_name: '52535457',
  },
];

export const addressInfo: components['schemas']['address_content'] = {
  address: address,
  amount: [
    {
      unit: 'lovelace',
      quantity: '99000000',
    },
    {
      unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
      quantity: '15888202094',
    },
    {
      unit: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b952535457',
      quantity: '1866325',
    },
  ],
  stake_address: null,
  type: 'shelley',
  script: false,
};

export const emptyAddressInfo: components['schemas']['address_content'] = {
  address: address,
  amount: [
    {
      unit: 'lovelace',
      quantity: '0',
    },
  ],
  stake_address: 'stake_address',
  type: 'shelley',
  script: false,
};

export const blockId =
  '9c6e26dcdde688388370410df7cd0bbaa12acf563cd4b76e76dc3d36a9cc533b';
export const parentBlockId =
  '6dc89c6e28360410df837ddebad0b8c2a7c73f561cd4ba66a976dc3d3bce';
export const txHashes = [
  '65eebe2262738d1c3a2ac57ce7aa7987613cd8835e7ffe1b44be6cc513464e9a',
  'ffc5558b0041a0531c2e99ced50c066c77afb56c0608716632bde93e92572d95',
  '51b640cf0a9b5a241d3fd39174ce414e53b375c1f53904951dd59fa420c29141',
];
export const oldBlockHeight = 7000000;

export const addressUtxoSet: components['schemas']['address_utxo_content'] = [
  {
    address: address,
    tx_hash: '4eb16141fb4f2ca1cabc0dfb16491e54a1b4464b75591ccc3942eb4c6f4273fb',
    tx_index: 0,
    output_index: 0,
    amount: [
      {
        unit: 'lovelace',
        quantity: '1344798',
      },
      {
        unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
        quantity: '64576047',
      },
    ],
    block: '4eef764aa9065af9339b5481c5af470253a6ce8f6f75b5a1f9303523769a316d',
    data_hash: null,
    inline_datum: null,
    reference_script_hash: null,
  },
  {
    address: address,
    tx_hash: 'dbd93ef240f7546ce6b8619b6bea4486252bdeaae89d4ee9f74a6fa363d4eb22',
    tx_index: 0,
    output_index: 0,
    amount: [
      {
        unit: 'lovelace',
        quantity: '1344798',
      },
      {
        unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
        quantity: '57617503',
      },
    ],
    block: '4eef764aa9065af9339b5481c5af470253a6ce8f6f75b5a1f9303523769a316d',
    data_hash: null,
    inline_datum: null,
    reference_script_hash: null,
  },
  {
    address: address,
    tx_hash: '454426c78db02b32a02274d926850fad261bb08b3dbfac962ba38c5118856dc6',
    tx_index: 0,
    output_index: 0,
    amount: [
      {
        unit: 'lovelace',
        quantity: '1260649',
      },
    ],
    block: '4eef764aa9065af9339b5481c5af470253a6ce8f6f75b5a1f9303523769a316d',
    data_hash: null,
    inline_datum: null,
    reference_script_hash: null,
  },
];
export const expectedAddressUtxoSet = [
  {
    txId: '4eb16141fb4f2ca1cabc0dfb16491e54a1b4464b75591ccc3942eb4c6f4273fb',
    index: 0,
    value: 1344798n,
    assets: [
      {
        policy_id: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f47',
        asset_name: '5273455247',
        quantity: 64576047n,
      },
    ],
  },
  {
    txId: 'dbd93ef240f7546ce6b8619b6bea4486252bdeaae89d4ee9f74a6fa363d4eb22',
    index: 0,
    value: 1344798n,
    assets: [
      {
        policy_id: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f47',
        asset_name: '5273455247',
        quantity: 57617503n,
      },
    ],
  },
  {
    txId: '454426c78db02b32a02274d926850fad261bb08b3dbfac962ba38c5118856dc6',
    index: 0,
    value: 1260649n,
    assets: [],
  },
];

export const unspentBoxId =
  '4eb16141fb4f2ca1cabc0dfb16491e54a1b4464b75591ccc3942eb4c6f4273fb.0';
export const spentBoxId =
  '4eb16141fb4f2ca1cabc0dfb16491e54a1b4464b75591ccc3942eb4c6f4273fb.1';
export const boxValidationTxUtxos = {
  hash: '4eb16141fb4f2ca1cabc0dfb16491e54a1b4464b75591ccc3942eb4c6f4273fb',
  inputs: [
    {
      address:
        'addr1qydpd5egdrvfq9h6a0qsh75nsstmvkaz0adjvmd687cg5yjwgnhfd3scmjam2x6f3kputcgt4p5qh59s3kwwa6edxjxs4hs7hx',
      amount: [
        {
          unit: 'lovelace',
          quantity: '1344798',
        },
        {
          unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
          quantity: '30631295905',
        },
      ],
      tx_hash:
        'b356c216b0e46bf9faa8e908b5014e36698d76b015d08e16049bcc873ae706f3',
      output_index: 1,
      data_hash: null,
      inline_datum: null,
      reference_script_hash: null,
      collateral: false,
      reference: false,
    },
    {
      address:
        'addr1qydpd5egdrvfq9h6a0qsh75nsstmvkaz0adjvmd687cg5yjwgnhfd3scmjam2x6f3kputcgt4p5qh59s3kwwa6edxjxs4hs7hx',
      amount: [
        {
          unit: 'lovelace',
          quantity: '3000000',
        },
        {
          unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
          quantity: '186722928',
        },
      ],
      tx_hash:
        'db112c174b8d7e3b462d222146dd1df944814bcd8cb387c8b314c53341b8ad79',
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      reference_script_hash: null,
      collateral: false,
      reference: false,
    },
  ],
  outputs: [
    {
      address: 'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuzv',
      amount: [
        {
          unit: 'lovelace',
          quantity: '1344798',
        },
        {
          unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
          quantity: '64576047',
        },
      ],
      output_index: 0,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
    {
      address:
        'addr1qydpd5egdrvfq9h6a0qsh75nsstmvkaz0adjvmd687cg5yjwgnhfd3scmjam2x6f3kputcgt4p5qh59s3kwwa6edxjxs4hs7hx',
      amount: [
        {
          unit: 'lovelace',
          quantity: '1344798',
        },
        {
          unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
          quantity: '30753442786',
        },
      ],
      output_index: 1,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
    {
      address:
        'addr1qydpd5egdrvfq9h6a0qsh75nsstmvkaz0adjvmd687cg5yjwgnhfd3scmjam2x6f3kputcgt4p5qh59s3kwwa6edxjxs4hs7hx',
      amount: [
        {
          unit: 'lovelace',
          quantity: '1379889',
        },
      ],
      output_index: 2,
      data_hash: null,
      inline_datum: null,
      collateral: false,
      reference_script_hash: null,
    },
  ],
};

export const txUtxo: CardanoUtxo = {
  txId: '4eb16141fb4f2ca1cabc0dfb16491e54a1b4464b75591ccc3942eb4c6f4273fb',
  index: 0,
  value: 1344798n,
  assets: [
    {
      policy_id: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f47',
      asset_name: '5273455247',
      quantity: 64576047n,
    },
  ],
};

export const epochParams = {
  epoch: 447,
  min_fee_a: 44,
  min_fee_b: 155381,
  max_block_size: 90112,
  max_tx_size: 16384,
  max_block_header_size: 1100,
  key_deposit: '2000000',
  pool_deposit: '500000000',
  e_max: 18,
  n_opt: 500,
  a0: 0.3,
  rho: 0.003,
  tau: 0.2,
  decentralisation_param: 0,
  extra_entropy: null,
  protocol_major_ver: 8,
  protocol_minor_ver: 0,
  min_utxo: '4310',
  min_pool_cost: '170000000',
  nonce: '3cf0a6c3179f521101ceef355b1b3e3d782846f0b9161dd7095e096bbb6536bf',
  cost_models: {},
  price_mem: 0.0577,
  price_step: 0.0000721,
  max_tx_ex_mem: '14000000',
  max_tx_ex_steps: '10000000000',
  max_block_ex_mem: '62000000',
  max_block_ex_steps: '20000000000',
  max_val_size: '5000',
  collateral_percent: 150,
  max_collateral_inputs: 3,
  coins_per_utxo_size: '4310',
  coins_per_utxo_word: '4310',
};
export const expectedRequiredParams = {
  minFeeA: 44,
  minFeeB: 155381,
  poolDeposit: '500000000',
  keyDeposit: '2000000',
  maxValueSize: 5000,
  maxTxSize: 16384,
  coinsPerUtxoSize: '4310',
};

export const assetId =
  '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457';
export const assetByIdResult = {
  asset: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b952535457',
  policy_id: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9',
  asset_name: '52535457',
  fingerprint: 'asset1vwun0a52xjv5tc2x92wgr6x3p6q3u4frnmq8q0',
  quantity: '2000000000',
  initial_mint_tx_hash: 'initial_mint_tx_hash',
  mint_or_burn_count: 1,
  onchain_metadata: null,
  onchain_metadata_standard: null,
  onchain_metadata_extra: null,
  metadata: {
    name: 'RSTW',
    description: 'description',
    ticker: 'ticker',
    url: 'url',
    logo: 'logo',
    decimals: 9,
  },
};
export const expectedTokenDetail = {
  tokenId: assetId,
  name: 'RSTW',
  decimals: 9,
};
