import { Buffer } from 'buffer';
import * as wasm from 'ergo-lib-wasm-nodejs';

import JsonBI from '@rosen-bridge/json-bigint';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

export const fraudTx: Transaction = {
  id: '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
  inputs: [
    {
      boxId: '15ee67387970e6fde9da4c792633f0ef158af64a2cbfac2c471c8780ace02ba8',
      extension: {},
    },
    {
      boxId: '2c967ffb7856cfdfd2e37576a28c750aef2392f5cc93bee15740d4d9356ad7b2',
      extension: {},
    },
    {
      boxId: '36a62014312f11031ca342502c54701cb427b1c0102c40b8b65fcb9f9524d3cf',
      extension: {},
    },
  ],
  dataInputs: [],
  outputs: [
    {
      boxId: '69be519ff4336011f2747391572eda0025f4869cde816dfe79573cc22703b008',
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      value: 1000000n,
      index: 0,
      creationHeight: 1666971,
      ergoTree:
        '100b04000400040004020402040404000e20ac7bbfff7ec3852afae13153a9a5b063ac26fc43a780aa3468cec8c9cdd176b3040604000e208fbecc9f4f6968b181d70d337f33729e9b3cb591ffcf8fca16282ccbc487a587d801d601db6308b2a4730000d196830401938cb2db6308a773010002998cb2db6308b2a5730200730300028cb272017304000293c5a7c5b2a4730500938cb27201730600017307938cb2db6308b2a473080073090001730a',
      assets: [
        {
          tokenId:
            '34529f875cad2bf58c5ffb4a9056d26c590f0c35f77958a68dcdb4aa39b437aa',
          amount: 1000n,
        },
      ],
      additionalRegisters: {
        R4: '0e20195bd457085e48b0e1467da99f011fc67827480c8a991b9a1ba53a6d2bb135d4',
      },
    },
    {
      boxId: '55ca7de1df2e337e10316f91e6bf666ed6a84d18e72ccda714abc51c089fd1d2',
      value: 1000000n,
      ergoTree:
        '100b04000400040004020402040404000e20ac7bbfff7ec3852afae13153a9a5b063ac26fc43a780aa3468cec8c9cdd176b3040604000e208fbecc9f4f6968b181d70d337f33729e9b3cb591ffcf8fca16282ccbc487a587d801d601db6308b2a4730000d196830401938cb2db6308a773010002998cb2db6308b2a5730200730300028cb272017304000293c5a7c5b2a4730500938cb27201730600017307938cb2db6308b2a473080073090001730a',
      assets: [
        {
          tokenId:
            '34529f875cad2bf58c5ffb4a9056d26c590f0c35f77958a68dcdb4aa39b437aa',
          amount: 1000n,
        },
      ],
      additionalRegisters: {
        R4: '0e20143f7c38a3e10ba24ccb7c4975dd091d0a9b916304c57db6a0534c4b493ce208',
      },
      creationHeight: 1666971,
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      index: 1,
    },
    {
      boxId: '74920e1c64838ab3e7ade5260ea711834168a7147605f77cba9f8a022d38a08b',
      value: 1000000n,
      ergoTree:
        '100b04000400040004020402040404000e20ac7bbfff7ec3852afae13153a9a5b063ac26fc43a780aa3468cec8c9cdd176b3040604000e208fbecc9f4f6968b181d70d337f33729e9b3cb591ffcf8fca16282ccbc487a587d801d601db6308b2a4730000d196830401938cb2db6308a773010002998cb2db6308b2a5730200730300028cb272017304000293c5a7c5b2a4730500938cb27201730600017307938cb2db6308b2a473080073090001730a',
      assets: [
        {
          tokenId:
            '34529f875cad2bf58c5ffb4a9056d26c590f0c35f77958a68dcdb4aa39b437aa',
          amount: 1000n,
        },
      ],
      additionalRegisters: {
        R4: '0e20700577946f4334199916bacf1ce3286404acd4f9476876e6ec7d5bf5a2184d3f',
      },
      creationHeight: 1666971,
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      index: 2,
    },
    {
      boxId: '9ed4f8cdd27ab71b30d2b628742970df8d5b8720d51598d84e39c5f84a96a31a',
      value: 1000000n,
      ergoTree:
        '100b04000400040004020402040404000e20ac7bbfff7ec3852afae13153a9a5b063ac26fc43a780aa3468cec8c9cdd176b3040604000e208fbecc9f4f6968b181d70d337f33729e9b3cb591ffcf8fca16282ccbc487a587d801d601db6308b2a4730000d196830401938cb2db6308a773010002998cb2db6308b2a5730200730300028cb272017304000293c5a7c5b2a4730500938cb27201730600017307938cb2db6308b2a473080073090001730a',
      assets: [
        {
          tokenId:
            '34529f875cad2bf58c5ffb4a9056d26c590f0c35f77958a68dcdb4aa39b437aa',
          amount: 1000n,
        },
      ],
      additionalRegisters: {
        R4: '0e2092932311cd5401cd6690b8da274ff937b8f4196eda94fd45f33aca8d7593eb97',
      },
      creationHeight: 1666971,
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      index: 3,
    },
    {
      boxId: '149ae65e09a0e4729ea11d441dfa4653c83bf911dc4511591cc1829394b0e0cc',
      value: 1000000n,
      ergoTree:
        '100b04000400040004020402040404000e20ac7bbfff7ec3852afae13153a9a5b063ac26fc43a780aa3468cec8c9cdd176b3040604000e208fbecc9f4f6968b181d70d337f33729e9b3cb591ffcf8fca16282ccbc487a587d801d601db6308b2a4730000d196830401938cb2db6308a773010002998cb2db6308b2a5730200730300028cb272017304000293c5a7c5b2a4730500938cb27201730600017307938cb2db6308b2a473080073090001730a',
      assets: [
        {
          tokenId:
            '34529f875cad2bf58c5ffb4a9056d26c590f0c35f77958a68dcdb4aa39b437aa',
          amount: 1000n,
        },
      ],
      additionalRegisters: {
        R4: '0e20a482c6a3fc2ee79314f23dd94060fb7b1996319d7c2587545600752376393115',
      },
      creationHeight: 1666971,
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      index: 4,
    },
    {
      boxId: 'f8e5c6b2517321e68ea5e93ab33fa8f902e348b0277f8de9e43bec2b769ea8f6',
      value: 5566650000n,
      ergoTree:
        '0008cd0271311d06e39f058ec5c501bf56aec49316c83f5023a435c6b5b29312e40b4c81',
      assets: [
        {
          tokenId:
            '8fbecc9f4f6968b181d70d337f33729e9b3cb591ffcf8fca16282ccbc487a587',
          amount: 2n,
        },
        {
          tokenId:
            'd752bede1a85891fff344604431fd6dc30ba685b382f2e0fe15da8141d36e34e',
          amount: 97000n,
        },
        {
          tokenId:
            '028ec31acacaa6aab6cd89a16cab5f9046cfea701262f8c9532ace433075353a',
          amount: 41045n,
        },
        {
          tokenId:
            '31ac0f72b036502a17e27ff3bc9eb1b3ae4eef9aa4a3c3bd818475d6326cbd9f',
          amount: 7105n,
        },
        {
          tokenId:
            'ed2197ebb2b958670cb568aeed54693617a3f3718d16d1a298b8c8d337193da0',
          amount: 6105n,
        },
        {
          tokenId:
            '0cccef61215566439f22b5a4aaa7567183d4f9de963e7bcdb27c9ced76c2ab0c',
          amount: 1n,
        },
      ],
      additionalRegisters: {},
      creationHeight: 1666971,
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      index: 5,
    },
    {
      boxId: '903bc8b27f74f72ee85ea34b66c62bfdf788f514c4271ba70c3d0cb39b1e731e',
      value: 1100000n,
      ergoTree:
        '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
      assets: [],
      additionalRegisters: {},
      creationHeight: 1666971,
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      index: 6,
    },
    {
      boxId: 'a72211a28a612227fc967579ea37b59cde14c268b1b0bd549f8a8a264fcf2210',
      value: 5000000n,
      ergoTree:
        '0008cd0271311d06e39f058ec5c501bf56aec49316c83f5023a435c6b5b29312e40b4c81',
      assets: [],
      additionalRegisters: {},
      creationHeight: 1666971,
      transactionId:
        '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
      index: 7,
    },
  ],
};

const parsedBox = wasm.ErgoBox.from_json(JsonBI.stringify(fraudTx.outputs[0]));

export const extractedFraud = {
  txId: '5f9e7ea97cfc83ed671d95d8ae8579c53949108e551b2a807283864597a1f2fe',
  identifier:
    '69be519ff4336011f2747391572eda0025f4869cde816dfe79573cc22703b008',
  triggerBoxId:
    '15ee67387970e6fde9da4c792633f0ef158af64a2cbfac2c471c8780ace02ba8',
  wid: '195bd457085e48b0e1467da99f011fc67827480c8a991b9a1ba53a6d2bb135d4',
  rwtCount: '1000',
  serialized: Buffer.from(parsedBox.sigma_serialize_bytes()).toString('base64'),
};
