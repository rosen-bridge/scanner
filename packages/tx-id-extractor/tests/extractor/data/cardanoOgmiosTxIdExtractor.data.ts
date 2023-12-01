import { Transaction } from '@cardano-ogmios/schema';

const txs: Array<Transaction> = [
  {
    id: '7d1ae0c3fc6748fdb5c12bd6446d68637d14fe720624a8f1dc57395697e6e4ff',
    spends: 'inputs',
    inputs: [
      {
        transaction: {
          id: 'd2868ca51311236954208459ce7c91c04dd2b9bc5243c7885e78f781a8beba21',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'd2868ca51311236954208459ce7c91c04dd2b9bc5243c7885e78f781a8beba21',
        },
        index: 2,
      },
    ],
    outputs: [
      {
        address:
          'addr1zxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uw6j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq6s3z70',
        value: {
          ada: {
            lovelace: 4000000n,
          },
          da8c30857834c6ae7203935b89278c532b3995245295456f993e1d24: {
            '4c51': 202715624n,
          },
        },
        datumHash:
          '5d4738431b1f0f39c64d6c06d7f6c2e3f3bdd555d581f2e3eb19ffbae21767dc',
      },
      {
        address:
          'addr1qy649r55zlnva8c04r6h0pyrg8hhd3v7xe7aq6pl3ehfkj9exxtanlp8q8l5ar0g979lsvlnl7ra2m33g7ku6hllng9s2dg8mk',
        value: {
          ada: {
            lovelace: 10392132987n,
          },
        },
      },
    ],
    scriptIntegrityHash:
      '7825ecbe1c90962bf880d1d3fe53e63875c75f7b6d5a969222a9147c52dd875d',
    fee: {
      lovelace: 186753n,
    },
    validityInterval: {
      invalidAfter: 108390715,
    },
    metadata: {
      hash: 'b64602eebf602e8bbce198e2a1d6bbb2a109ae87fa5316135d217110d6d94649',
      labels: {
        '674': {
          json: [
            {
              msg: ['Minswap: Swap Exact In Order'],
            },
          ],
        },
      },
    },
    signatories: [
      {
        key: '74e1018d3eb3e7ba7e6120b26d8e48634a38aa9db93ef7a99b4ce8dba1ce6f5e',
        signature:
          'ad2c5bdef885bfe2fe0b3bde87bfe6e89f361f9655b70e379cdc21ab7d69b221ea725f4f2bd010956dff5d3e3a99b96bf5664831b367148ca64b3e04bffa9a0c',
      },
    ],
    datums: {
      '5d4738431b1f0f39c64d6c06d7f6c2e3f3bdd555d581f2e3eb19ffbae21767dc':
        'd8799fd8799fd8799f581c35528e9417e6ce9f0fa8f577848341ef76c59e367dd0683f8e6e9b48ffd8799fd8799fd8799f581cb93197d9fc2701ff4e8de82f8bf833f3ff87d56e3147adcd5fff9a0bffffffffd8799fd8799f581c35528e9417e6ce9f0fa8f577848341ef76c59e367dd0683f8e6e9b48ffd8799fd8799fd8799f581cb93197d9fc2701ff4e8de82f8bf833f3ff87d56e3147adcd5fff9a0bffffffffd87a80d8799fd8799f4040ff1a588909e8ff1a001e84801a001e8480ff',
    },
  },
  {
    id: '34fe18ea7d446836ee90b8f381273c955046b747decd50d00d4ce27bfdc96b75',
    spends: 'inputs',
    inputs: [
      {
        transaction: {
          id: 'fcb85e78f26b12508aa2ff5dd7f0d535e421ba8a2d7290775906a16d7236ae10',
        },
        index: 0,
      },
    ],
    outputs: [
      {
        address:
          'addr1q9frvl4a0wgmk4e28gu4asyqrd6ezd3wn3e2wdq4h3hn73zjxelt67u3hdtj5w3etmqgqxm4jymza8rj5u6pt0r08azq3pf2u9',
        value: {
          ada: {
            lovelace: 20809029373n,
          },
        },
      },
    ],
    fee: {
      lovelace: 170627n,
    },
    validityInterval: {
      invalidAfter: 108546959,
    },
    signatories: [
      {
        key: '6d4ae66bf2213ca5e6cd767f0120f52bf6c7f35edda4124bd1667217e4a5850e',
        signature:
          '732c35ba02d429339a51b69c3224ac23e89200ac6f4dc54da7d56ea32ac3036ca071b1bab8f0acd053fedbdfc7230f421d3b912c137db2ffa028284088ab7607',
      },
    ],
  },
  {
    id: '2da1a30e424ee89f35ac6ab1bad1897bba50ee5fae2f3b53cfe953b4cdfb71bf',
    spends: 'inputs',
    inputs: [
      {
        transaction: {
          id: 'b1a6ce48d1c4a7d202f57bb719e956561e212697ebeab43adfaffde6deacb697',
        },
        index: 9,
      },
    ],
    outputs: [
      {
        address:
          'addr1qyexjuz653mkcn63y6s3c5h2eldl0hytm0jr96tc93j46mw748kfcq5spqx4pxfpne0ppst4yaxm4pkynxeez8ng5p2s5lfj3v',
        value: {
          ada: {
            lovelace: 1801580n,
          },
          d3be72001ff380bfb3dfa10d16c90fed401f68cea9ed255c5ac65a98: {
            '4469616d6f6e6450617373333030': 1n,
            '4469616d6f6e6450617373333031': 1n,
            '4469616d6f6e6450617373333032': 1n,
            '4469616d6f6e6450617373333033': 1n,
            '4469616d6f6e6450617373333034': 1n,
            '4469616d6f6e6450617373333035': 1n,
            '4469616d6f6e6450617373333036': 1n,
            '4469616d6f6e6450617373333037': 1n,
            '4469616d6f6e6450617373333038': 1n,
            '4469616d6f6e6450617373333039': 1n,
          },
        },
      },
      {
        address:
          'addr1q9yecw2z89sagntsegtjuntw54rv2gpdjum3zxk62ckqvhttlfgjuflqucymmc6cpcszwxmf6prelgzy49s44r5r348q7lu35c',
        value: {
          ada: {
            lovelace: 2504211n,
          },
          d3be72001ff380bfb3dfa10d16c90fed401f68cea9ed255c5ac65a98: {
            '4469616d6f6e6450617373333130': 1n,
            '4469616d6f6e6450617373333131': 1n,
            '4469616d6f6e6450617373333132': 1n,
            '4469616d6f6e6450617373333133': 1n,
            '4469616d6f6e6450617373333134': 1n,
            '4469616d6f6e6450617373333135': 1n,
            '4469616d6f6e6450617373333136': 1n,
            '4469616d6f6e6450617373333137': 1n,
            '4469616d6f6e6450617373333138': 1n,
            '4469616d6f6e6450617373333139': 1n,
          },
        },
      },
    ],
    fee: {
      lovelace: 185389n,
    },
    validityInterval: {
      invalidBefore: 0,
      invalidAfter: 108390691,
    },
    signatories: [
      {
        key: '1acf544e9538a64dfdfcdd9cda5484b04c4f58e3443e1d2b645598c63023a587',
        signature:
          '26a837bd3c72c31096105139e32c2a0206466039cc62d899a41a878c6572815318f4b570e8121c5de50f1a254efdbc230aa278f1c6ac3dbe07671cc790381008',
      },
    ],
  },
];

export default txs;
