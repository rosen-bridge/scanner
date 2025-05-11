import { OrdiscanRunesTransfer } from '../lib/types';

export const mockLockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const mockOrdiscanApiKey = '';

export const baseTx = {
  txid: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  hash: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  version: 2,
  locktime: 0,
  size: 0,
  vsize: 0,
  weight: 0,
  vin: [
    {
      txid: '32a02f0d2612225bd41e82d60f80844ae006d10a836e80cef7a83d9ebb9fa92a',
      vout: 0,
      scriptSig: {
        asm: '',
        hex: '',
      },
      txinwitness: [
        'b435ab4a123da05904df5a6e60678ff0bda2f6353b4cf3392dcdda62dad22ce07ccce654c5360b738b4cba08b346ae89eec63bf865aeb285266c0064c36b44d9',
      ],
      sequence: 4294967295,
    },
  ],
  hex: '',
};
export const txUtxos = {
  lockTx: {
    vout: [
      {
        value: 0.000005,
        n: 0,
        scriptPubKey: {
          asm: 'OP_1 33fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          hex: '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          type: 'V1_P2TR',
        },
      },
      {
        value: 0.00003793,
        n: 1,
        scriptPubKey: {
          asm: 'OP_1 6049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
          hex: '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          type: 'V1_P2TR',
        },
      },
      {
        value: 0,
        n: 2,
        scriptPubKey: {
          asm: 'OP_RETURN OP_13 160100f7e135ec1790a10f00',
          hex: '6a5d0c160100f7e135ec1790a10f00',
          type: 'OP_RETURN',
        },
      },
      {
        value: 0.00000294,
        n: 3,
        scriptPubKey: {
          asm: 'OP_0 010000000000001388000000000000089839011b',
          hex: '0014010000000000001388000000000000089839011b',
          type: 'V0_P2WPKH',
        },
      },
      {
        value: 0.00000295,
        n: 4,
        scriptPubKey: {
          asm: 'OP_0 2eff6f19da9c786a5be52986e4fa888754f48fdc',
          hex: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
          type: 'V0_P2WPKH',
        },
      },
      {
        value: 0.00000296,
        n: 5,
        scriptPubKey: {
          asm: 'OP_0 82639073e4b9827cba6224d854f00de94428ff00',
          hex: '001482639073e4b9827cba6224d854f00de94428ff00',
          type: 'V0_P2WPKH',
        },
      },
      {
        value: 0.00000297,
        n: 6,
        scriptPubKey: {
          asm: 'OP_0 24e297ad5ab773a19ed6fac80c40de0000000000',
          hex: '001424e297ad5ab773a19ed6fac80c40de0000000000',
          type: 'V0_P2WPKH',
        },
      },
    ],
  },
};
export const txs = {
  lockTx: {
    ...baseTx,
    ...txUtxos.lockTx,
  },
};

export const rosenData = {
  toChain: 'cardano',
  toAddress:
    'addr1qydjalm0r8dfc7r2t0jjnphyl2ygw4853lwgycusw0jtnqnuhf3zfkz57qx7j3pgluqzfc5h44dtwuapnmt04jqvgr0qwd9mqk',
  bridgeFee: '5000',
  networkFee: '2200',
  fromAddress:
    'box:32a02f0d2612225bd41e82d60f80844ae006d10a836e80cef7a83d9ebb9fa92a.0',
  sourceChainTokenId: 'undefined',
  amount: '0',
  targetChainTokenId: 'undefined',
  sourceTxId:
    'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
};

export const mockOrdiscanRunesTransfer: OrdiscanRunesTransfer = {
  txid: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  runestone_messages: [
    {
      rune: 'TEST',
      type: 'TRANSFER',
    },
  ],
  inputs: [
    {
      address: 'bc1p2lrqw3cv9vqzsajf677ght7v38hk7rzfjwm2x9mgqqypnfjphywsg5l237',
      output:
        '3691b43e7a679dc4550a2fb69cc90581a3b532847b3d04a45dc3ec78cefb57e9:1826',
      rune: 'TEST',
      rune_amount: '1200',
    },
  ],
  outputs: [
    {
      address: mockLockAddress,
      vout: 0,
      rune: 'TEST',
      rune_amount: '1200',
    },
  ],
};
