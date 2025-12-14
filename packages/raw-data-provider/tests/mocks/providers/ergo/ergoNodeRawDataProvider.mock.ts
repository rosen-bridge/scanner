export const ergoNodeSampleObservation = {
  height: 1623165,
  block: 'fc68d9ce44c0edb98490e94688725248e246cc647b798ccb7d95f313522c31b2',
  sourceTxId:
    'fc68d9ce44c0edb98490e94688725248e246cc647b798ccb7d95f313522c31b2',
};

export const ergoNodeApiTx = {
  id: 'd6fe73dfffaad81b62ba3b39ddee787716521d0d33ef74cd89ffe29e4a3f3c84',
  inputs: [
    {
      boxId: '3a9de57d2e0673016f228ab40fb30b420efded877e2f14d83681d0600063cc32',
      value: 1000000,
      index: 0,
      spendingProof:
        'd84f50cf34e53fa67e2ae35ab640600a9579e20fb0746c2ecadaf77af7281c44e1359ed3b4b114969aaa3f1d3b2390254063c97a5be82619',
      outputBlockId:
        'e525a15ed98b23e099f7162b60c8ff6069114a360fe9c16b87aae8dc10dbf3b0',
      outputTransactionId:
        '1c7618fcb35ecc90fb790c37d39a3b5b137aaa21bdf1f6381da46d6e2a29e911',
      outputIndex: 0,
      outputGlobalIndex: 17750831,
      outputCreatedAt: 1676616,
      outputSettledAt: 1676618,
      ergoTree:
        '100504000400050004000e20011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887fd803d601b2a5730000d602e4c6a70407d603b2db6501fe730100ea02d1ededededed93e4c672010407720293e4c67201050ec5720391e4c672010605730293c27201c2a793db63087201db6308a7938cb2db63087203730300017304cd7202',
      ergoTreeConstants:
        '0: 0\n1: 0\n2: 0\n3: 0\n4: Coll(1,29,51,100,-34,7,-27,-94,111,12,78,-17,8,82,-51,-37,56,112,57,-87,33,-73,21,78,-13,-54,-78,44,110,-38,-120,127)',
      ergoTreeScript:
        '{\n  val box1 = OUTPUTS(placeholder[Int](0))\n  val ge2 = SELF.R4[GroupElement].get\n  val box3 = CONTEXT.dataInputs(placeholder[Int](1))\n  sigmaProp(\n    (\n      (\n        (((box1.R4[GroupElement].get == ge2) && (box1.R5[Coll[Byte]].get == box3.id)) && (box1.R6[Long].get > placeholder[Long](2))) && (\n          box1.propositionBytes == SELF.propositionBytes\n        )\n      ) && (box1.tokens == SELF.tokens)\n    ) && (box3.tokens(placeholder[Int](3))._1 == placeholder[Coll[Byte]](4))\n  ) && proveDlog(ge2)\n}',
      address:
        'AucEQEJ3Y5Uhmu4o8dsrHy28nRTgX5sVtXvjpMTqdMQzBR3uRVcvCFbv7SeGuPhQ16AXBP7XWdMShDdhRy4cayZgxHSkdAVuTiZRvj6WCfmhXJ4LY2E46CytRAnkiYubCdEroUUX2niMLhjNmDUn4KmXWSrKngrfGwHSaD8RJUMEp5AGADaChRU6kAnh9nstkDN3',
      assets: [
        {
          tokenId:
            '8c27dd9d8a35aac1e3167d58858c0a8b4059b277da790552e37eba22df9b9035',
          index: 0,
          amount: 1,
          name: 'ERGUSD-PT',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {
        R4: {
          serializedValue:
            '0702d681efeb2961e5f698fcb0b3a7ee8d65bca8983c9b1e59053a01f245b535af37',
          sigmaType: 'SGroupElement',
          renderedValue:
            '02d681efeb2961e5f698fcb0b3a7ee8d65bca8983c9b1e59053a01f245b535af37',
        },
        R5: {
          serializedValue:
            '0e20867cc98876fe05e331e8e67888d47c0c70f8691b194d859b5663ecedda3fd916',
          sigmaType: 'Coll[SByte]',
          renderedValue:
            '867cc98876fe05e331e8e67888d47c0c70f8691b194d859b5663ecedda3fd916',
        },
        R6: {
          serializedValue: '05c087cba80f',
          sigmaType: 'SLong',
          renderedValue: '2055823840',
        },
      },
    },
    {
      boxId: '1a12e5ca0b66b201e75d395d0b011c2da00efa333e441cac3da403a809fb3a55',
      value: 2186019000,
      index: 1,
      spendingProof:
        'bf9eea336d95884bc0a9aed9bd419c5aa5d70ef89508c50049c24c21104dd72ae3350b767499d1720d9e233fccaa6b2e7eec4cd953dd30fb',
      outputBlockId:
        '339f4db163dc0058afef5be84f5bf4a781fdd8232da5a58bfd8cadeb7c981f6b',
      outputTransactionId:
        'f3743b96452fc308d8c53c963569ba18b1fbcd0975e765ff7f8104391e0535fa',
      outputIndex: 2,
      outputGlobalIndex: 17750927,
      outputCreatedAt: 1676620,
      outputSettledAt: 1676621,
      ergoTree:
        '0008cd02d681efeb2961e5f698fcb0b3a7ee8d65bca8983c9b1e59053a01f245b535af37',
      ergoTreeConstants: '',
      ergoTreeScript: '{SigmaProp(ProveDlog(ECPoint(d681ef,6a61d4,...)))}',
      address: '9g9XpgahDd35GJLkdxL5mb9hqZZVFvRQJS1TmUw2aTaRmSvKovA',
      assets: [
        {
          tokenId:
            '1465c9b9de602bd75f8f38df83118e2c8b1d5b2f5518514dd1438149053652a8',
          index: 0,
          amount: 25000000,
          name: 'Dark Erdoge',
          decimals: 6,
          type: 'EIP-004',
        },
        {
          tokenId:
            '028ec31acacaa6aab6cd89a16cab5f9046cfea701262f8c9532ace433075353a',
          index: 1,
          amount: 21025,
          name: 'ClaimRSN.tech',
          decimals: 1,
          type: 'EIP-004',
        },
        {
          tokenId:
            'ed2197ebb2b958670cb568aeed54693617a3f3718d16d1a298b8c8d337193da0',
          index: 2,
          amount: 6105,
          name: 'ClaimRSN.tech',
          decimals: 1,
          type: 'EIP-004',
        },
        {
          tokenId:
            '31ac0f72b036502a17e27ff3bc9eb1b3ae4eef9aa4a3c3bd818475d6326cbd9f',
          index: 3,
          amount: 6105,
          name: 'ClaimRSN.tech',
          decimals: 1,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {},
    },
  ],
  dataInputs: [
    {
      boxId: 'ab00cf118c6c3f7b275e1646fca40b0b20ed7d07d330f6627d6e248a9d9d7567',
      value: 15803000000,
      index: 0,
      outputBlockId:
        '339f4db163dc0058afef5be84f5bf4a781fdd8232da5a58bfd8cadeb7c981f6b',
      outputTransactionId:
        'bbc8acf3ccfda36da2338f3970a91fd24a23d2d6fee6f496bc41136dba921d1a',
      outputIndex: 0,
      ergoTree:
        '1014040004000e208c27dd9d8a35aac1e3167d58858c0a8b4059b277da790552e37eba22df9b903504000400040204020101040205a0c21e040204080500040c040204a0c21e0402050a05c8010402d806d601b2a5730000d602b5db6501fed9010263ed93e4c67202050ec5a7938cb2db63087202730100017302d603b17202d604e4c6b272027303000605d605d90105049590720573047204e4c6b272029972057305000605d606b07202860273067307d901063c400163d803d6088c720601d6098c720801d60a8c72060286029a72097308ededed8c72080293c2b2a5720900d0cde4c6720a040792c1b2a5720900730992da720501997209730ae4c6720a0605ea02d1ededededededed93cbc27201e4c6a7060e927203730b93db63087201db6308a793e4c6720104059db07202730cd9010741639a8c720701e4c68c72070206057e72030593e4c6720105049ae4c6a70504730d92c1720199c1a77e9c9a7203730e730f058c72060292da720501998c72060173109972049d9c720473117312b2ad7202d9010763cde4c672070407e4c6b2a5731300040400',
      address:
        'NTkuk55NdwCXkF1e2nCABxq7bHjtinX3wH13zYPZ6qYT71dCoZBe1gZkh9FAr7GeHo2EpFoibzpNQmoi89atUjKRrhZEYrTapdtXrWU4kq319oY7BEWmtmRU9cMohX69XMuxJjJP5hRM8WQLfFnffbjshhEP3ck9CKVEkFRw1JDYkqVke2JVqoMED5yxLVkScbBUiJJLWq9BSbE1JJmmreNVskmWNxWE6V7ksKPxFMoqh1SVePh3UWAaBgGQRZ7TWf4dTBF5KMVHmRXzmQqEu2Fz2yeSLy23sM3pfqa78VuvoFHnTFXYFFxn3DNttxwq3EU3Zv25SmgrWjLKiZjFcEcqGgH6DJ9FZ1DfucVtTXwyDJutY3ksUBaEStRxoUQyRu4EhDobixL3PUWRcxaRJ8JKA9b64ALErGepRHkAoVmS8DaE6VbroskyMuhkTo7LbrzhTyJbqKurEzoEfhYxus7bMpLTePgKcktgRRyB7MjVxjSpxWzZedvzbjzZaHLZLkWZESk1WtdM25My33wtVLNXiTvficEUbjA23sNd24pv1YQ72nY1aqUHa2',
      assets: [],
      additionalRegisters: {
        R4: {
          serializedValue: '05c087cba80f',
          sigmaType: 'SLong',
          renderedValue: '2055823840',
        },
        R5: {
          serializedValue: '049cd5cc01',
          sigmaType: 'SInt',
          renderedValue: '1676622',
        },
        R6: {
          serializedValue:
            '0e206bc478bd3202f2dc05836788513d1f6bf20f48b94efd9cabb7f7c8e38ea82527',
          sigmaType: 'Coll[SByte]',
          renderedValue:
            '6bc478bd3202f2dc05836788513d1f6bf20f48b94efd9cabb7f7c8e38ea82527',
        },
      },
    },
  ],
  outputs: [
    {
      boxId: '1f0b387eba3e00ac0c57e46df25eb2b95373fa8bb1f9aa8db215f0786090d533',
      transactionId:
        'd6fe73dfffaad81b62ba3b39ddee787716521d0d33ef74cd89ffe29e4a3f3c84',
      value: 1000000,
      index: 0,
      globalIndex: 17750991,
      creationHeight: 1676621,
      settlementHeight: 1676623,
      ergoTree:
        '100504000400050004000e20011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887fd803d601b2a5730000d602e4c6a70407d603b2db6501fe730100ea02d1ededededed93e4c672010407720293e4c67201050ec5720391e4c672010605730293c27201c2a793db63087201db6308a7938cb2db63087203730300017304cd7202',
      ergoTreeConstants:
        '0: 0\n1: 0\n2: 0\n3: 0\n4: Coll(1,29,51,100,-34,7,-27,-94,111,12,78,-17,8,82,-51,-37,56,112,57,-87,33,-73,21,78,-13,-54,-78,44,110,-38,-120,127)',
      ergoTreeScript:
        '{\n  val box1 = OUTPUTS(placeholder[Int](0))\n  val ge2 = SELF.R4[GroupElement].get\n  val box3 = CONTEXT.dataInputs(placeholder[Int](1))\n  sigmaProp(\n    (\n      (\n        (((box1.R4[GroupElement].get == ge2) && (box1.R5[Coll[Byte]].get == box3.id)) && (box1.R6[Long].get > placeholder[Long](2))) && (\n          box1.propositionBytes == SELF.propositionBytes\n        )\n      ) && (box1.tokens == SELF.tokens)\n    ) && (box3.tokens(placeholder[Int](3))._1 == placeholder[Coll[Byte]](4))\n  ) && proveDlog(ge2)\n}',
      address:
        'AucEQEJ3Y5Uhmu4o8dsrHy28nRTgX5sVtXvjpMTqdMQzBR3uRVcvCFbv7SeGuPhQ16AXBP7XWdMShDdhRy4cayZgxHSkdAVuTiZRvj6WCfmhXJ4LY2E46CytRAnkiYubCdEroUUX2niMLhjNmDUn4KmXWSrKngrfGwHSaD8RJUMEp5AGADaChRU6kAnh9nstkDN3',
      assets: [
        {
          tokenId:
            '8c27dd9d8a35aac1e3167d58858c0a8b4059b277da790552e37eba22df9b9035',
          index: 0,
          amount: 1,
          name: 'ERGUSD-PT',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {
        R4: {
          serializedValue:
            '0702d681efeb2961e5f698fcb0b3a7ee8d65bca8983c9b1e59053a01f245b535af37',
          sigmaType: 'SGroupElement',
          renderedValue:
            '02d681efeb2961e5f698fcb0b3a7ee8d65bca8983c9b1e59053a01f245b535af37',
        },
        R5: {
          serializedValue:
            '0e20ab00cf118c6c3f7b275e1646fca40b0b20ed7d07d330f6627d6e248a9d9d7567',
          sigmaType: 'Coll[SByte]',
          renderedValue:
            'ab00cf118c6c3f7b275e1646fca40b0b20ed7d07d330f6627d6e248a9d9d7567',
        },
        R6: {
          serializedValue: '059cacd4a80f',
          sigmaType: 'SLong',
          renderedValue: '2055899918',
        },
      },
      spentTransactionId: null,
      mainChain: true,
    },
    {
      boxId: '251e063bd3f98be7dc83488c8a8d628a8d7e6877e7262ddaa94910e51857ded7',
      transactionId:
        'd6fe73dfffaad81b62ba3b39ddee787716521d0d33ef74cd89ffe29e4a3f3c84',
      value: 1100000,
      index: 1,
      globalIndex: 17750992,
      creationHeight: 1676621,
      settlementHeight: 1676623,
      ergoTree:
        '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
      ergoTreeConstants:
        '0: 0\n1: 0\n2: Coll(16,2,4,-96,11,8,-51,2,121,-66,102,126,-7,-36,-69,-84,85,-96,98,-107,-50,-121,11,7,2,-101,-4,-37,45,-50,40,-39,89,-14,-127,91,22,-8,23,-104,-22,2,-47,-110,-93,-102,-116,-57,-89,1,115,0,115,1)\n3: Coll(1)\n4: 1',
      ergoTreeScript:
        '{sigmaProp(\n  allOf(\n    Coll[Boolean](\n      HEIGHT == OUTPUTS(placeholder[Int](0)).creationInfo._1, OUTPUTS(placeholder[Int](1)).propositionBytes == substConstants(\n        placeholder[Coll[Byte]](2), placeholder[Coll[Int]](3), Coll[SigmaProp](proveDlog(decodePoint(minerPubKey)))\n      ), OUTPUTS.size == placeholder[Int](4)\n    )\n  )\n)}',
      address:
        '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
      assets: [],
      additionalRegisters: {},
      spentTransactionId:
        'ae6a1cfebe760a154c805f235845b5167cfad1e4277d834c24865e4a4e066784',
      mainChain: true,
    },
    {
      boxId: '6fb742ca8f099aa2bab0c0a2c40339042c5d3078ad054794ef0d2e399a6a973d',
      transactionId:
        'd6fe73dfffaad81b62ba3b39ddee787716521d0d33ef74cd89ffe29e4a3f3c84',
      value: 2184919000,
      index: 2,
      globalIndex: 17750993,
      creationHeight: 1676621,
      settlementHeight: 1676623,
      ergoTree:
        '0008cd02d681efeb2961e5f698fcb0b3a7ee8d65bca8983c9b1e59053a01f245b535af37',
      ergoTreeConstants: '',
      ergoTreeScript: '{SigmaProp(ProveDlog(ECPoint(d681ef,6a61d4,...)))}',
      address: '9g9XpgahDd35GJLkdxL5mb9hqZZVFvRQJS1TmUw2aTaRmSvKovA',
      assets: [
        {
          tokenId:
            '1465c9b9de602bd75f8f38df83118e2c8b1d5b2f5518514dd1438149053652a8',
          index: 0,
          amount: 25000000,
          name: 'Dark Erdoge',
          decimals: 6,
          type: 'EIP-004',
        },
        {
          tokenId:
            '028ec31acacaa6aab6cd89a16cab5f9046cfea701262f8c9532ace433075353a',
          index: 1,
          amount: 21025,
          name: 'ClaimRSN.tech',
          decimals: 1,
          type: 'EIP-004',
        },
        {
          tokenId:
            'ed2197ebb2b958670cb568aeed54693617a3f3718d16d1a298b8c8d337193da0',
          index: 2,
          amount: 6105,
          name: 'ClaimRSN.tech',
          decimals: 1,
          type: 'EIP-004',
        },
        {
          tokenId:
            '31ac0f72b036502a17e27ff3bc9eb1b3ae4eef9aa4a3c3bd818475d6326cbd9f',
          index: 3,
          amount: 6105,
          name: 'ClaimRSN.tech',
          decimals: 1,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {},
      spentTransactionId: null,
      mainChain: true,
    },
  ],
};

export const ergoNodeSampleObservationTxs = [ergoNodeApiTx];
