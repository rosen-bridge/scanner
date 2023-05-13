import { TxBabbage } from '@cardano-ogmios/schema';

const txs: Array<TxBabbage> = [
  {
    witness: {
      signatures: {
        '17c3e27674cf7b445ee0a70cff4a97949e72febb08a736b3155919c6988a8009':
          'SAtgyIxe92fjcp/DCI0sZU6nabPjnGABFIRRgRge+jUEpdZuIFyFcuTdbU6xQyEhhvD5eB7N8Ez/vobgI/PNDA==',
      },
      scripts: {},
      datums: {
        '6a9e7aea3327c68099419c5eb9823a6fd6828c4eb12035baa6578d57aaadc2fd':
          'd8799f581cd44960f38fa7e4020e8f0c77b93b6fcd084712baed45c15326f6fa6a9fd8799fd8799fd8799f581c0fde83c8318292af1712df02d4f2307d407189dc00cc718613f3db99ffd8799fd8799fd8799f581c740ee109e8c41fffc86aaa2a30421ee7a22ee32dae6943a8e3fd53c5ffffffffa140d8799f00a1401a0db3fee0ffffd8799fd8799fd8799f581c70e60f3b5ea7153e0acc7a803e4401d44b8ed1bae1c7baaad1a62a72ffd8799fd8799fd8799f581c1e78aae7c90cc36d624f7b3bb6d86b52696dc84e490f343eba89005fffffffffa140d8799f00a1401a02bd9960ffffd8799fd8799fd8799f581cd44960f38fa7e4020e8f0c77b93b6fcd084712baed45c15326f6fa6affd8799fd8799fd8799f581c962b173031329e3e460e7f1ca3244f752ddb5d58bea06e2560c47f00ffffffffa140d8799f00a1401a78965c80ffffffff',
        fa22872bd603d86f7ca18765403f73715590b647a165ddcca2ff7912e305d628:
          'd8799f581c5ea504edcfdf2f4ae7f1855b789ab4c0d9cb0f75cb941556d78cdfe39fd8799fd8799fd8799f581c0fde83c8318292af1712df02d4f2307d407189dc00cc718613f3db99ffd8799fd8799fd8799f581c740ee109e8c41fffc86aaa2a30421ee7a22ee32dae6943a8e3fd53c5ffffffffa140d8799f00a1401a0b532b80ffffd8799fd8799fd8799f581c70e60f3b5ea7153e0acc7a803e4401d44b8ed1bae1c7baaad1a62a72ffd8799fd8799fd8799f581c1e78aae7c90cc36d624f7b3bb6d86b52696dc84e490f343eba89005fffffffffa140d8799f00a1401a0243d580ffffd8799fd8799fd8799f581c5ea504edcfdf2f4ae7f1855b789ab4c0d9cb0f75cb941556d78cdfe3ffd8799fd8799fd8799f581c502e932249485d7fb4fe7787233ed4811daf1f43eabf859832c1b291ffffffffa1581c3ee441f40fe395a2e98eea1df7cf8816b0fca3d5d164893596ce306dd8799f00a14e4a656c6c7963756265202332343001ffffffff',
      },
      redeemers: {
        'spend:1': {
          redeemer: 'd87a80',
          executionUnits: { memory: 3506662, steps: 1012080542 },
        },
        'spend:2': {
          redeemer: 'd87a80',
          executionUnits: { memory: 880060, steps: 293519904 },
        },
      },
      bootstrap: [],
    },
    raw: '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',
    id: 'b68e461ca9cb160576848140b93d5dd47cc4f7d5dab91375b0e7b23b926cf328',
    body: {
      inputs: [
        {
          txId: '87aa4dfe118b116dcc2b02d0238aa1d81abcb0805d89f7ab1f92c6fc96444a4f',
          index: 2,
        },
        {
          txId: 'a4f2f6e256873979881f0ce15d672b280ce7333c3d7b5156d6e89bc125c7f64c',
          index: 0,
        },
        {
          txId: 'bde6bdc94b22c447f8d86e8c76b9315bc22d3d01209a0f3900cbc9a947774d33',
          index: 0,
        },
      ],
      collaterals: [
        {
          txId: 'abd60bdc14fa34b5ba24e13c1feb96b5be8abfe49cb1f354db019c22a7f0f57a',
          index: 0,
        },
      ],
      references: [
        {
          txId: '9a32459bd4ef6bbafdeb8cf3b909d0e3e2ec806e4cc6268529280b0fc1d06f5b',
          index: 0,
        },
      ],
      collateralReturn: {
        address:
          'addr1q82yjc8n37n7gqsw3ux80wfmdlxss3cjhtk5ts2nymm0565k9vtnqvfjnclyvrnlrj3jgnm49hd46k975phz2cxy0uqqkgy72f',
        value: { coins: BigInt(4130292), assets: {} },
        datumHash: null,
        datum: null,
        script: null,
      },
      totalCollateral: BigInt(869708),
      outputs: [
        {
          address:
            'addr1qy8aaq7gxxpf9tchzt0s948jxp75quvfmsqvcuvxz0eahxt5pmssn6xyrllus6429gcyy8h85ghwxtdwd9p63cla20zs7hk245',
          value: { coins: BigInt(190000000), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q9cwvremt6n320s2e3agq0jyq82yhrk3htsu0w426xnz5us70z4w0jgvcdkkynmm8wmds66jd9kusnjfpu6raw5fqp0sr07p5w',
          value: { coins: BigInt(38000000), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q9022p8del0j7jh87xz4k7y6knqdnjc0wh9eg92k67xdlc6s96fjyj2gt4lmflnhsu3na4yprkh37sl2h7zesvkpk2gsa93wjj',
          value: {
            coins: BigInt(1180940),
            assets: {
              '3ee441f40fe395a2e98eea1df7cf8816b0fca3d5d164893596ce306d.4a656c6c79637562652023323430':
                BigInt(1),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q82yjc8n37n7gqsw3ux80wfmdlxss3cjhtk5ts2nymm0565k9vtnqvfjnclyvrnlrj3jgnm49hd46k975phz2cxy0uqqkgy72f',
          value: { coins: BigInt(838407725), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q82yjc8n37n7gqsw3ux80wfmdlxss3cjhtk5ts2nymm0565k9vtnqvfjnclyvrnlrj3jgnm49hd46k975phz2cxy0uqqkgy72f',
          value: { coins: BigInt(419203863), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q82yjc8n37n7gqsw3ux80wfmdlxss3cjhtk5ts2nymm0565k9vtnqvfjnclyvrnlrj3jgnm49hd46k975phz2cxy0uqqkgy72f',
          value: { coins: BigInt(209601931), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q82yjc8n37n7gqsw3ux80wfmdlxss3cjhtk5ts2nymm0565k9vtnqvfjnclyvrnlrj3jgnm49hd46k975phz2cxy0uqqkgy72f',
          value: { coins: BigInt(104800966), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q82yjc8n37n7gqsw3ux80wfmdlxss3cjhtk5ts2nymm0565k9vtnqvfjnclyvrnlrj3jgnm49hd46k975phz2cxy0uqqkgy72f',
          value: { coins: BigInt(104221161), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
      certificates: [],
      withdrawals: {},
      fee: BigInt(579805),
      validityInterval: { invalidBefore: null, invalidHereafter: 85956075 },
      update: null,
      mint: { coins: BigInt(0), assets: {} },
      network: null,
      scriptIntegrityHash:
        'b8ddd14c576c97360fe3d09248b22c107a7851e47043bc1dec26fcc08891aa65',
      requiredExtraSignatures: [
        'd44960f38fa7e4020e8f0c77b93b6fcd084712baed45c15326f6fa6a',
      ],
    },
    metadata: null,
    inputSource: 'inputs',
  },
  {
    witness: {
      signatures: {
        '3c95c09e36c048f1fd711f02fd2816d3333c63871f52a330a883234b12032c3c':
          'Hh5LQzBTlJfywU4zS+xwJO1X45owh7NxAYksMHUsH61fDImP9ZYp448DslS0CFVUuv8rJuUj6Vb21jTBgDG8CA==',
      },
      scripts: {},
      datums: {
        '2d2990b57bb5c2031278893de105200f9e43b7d3381efce0ee9293a468efbcf9':
          'd8799f581c0a3bffe60265a7780f99654c1a498cea6361b0b9122742a1c985e0069fd8799fd8799fd8799f581c5b1f66f9ce6aa9da92021f1571665e7aa87eaafb85b9e97a3f6bfec3ffd8799fd8799fd8799f581cfef7dca3149e0f49706ecbc7219af18c3c859336c9d77aab8ad89b22ffffffffa140d8799f00a1401a008339c0ffffd8799fd8799fd8799f581c70e60f3b5ea7153e0acc7a803e4401d44b8ed1bae1c7baaad1a62a72ffd8799fd8799fd8799f581c1e78aae7c90cc36d624f7b3bb6d86b52696dc84e490f343eba89005fffffffffa140d8799f00a1401a00347d80ffffd8799fd8799fd8799f581c0a3bffe60265a7780f99654c1a498cea6361b0b9122742a1c985e006ffd8799fd8799fd8799f581cedf1d3edfed95f68f1f1fef122b10271cb8de9d2d6bcf9ee2a9daeb3ffffffffa140d8799f00a1401a0988cbc0ffffffff',
      },
      redeemers: {
        'spend:3': {
          redeemer: 'd87a80',
          executionUnits: { memory: 2783300, steps: 792406958 },
        },
      },
      bootstrap: [],
    },
    raw: 'hKkAhIJYIGiwsjXo1gXbeGkPy11lNblPgVVECauKsqfW+6bZkR1QAIJYIAdaUlbsoXCsp5WzYdEX0gU7iJEFcxFt7GYP2oFoQ9VHA4JYIAdaUlbsoXCsp5WzYdEX0gU7iJEFcxFt7GYP2oFoQ9VHBYJYIAdaUlbsoXCsp5WzYdEX0gU7iJEFcxFt7GYP2oFoQ9VHBAGFglg5AVsfZvnOaqnakgIfFXFmXnqofqr7hbnpej9r/sP+99yjFJ4PSXBuy8chmvGMPIWTNsnXequK2JsiGgCDOcCCWDkBcOYPO16nFT4KzHqAPkQB1EuO0brhx7qq0aYqch54qufJDMNtYk97O7bYa1JpbchOSQ80PrqJAF8aADR9gIJYOQEKO//mAmWneA+ZZUwaSYzqY2GwuRInQqHJheAG7fHT7f7ZX2jx8f7xIrECccuN6dLWvPnuKp2usxoJiMvAglg5ATXBCAlFZJo9msOfOfr+tNa9JWGnOEhq7U/Wl7FYFWVO5BRROERzRWu8gaAehL5kJdj4Zi6GoXuWghoAHoPgpFgcHX8zvSPYXhol2H2G+sTxmcMZei96/rZioPNOHqFQd29ybGRtb2JpbGV0b2tlbhoCLmQRWBx0KwBMQrbdf3k1yF9dOIQDd3jI2AoPlyTTtXBJok5DQ1IyMDIyQ0MwMjczNAFOQ0NSMjAyMkNDMDMxNDABWBykut6mZ3B2iwL/e5Z01EXxMBbOkBgE9FhE4A69o0tCSlNPR0MwMDM5MQFLQkpTT0dDMDA2MDEBS0JKU09HQzAwNjA0AVgc4oInHsklG6I/sSOw9TYYs1z1ps3kFwwAOg6/E6JIQkpTMDE5MTABSEJKUzA3Njc4AYJYOQE1wQgJRWSaPZrDnzn6/rTWvSVhpzhIau1P1pexWBVlTuQUUThEc0VrvIGgHoS+ZCXY+GYuhqF7lhoDBB0yAhoABpxqAxoFH5YBC1ggSxWrLo1Kh+2OnckSsWWXEKuObiswR8g1TV/+Xm2Fsw0NgYJYIELrcmmuZJqCYE9R1/aBYwC5zBT+H8x8U2hzYETq2MYHABCCWDkBNcEICUVkmj2aw585+v601r0lYac4SGrtT9aXsVgVZU7kFFE4RHNFa7yBoB6EvmQl2PhmLoahe5YaAEJgoREaAAnqnxKBglggmjJFm9Tva7r964zzuQnQ4+LsgG5MxiaFKSgLD8HQb1sAowCBglggPJXAnjbASPH9cR8C/SgW0zM8Y4cfUqMwqIMjSxIDLDxYQB4eS0MwU5SX8sFOM0vscCTtV+OaMIezcQGJLDB1LB+tXwyJj/WWKeOPA7JUtAhVVLr/KyblI+lW9tY0wYAxvAgEn9h5n1gcCjv/5gJlp3gPmWVMGkmM6mNhsLkSJ0KhyYXgBp/YeZ/YeZ/YeZ9YHFsfZvnOaqnakgIfFXFmXnqofqr7hbnpej9r/sP/2Hmf2Hmf2HmfWBz+99yjFJ4PSXBuy8chmvGMPIWTNsnXequK2Jsi/////6FA2HmfAKFAGgCDOcD//9h5n9h5n9h5n1gccOYPO16nFT4KzHqAPkQB1EuO0brhx7qq0aYqcv/YeZ/YeZ/YeZ9YHB54qufJDMNtYk97O7bYa1JpbchOSQ80PrqJAF//////oUDYeZ8AoUAaADR9gP//2Hmf2Hmf2HmfWBwKO//mAmWneA+ZZUwaSYzqY2GwuRInQqHJheAG/9h5n9h5n9h5n1gc7fHT7f7ZX2jx8f7xIrECccuN6dLWvPnuKp2us/////+hQNh5nwChQBoJiMvA//////8FgYQAA9h6gIIaACp4RBovOyuu9fY=',
    id: 'eb363721b5208e6738d9493c6016bc36121ae32a8165e1e9edd94568604a2b45',
    body: {
      inputs: [
        {
          txId: '075a5256eca170aca795b361d117d2053b88910573116dec660fda816843d547',
          index: 3,
        },
        {
          txId: '075a5256eca170aca795b361d117d2053b88910573116dec660fda816843d547',
          index: 4,
        },
        {
          txId: '075a5256eca170aca795b361d117d2053b88910573116dec660fda816843d547',
          index: 5,
        },
        {
          txId: '68b0b235e8d605db78690fcb5d6535b94f81554409ab8ab2a7d6fba6d9911d50',
          index: 0,
        },
      ],
      collaterals: [
        {
          txId: '42eb7269ae649a82604f51d7f6816300b9cc14fe1fcc7c5368736044ead8c607',
          index: 0,
        },
      ],
      references: [
        {
          txId: '9a32459bd4ef6bbafdeb8cf3b909d0e3e2ec806e4cc6268529280b0fc1d06f5b',
          index: 0,
        },
      ],
      collateralReturn: {
        address:
          'addr1qy6uzzqfg4jf50v6cw0nn7h7kntt6ftp5uuys6hdfltf0v2cz4j5aeq52yuygu69dw7grgq7sjlxgfwclpnzap4p0wtqyccedn',
        value: { coins: BigInt(4350113), assets: {} },
        datumHash: null,
        datum: null,
        script: null,
      },
      totalCollateral: BigInt(649887),
      outputs: [
        {
          address:
            'addr1q9d37eheee42nk5jqg032utxtea2sl42lwzmn6t68a4lasl77lw2x9y7payhqmktcuse4uvv8jzexdkf6aa2hzkcnv3qwp35r7',
          value: { coins: BigInt(8600000), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1q9cwvremt6n320s2e3agq0jyq82yhrk3htsu0w426xnz5us70z4w0jgvcdkkynmm8wmds66jd9kusnjfpu6raw5fqp0sr07p5w',
          value: { coins: BigInt(3440000), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qy9rhllxqfj6w7q0n9j5cxjf3n4xxcdshyfzws4pexz7qphd78f7mlketa50ru077y3tzqn3ewx7n5kkhnu7u25a46esx8gxaf',
          value: { coins: BigInt(159960000), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qy6uzzqfg4jf50v6cw0nn7h7kntt6ftp5uuys6hdfltf0v2cz4j5aeq52yuygu69dw7grgq7sjlxgfwclpnzap4p0wtqyccedn',
          value: {
            coins: BigInt(1999840),
            assets: {
              '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e':
                BigInt(36594705),
              '742b004c42b6dd7f7935c85f5d3884037778c8d80a0f9724d3b57049.4343523230323243433032373334':
                BigInt(1),
              '742b004c42b6dd7f7935c85f5d3884037778c8d80a0f9724d3b57049.4343523230323243433033313430':
                BigInt(1),
              'a4badea66770768b02ff7b9674d445f13016ce901804f45844e00ebd.424a534f47433030333931':
                BigInt(1),
              'a4badea66770768b02ff7b9674d445f13016ce901804f45844e00ebd.424a534f47433030363031':
                BigInt(1),
              'a4badea66770768b02ff7b9674d445f13016ce901804f45844e00ebd.424a534f47433030363034':
                BigInt(1),
              'e282271ec9251ba23fb123b0f53618b35cf5a6cde4170c003a0ebf13.424a533031393130':
                BigInt(1),
              'e282271ec9251ba23fb123b0f53618b35cf5a6cde4170c003a0ebf13.424a533037363738':
                BigInt(1),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qy6uzzqfg4jf50v6cw0nn7h7kntt6ftp5uuys6hdfltf0v2cz4j5aeq52yuygu69dw7grgq7sjlxgfwclpnzap4p0wtqyccedn',
          value: { coins: BigInt(50601266), assets: {} },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
      certificates: [],
      withdrawals: {},
      fee: BigInt(433258),
      validityInterval: { invalidBefore: null, invalidHereafter: 85956097 },
      update: null,
      mint: { coins: BigInt(0), assets: {} },
      network: null,
      scriptIntegrityHash:
        '4b15ab2e8d4a87ed8e9dc912b1659710ab8e6e2b3047c8354d5ffe5e6d85b30d',
      requiredExtraSignatures: [],
    },
    metadata: null,
    inputSource: 'inputs',
  },
  {
    witness: {
      signatures: {
        '2262a1687c24694ffc22311c3f48964fc1ab3ea5cefcecaf3ffd946eef89d064':
          'OffwPBLPBCeWKfl0BQbSY4yTd8FedXv4YqN1DQFkeCrThuzzIH4jfmRXyfhRrvxmzooRhBAGdpF5O1IEuExPAA==',
      },
      scripts: {},
      datums: {},
      redeemers: {},
      bootstrap: [],
    },
    raw: 'hKMAgYJYICiOhbPUdSqzxJFkB75Yd54Lfee+dOhFpc4Ui5z9ag/8AAGCglg5AdWKV+QkdpINVuyVsgfciZF+UnFPUzaHNgb5LZnjy2Jdg4KnK98ACrbpiFW/MyTo4/jF9iY4WSSHghoGALb0rVgcJfD8JA6RvZXc2uvSuncT/FForHcjSj15RJ/CDKFHU09DSUVUWRsAAAAC1YH7AFgcN4m7CfesKB4ElFX5tMpKkmh6q3yhPrRt+UcJnaRKSWtpZ2FpMjExMQFKSWtpZ2FpNDAwMAFKSWtpZ2FpNDA5OQFKSWtpZ2FpNDQ4MwFYHE0pIr2te9N+8ullHl65jltgc67oNFyEeQk+WxihRDB4YWkaAA9CQFgcVpcedcwQX2E8GqKu6vjFOpLvqF/QJcuP69ScwKJPU2Vla2VyT0dQYXNzMzExAU9TZWVrZXJPR1Bhc3M4NzABWBxewumBP6OF2TM9GBhtglfRs+vql73sLa10Am2NoUdQVUdDSElQGU6iWByAIcCrMoXMPP/yt+YeluzlZfs3J5tnZmdBWHtUoU9HaG9zdGNoYWluMDY2MzcBWBycJ81M8j9R8SUfUsruJY/tVsazCk31yiI6njRor05TZWVrZXJUb29sMDMxMQFOU2Vla2VyVG9vbDA1NzYBTlNlZWtlclRvb2wwNTk5AU5TZWVrZXJUb29sMDYzNQFOU2Vla2VyVG9vbDA5NzUBTlNlZWtlclRvb2wxODI0AU5TZWVrZXJUb29sMTkwOQFOU2Vla2VyVG9vbDE5MTYBTlNlZWtlclRvb2wyMTA1AU5TZWVrZXJUb29sMjE0MwFOU2Vla2VyVG9vbDIyMTYBTlNlZWtlclRvb2wyMjI2AU5TZWVrZXJUb29sMjMzNwFOU2Vla2VyVG9vbDI3NTkBTlNlZWtlclRvb2wyOTY5AVgcoAKPNQqqvgVF/ctWsDm/sI5LtNjE18PH1IHCNaFFSE9TS1katSa3LlgcpbsOW7J1pXPXRKAh+bO/9zWVRo4AJ1W0R+AVWbgjVkhPU0tZQ2FzaEdyYWIwMDAwMTA4NTQBVkhPU0tZQ2FzaEdyYWIwMDAxMDY5NzUBVkhPU0tZQ2FzaEdyYWIwMDAxMTc5OTgBVkhPU0tZQ2FzaEdyYWIwMDAyMDY0MzgBVkhPU0tZQ2FzaEdyYWIwMDAyMzUzMjYBVkhPU0tZQ2FzaEdyYWIwMDAyNTUyOTEBVkhPU0tZQ2FzaEdyYWIwMDAzMTY4NTMBVkhPU0tZQ2FzaEdyYWIwMDAzNDQ4NTUBVkhPU0tZQ2FzaEdyYWIwMDAzNDU4ODMBVkhPU0tZQ2FzaEdyYWIwMDAzNDY2NDgBVkhPU0tZQ2FzaEdyYWIwMDAzNTE0MTEBVkhPU0tZQ2FzaEdyYWIwMDAzNTE3NDQBVkhPU0tZQ2FzaEdyYWIwMDAzNTUxMjUBVkhPU0tZQ2FzaEdyYWIwMDAzNjgxMDIBVkhPU0tZQ2FzaEdyYWIwMDA0MDc4NDMBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MDkBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTABVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTEBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTIBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTMBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTQBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTUBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTYBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTcBVkhPU0tZQ2FzaEdyYWIwMDA0MTM4MTgBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNTYBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNTcBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNTgBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNTkBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNjABVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNjEBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNjIBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNjMBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNjQBVkhPU0tZQ2FzaEdyYWIwMDA0MTQwNjUBWBzTR0NUPMvaIruUhACkqRm3tU6CEjAwcC44zGK2ok5BTExFWUtBVFowNDQ2NQFOQUxMRVlLQVRaMDcxNzEBWBzVF/ON0sWswzR8jpM+LAGF+v47qDj4gwAAo8lfoU9NdXRhbnRDcm9jMDI5MTIBWBzw/0i7t7vp1ZpA8c6Q6enQ/1AC7EjyMrScoPuaoUh0b3BhbGFubwFYHP+xq+n+k+6fE4dEA6PU+K3apl+/ItXX9BwIfY6hRk1VVEFOVBhsglg5AaCO5qZ4ogfeUgYcTvmCCVJcmor4/ke7rdpQy4UkEtYNhflicDcaze+9un0HwVfVd6lqTxkYjLujghoAE3e6oVgc/7Gr6f6T7p8Th0QDo9T4rdqmX78i1df0HAh9jqFGTVVUQU5UCgIaAAT1BaEAgYJYICJioWh8JGlP/CIxHD9Ilk/Bqz6lzvzsrz/9lG7vidBkWEA59/A8Es8EJ5Yp+XQFBtJjjJN3wV51e/hio3UNAWR4KtOG7PMgfiN+ZFfJ+FGu/GbOihGEEAZ2kXk7UgS4TE8A9fY=',
    id: '04164b5e1a8465ccb8269b1b162b79e6a6ea6e27843c763325dbff8378f88ff8',
    body: {
      inputs: [
        {
          txId: '288e85b3d4752ab3c4916407be58779e0b7de7be74e845a5ce148b9cfd6a0ffc',
          index: 0,
        },
      ],
      collaterals: [],
      references: [],
      collateralReturn: null,
      totalCollateral: null,
      outputs: [
        {
          address:
            'addr1q82c54lyy3mfyr2kaj2myp7u3xghu5n3fafndpekqmujmx0red39mquz5u4a7qq2km5cs4dlxvjw3clcchmzvwzeyjrsaelkv9',
          value: {
            coins: BigInt(100710132),
            assets: {
              '25f0fc240e91bd95dcdaebd2ba7713fc5168ac77234a3d79449fc20c.534f4349455459':
                BigInt(12172000000),
              '3789bb09f7ac281e049455f9b4ca4a92687aab7ca13eb46df947099d.496b6967616932313131':
                BigInt(1),
              '3789bb09f7ac281e049455f9b4ca4a92687aab7ca13eb46df947099d.496b6967616934303030':
                BigInt(1),
              '3789bb09f7ac281e049455f9b4ca4a92687aab7ca13eb46df947099d.496b6967616934303939':
                BigInt(1),
              '3789bb09f7ac281e049455f9b4ca4a92687aab7ca13eb46df947099d.496b6967616934343833':
                BigInt(1),
              '4d2922bdad7bd37ef2e9651e5eb98e5b6073aee8345c8479093e5b18.30786169':
                BigInt(1000000),
              '56971e75cc105f613c1aa2aeeaf8c53a92efa85fd025cb8febd49cc0.5365656b65724f4750617373333131':
                BigInt(1),
              '56971e75cc105f613c1aa2aeeaf8c53a92efa85fd025cb8febd49cc0.5365656b65724f4750617373383730':
                BigInt(1),
              '5ec2e9813fa385d9333d18186d8257d1b3ebea97bdec2dad74026d8d.50554743484950':
                BigInt(20130),
              '8021c0ab3285cc3cfff2b7e61e96ece565fb37279b67666741587b54.47686f7374636861696e3036363337':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c30333131':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c30353736':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c30353939':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c30363335':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c30393735':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c31383234':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c31393039':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c31393136':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c32313035':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c32313433':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c32323136':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c32323236':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c32333337':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c32373539':
                BigInt(1),
              '9c27cd4cf23f51f1251f52caee258fed56c6b30a4df5ca223a9e3468.5365656b6572546f6f6c32393639':
                BigInt(1),
              'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235.484f534b59':
                BigInt(3039213358),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030303130383534':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030313036393735':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030313137393938':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030323036343338':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030323335333236':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030323535323931':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333136383533':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333434383535':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333435383833':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333436363438':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333531343131':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333531373434':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333535313235':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030333638313032':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343037383433':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383039':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383130':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383131':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383132':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383133':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383134':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383135':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383136':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383137':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343133383138':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303536':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303537':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303538':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303539':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303630':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303631':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303632':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303633':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303634':
                BigInt(1),
              'a5bb0e5bb275a573d744a021f9b3bff73595468e002755b447e01559.484f534b594361736847726162303030343134303635':
                BigInt(1),
              'd34743543ccbda22bb948400a4a919b7b54e82123030702e38cc62b6.414c4c45594b41545a3034343635':
                BigInt(1),
              'd34743543ccbda22bb948400a4a919b7b54e82123030702e38cc62b6.414c4c45594b41545a3037313731':
                BigInt(1),
              'd517f38dd2c5acc3347c8e933e2c0185fafe3ba838f8830000a3c95f.4d7574616e7443726f633032393132':
                BigInt(1),
              'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a.746f70616c616e6f':
                BigInt(1),
              'ffb1abe9fe93ee9f13874403a3d4f8addaa65fbf22d5d7f41c087d8e.4d5554414e54':
                BigInt(108),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qxsgae4x0z3q0hjjqcwya7vzp9f9ex52lrly0wadmfgvhpfyzttqmp0evfcrwxkda77m5lg8c9ta2aafdf83jxyvhw3sgp9v30',
          value: {
            coins: BigInt(1275834),
            assets: {
              'ffb1abe9fe93ee9f13874403a3d4f8addaa65fbf22d5d7f41c087d8e.4d5554414e54':
                BigInt(10),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
      certificates: [],
      withdrawals: {},
      fee: BigInt(324869),
      validityInterval: { invalidBefore: null, invalidHereafter: null },
      update: null,
      mint: { coins: BigInt(0), assets: {} },
      network: null,
      scriptIntegrityHash: null,
      requiredExtraSignatures: [],
    },
    metadata: null,
    inputSource: 'inputs',
  },
];

export default txs;
