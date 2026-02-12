export const cardanoSampleObservation = {
  height: 12443642,
  block: '3d70ea0f010c82930768e22c3b63c719ab21e20b8f39390c00d552ed9607ddd6',
  sourceTxId:
    'b61f73bb3e1d7cdbb6713539ab15629ba71fcc0707c19ff50090b85901041161',
};
export const cardanoSampleObservation2 = {
  height: 20,
  block: 'blockX',
  sourceTxId: 'txFail',
};
export const cardanoSampleObservation3 = {
  height: 30,
  block: 'blk123',
  sourceTxId: 'txErr',
};

export const cardanoSampleCbor = {
  tx_hash: 'b61f73bb3e1d7cdbb6713539ab15629ba71fcc0707c19ff50090b85901041161',
  block_hash:
    '3d70ea0f010c82930768e22c3b63c719ab21e20b8f39390c00d552ed9607ddd6',
  block_height: 12443642,
  epoch_no: 585,
  absolute_slot: 167403851,
  tx_timestamp: 1758970142,
  cbor: '84a400d90102828258205da7f21983029226b4b1e17f315d0df2791d3abbf5a875fb301a79138918c0fc01825820dea9ac94fc4c87082a30e2a63f0c6d54765430a99fc84bf81af46ebbe7b0968d00018282581d619094cba8ba84913562da8db43bdfd2033fbfd4e3c77111ff8b771fb3821a0011d28aa1581c57abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fba14972706e4575636c69641984d0825839011b2eff6f19da9c786a5be52986e4fa888754f48fdc82639073e4b9827cba6224d854f00de94428ff0024e297ad5ab773a19ed6fac80c40de821a002c1d05a1581c57abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fba14972706e4575636c69641a0087ac7d021a0002cfe107582010944512012a19e85d5f123de765ef7fb03229c5cacf95f2450df0d06b3af913a100d90102818258208f0487028a082f32820a6aad92e455104ceb56c3e846e210c5d83ee70e21d91a5840468822d10a8b540e529d98eada581e75b87dfc957e74e2c6e59f3f16ff6ef32e39af3fbb3e6cc69d3c34638925e1f6a2fefa1460f368f187077033a861b13706f5a100a562746f646572676f696272696467654665656531373234326a6e6574776f726b46656565313337393469746f41646472657373783339686167776e65484b4d424a484e37706e5238574c7744326e65354e5170575745434c45647778625339426d336969676d6b5a6b66726f6d4164647265737382784061646472317179646a616c6d30723864666337723274306a6a6e7068796c32796777343835336c77677963757377306a746e716e756866337a666b7a353771787827376a3370676c75717a6663356834346474777561706e6d7430346a7176677230717764396d716b',
};

export const cardanoSampleCborTxs = [
  {
    absolute_slot: 167403851,
    auxiliary_data: {
      metadata: {
        '0': '{"map":[{"k":{"string":"to"},"v":{"string":"ergo"}},{"k":{"string":"bridgeFee"},"v":{"string":"17242"}},{"k":{"string":"networkFee"},"v":{"string":"13794"}},{"k":{"string":"toAddress"},"v":{"string":"9hagwneHKMBJHN7pnR8WLwD2ne5NQpWWECLEdwxbS9Bm3iigmkZ"}},{"k":{"string":"fromAddress"},"v":{"list":[{"string":"addr1qydjalm0r8dfc7r2t0jjnphyl2ygw4853lwgycusw0jtnqnuhf3zfkz57qx"},{"string":"7j3pgluqzfc5h44dtwuapnmt04jqvgr0qwd9mqk"}]}}]}',
      },
      native_scripts: null,
      plutus_scripts: null,
      prefer_alonzo_format: false,
    },
    block_hash:
      '3d70ea0f010c82930768e22c3b63c719ab21e20b8f39390c00d552ed9607ddd6',
    block_height: 12443642,
    body: {
      auxiliary_data_hash:
        '10944512012a19e85d5f123de765ef7fb03229c5cacf95f2450df0d06b3af913',
      certs: null,
      collateral: null,
      collateral_return: null,
      current_treasury_value: null,
      donation: null,
      fee: '184289',
      inputs: [
        {
          index: 1n,
          transaction_id:
            '5da7f21983029226b4b1e17f315d0df2791d3abbf5a875fb301a79138918c0fc',
        },
        {
          index: 0n,
          transaction_id:
            'dea9ac94fc4c87082a30e2a63f0c6d54765430a99fc84bf81af46ebbe7b0968d',
        },
      ],
      mint: null,
      network_id: null,
      outputs: [
        {
          address: 'addr1vxgffjagh2zfzdtzm2xmgw7l6gpnl075u0rhzy0l3dm3lvc4c8lgh',
          amount: {
            coin: '1168010',
            multiasset: {
              '57abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fb': {
                '72706e4575636c6964': '34000',
              },
            },
          },
          plutus_data: null,
          script_ref: null,
        },
        {
          address:
            'addr1qydjalm0r8dfc7r2t0jjnphyl2ygw4853lwgycusw0jtnqnuhf3zfkz57qx7j3pgluqzfc5h44dtwuapnmt04jqvgr0qwd9mqk',
          amount: {
            coin: '2891013',
            multiasset: {
              '57abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fb': {
                '72706e4575636c6964': '8891517',
              },
            },
          },
          plutus_data: null,
          script_ref: null,
        },
      ],
      reference_inputs: null,
      required_signers: null,
      script_data_hash: null,
      total_collateral: null,
      ttl: null,
      update: null,
      validity_start_interval: null,
      voting_procedures: null,
      voting_proposals: null,
      withdrawals: null,
    },
    cbor: '84a400d90102828258205da7f21983029226b4b1e17f315d0df2791d3abbf5a875fb301a79138918c0fc01825820dea9ac94fc4c87082a30e2a63f0c6d54765430a99fc84bf81af46ebbe7b0968d00018282581d619094cba8ba84913562da8db43bdfd2033fbfd4e3c77111ff8b771fb3821a0011d28aa1581c57abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fba14972706e4575636c69641984d0825839011b2eff6f19da9c786a5be52986e4fa888754f48fdc82639073e4b9827cba6224d854f00de94428ff0024e297ad5ab773a19ed6fac80c40de821a002c1d05a1581c57abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fba14972706e4575636c69641a0087ac7d021a0002cfe107582010944512012a19e85d5f123de765ef7fb03229c5cacf95f2450df0d06b3af913a100d90102818258208f0487028a082f32820a6aad92e455104ceb56c3e846e210c5d83ee70e21d91a5840468822d10a8b540e529d98eada581e75b87dfc957e74e2c6e59f3f16ff6ef32e39af3fbb3e6cc69d3c34638925e1f6a2fefa1460f368f187077033a861b13706f5a100a562746f646572676f696272696467654665656531373234326a6e6574776f726b46656565313337393469746f41646472657373783339686167776e65484b4d424a484e37706e5238574c7744326e65354e5170575745434c45647778625339426d336969676d6b5a6b66726f6d4164647265737382784061646472317179646a616c6d30723864666337723274306a6a6e7068796c32796777343835336c77677963757377306a746e716e756866337a666b7a353771787827376a3370676c75717a6663356834346474777561706e6d7430346a7176677230717764396d716b',
    epoch_no: 585,
    is_valid: true,
    tx_hash: 'b61f73bb3e1d7cdbb6713539ab15629ba71fcc0707c19ff50090b85901041161',
    tx_timestamp: 1758970142,
    witness_set: {
      bootstraps: null,
      native_scripts: null,
      plutus_data: null,
      plutus_scripts: null,
      redeemers: null,
      vkeys: [
        {
          signature:
            '468822d10a8b540e529d98eada581e75b87dfc957e74e2c6e59f3f16ff6ef32e39af3fbb3e6cc69d3c34638925e1f6a2fefa1460f368f187077033a861b13706',
          vkey: 'ed25519_pk13uzgwq52pqhn9qs2d2ke9ez4zpxwk4kraprwyyx9mqlwwr3pmydq5kehf4',
        },
      ],
    },
  },
];

export const cardanoSampleBlock = { height: 10, hash: 'blockHash' };
