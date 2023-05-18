import { TxBabbage } from '@cardano-ogmios/schema';

export class Transactions {
  static valid: TxBabbage = {
    witness: {
      signatures: {
        b32aa9008c013f71477787c47ef82dfe170eed2b5a1632ead59018df2b5bb0dc:
          'Qjnccpi1hDCsNl83/hXI05XhMDe5l+13sv0EhedscQ/h9YZV5rOnSSapZqhSCth7GBAjBPYOpcshCcetPOvWDw==',
      },
      scripts: {},
      datums: {},
      redeemers: {},
      bootstrap: [],
    },
    raw: 'hKQAgYJYIDrPzLuVuvxArVazBgdjXrQHfyGsl5SN44vd7t08hwOwAAGDglgdYcweLWYIZGKlVKTAgTzMLgHAbrNudt1QomirMU+CGgAUhR6hWByOPhkTH5bBhjNbI795g6sAhnqYfKkAq7J64PK5oURSU1RXGScQglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YghoAFIUeoVgcjj4ZEx+WwYYzWyO/eYOrAIZ6mHypAKuyeuDyuaFEUlNUVxoAAV+Qglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YGgBrYGMCGgAEK+EHWCAcJ4kT/FHM73aBkp/rYL5ls4O3QcXqaYu19TMsmL0WPaEAgYJYILMqqQCMAT9xR3eHxH74Lf4XDu0rWhYy6tWQGN8rW7DcWEBCOdxymLWEMKw2Xzf+FcjTleEwN7mX7Xey/QSF52xxD+H1hlXms6dJJqlmqFIK2HsYECME9g6lyyEJx60869YP9aEApWJ0b2RlcmdvaWJyaWRnZUZlZWQzMDAwam5ldHdvcmtGZWVjMzAwaXRvQWRkcmVzc3gzOWhaeFYzWU5TZmJDcVM2R0VzZXM3RGhBVlNhdHZhb050ZHNpTnZraW1QR0cyYzhmemtHb2Zyb21BZGRyZXNzSGFzaHhAN2JiNzE1Y2U3ZDQxMDc0N2JlYjk4Y2I2ZmIzMjJhNTg2NTg5NDAxODQzM2ViMTE1ZDY3NjI1YzViZWZiNmY2MQ==',
    id: '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
    body: {
      inputs: [
        {
          txId: '3acfccbb95bafc40ad56b30607635eb4077f21ac97948de38bddeedd3c8703b0',
          index: 0,
        },
      ],
      collaterals: [],
      references: [],
      collateralReturn: null,
      totalCollateral: null,
      outputs: [
        {
          address: 'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuzv',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(10000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(90000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(7037027),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
      certificates: [],
      withdrawals: {},
      fee: BigInt(273377),
      validityInterval: {
        invalidBefore: null,
        invalidHereafter: null,
      },
      update: null,
      mint: {
        coins: BigInt(0),
        assets: {},
      },
      network: null,
      scriptIntegrityHash: null,
      requiredExtraSignatures: [],
    },
    metadata: {
      hash: '1c278913fc51ccef7681929feb60be65b383b741c5ea698bb5f5332c98bd163d',
      body: {
        blob: {
          '0': {
            map: [
              {
                k: {
                  string: 'to',
                },
                v: {
                  string: 'ergo',
                },
              },
              {
                k: {
                  string: 'bridgeFee',
                },
                v: {
                  string: '3000',
                },
              },
              {
                k: {
                  string: 'networkFee',
                },
                v: {
                  string: '300',
                },
              },
              {
                k: {
                  string: 'toAddress',
                },
                v: {
                  string: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
                },
              },
              {
                k: {
                  string: 'fromAddress',
                },
                v: {
                  list: [
                    {
                      string:
                        '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
                    },
                  ],
                },
              },
            ],
          },
        },
        scripts: [],
      },
    },
    inputSource: 'inputs',
  };
  static invalidAddress: TxBabbage = {
    witness: {
      signatures: {
        b32aa9008c013f71477787c47ef82dfe170eed2b5a1632ead59018df2b5bb0dc:
          'Qjnccpi1hDCsNl83/hXI05XhMDe5l+13sv0EhedscQ/h9YZV5rOnSSapZqhSCth7GBAjBPYOpcshCcetPOvWDw==',
      },
      scripts: {},
      datums: {},
      redeemers: {},
      bootstrap: [],
    },
    raw: 'hKQAgYJYIDrPzLuVuvxArVazBgdjXrQHfyGsl5SN44vd7t08hwOwAAGDglgdYcweLWYIZGKlVKTAgTzMLgHAbrNudt1QomirMU+CGgAUhR6hWByOPhkTH5bBhjNbI795g6sAhnqYfKkAq7J64PK5oURSU1RXGScQglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YghoAFIUeoVgcjj4ZEx+WwYYzWyO/eYOrAIZ6mHypAKuyeuDyuaFEUlNUVxoAAV+Qglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YGgBrYGMCGgAEK+EHWCAcJ4kT/FHM73aBkp/rYL5ls4O3QcXqaYu19TMsmL0WPaEAgYJYILMqqQCMAT9xR3eHxH74Lf4XDu0rWhYy6tWQGN8rW7DcWEBCOdxymLWEMKw2Xzf+FcjTleEwN7mX7Xey/QSF52xxD+H1hlXms6dJJqlmqFIK2HsYECME9g6lyyEJx60869YP9aEApWJ0b2RlcmdvaWJyaWRnZUZlZWQzMDAwam5ldHdvcmtGZWVjMzAwaXRvQWRkcmVzc3gzOWhaeFYzWU5TZmJDcVM2R0VzZXM3RGhBVlNhdHZhb050ZHNpTnZraW1QR0cyYzhmemtHb2Zyb21BZGRyZXNzSGFzaHhAN2JiNzE1Y2U3ZDQxMDc0N2JlYjk4Y2I2ZmIzMjJhNTg2NTg5NDAxODQzM2ViMTE1ZDY3NjI1YzViZWZiNmY2MQ==',
    id: '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
    body: {
      inputs: [
        {
          txId: '3acfccbb95bafc40ad56b30607635eb4077f21ac97948de38bddeedd3c8703b0',
          index: 0,
        },
      ],
      collaterals: [],
      references: [],
      collateralReturn: null,
      totalCollateral: null,
      outputs: [
        {
          address: 'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuvz',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(10000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(90000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(7037027),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
      certificates: [],
      withdrawals: {},
      fee: BigInt(273377),
      validityInterval: {
        invalidBefore: null,
        invalidHereafter: null,
      },
      update: null,
      mint: {
        coins: BigInt(0),
        assets: {},
      },
      network: null,
      scriptIntegrityHash: null,
      requiredExtraSignatures: [],
    },
    metadata: {
      hash: '1c278913fc51ccef7681929feb60be65b383b741c5ea698bb5f5332c98bd163d',
      body: {
        blob: {
          '0': {
            map: [
              {
                k: {
                  string: 'to',
                },
                v: {
                  string: 'ergo',
                },
              },
              {
                k: {
                  string: 'bridgeFee',
                },
                v: {
                  string: '3000',
                },
              },
              {
                k: {
                  string: 'networkFee',
                },
                v: {
                  string: '300',
                },
              },
              {
                k: {
                  string: 'toAddress',
                },
                v: {
                  string: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
                },
              },
              {
                k: {
                  string: 'fromAddressHash',
                },
                v: {
                  string:
                    '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
                },
              },
            ],
          },
        },
        scripts: [],
      },
    },
    inputSource: 'inputs',
  };
  static noMetadata: TxBabbage = {
    witness: {
      signatures: {
        b32aa9008c013f71477787c47ef82dfe170eed2b5a1632ead59018df2b5bb0dc:
          'Qjnccpi1hDCsNl83/hXI05XhMDe5l+13sv0EhedscQ/h9YZV5rOnSSapZqhSCth7GBAjBPYOpcshCcetPOvWDw==',
      },
      scripts: {},
      datums: {},
      redeemers: {},
      bootstrap: [],
    },
    raw: 'hKQAgYJYIDrPzLuVuvxArVazBgdjXrQHfyGsl5SN44vd7t08hwOwAAGDglgdYcweLWYIZGKlVKTAgTzMLgHAbrNudt1QomirMU+CGgAUhR6hWByOPhkTH5bBhjNbI795g6sAhnqYfKkAq7J64PK5oURSU1RXGScQglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YghoAFIUeoVgcjj4ZEx+WwYYzWyO/eYOrAIZ6mHypAKuyeuDyuaFEUlNUVxoAAV+Qglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YGgBrYGMCGgAEK+EHWCAcJ4kT/FHM73aBkp/rYL5ls4O3QcXqaYu19TMsmL0WPaEAgYJYILMqqQCMAT9xR3eHxH74Lf4XDu0rWhYy6tWQGN8rW7DcWEBCOdxymLWEMKw2Xzf+FcjTleEwN7mX7Xey/QSF52xxD+H1hlXms6dJJqlmqFIK2HsYECME9g6lyyEJx60869YP9aEApWJ0b2RlcmdvaWJyaWRnZUZlZWQzMDAwam5ldHdvcmtGZWVjMzAwaXRvQWRkcmVzc3gzOWhaeFYzWU5TZmJDcVM2R0VzZXM3RGhBVlNhdHZhb050ZHNpTnZraW1QR0cyYzhmemtHb2Zyb21BZGRyZXNzSGFzaHhAN2JiNzE1Y2U3ZDQxMDc0N2JlYjk4Y2I2ZmIzMjJhNTg2NTg5NDAxODQzM2ViMTE1ZDY3NjI1YzViZWZiNmY2MQ==',
    id: '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
    body: {
      inputs: [
        {
          txId: '3acfccbb95bafc40ad56b30607635eb4077f21ac97948de38bddeedd3c8703b0',
          index: 0,
        },
      ],
      collaterals: [],
      references: [],
      collateralReturn: null,
      totalCollateral: null,
      outputs: [
        {
          address: 'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuzv',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(10000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(90000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(7037027),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
      certificates: [],
      withdrawals: {},
      fee: BigInt(273377),
      validityInterval: {
        invalidBefore: null,
        invalidHereafter: null,
      },
      update: null,
      mint: {
        coins: BigInt(0),
        assets: {},
      },
      network: null,
      scriptIntegrityHash: null,
      requiredExtraSignatures: [],
    },
    metadata: null,
    inputSource: 'inputs',
  };
  static invalidMetadata: TxBabbage = {
    witness: {
      signatures: {
        b32aa9008c013f71477787c47ef82dfe170eed2b5a1632ead59018df2b5bb0dc:
          'Qjnccpi1hDCsNl83/hXI05XhMDe5l+13sv0EhedscQ/h9YZV5rOnSSapZqhSCth7GBAjBPYOpcshCcetPOvWDw==',
      },
      scripts: {},
      datums: {},
      redeemers: {},
      bootstrap: [],
    },
    raw: 'hKQAgYJYIDrPzLuVuvxArVazBgdjXrQHfyGsl5SN44vd7t08hwOwAAGDglgdYcweLWYIZGKlVKTAgTzMLgHAbrNudt1QomirMU+CGgAUhR6hWByOPhkTH5bBhjNbI795g6sAhnqYfKkAq7J64PK5oURSU1RXGScQglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YghoAFIUeoVgcjj4ZEx+WwYYzWyO/eYOrAIZ6mHypAKuyeuDyuaFEUlNUVxoAAV+Qglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YGgBrYGMCGgAEK+EHWCAcJ4kT/FHM73aBkp/rYL5ls4O3QcXqaYu19TMsmL0WPaEAgYJYILMqqQCMAT9xR3eHxH74Lf4XDu0rWhYy6tWQGN8rW7DcWEBCOdxymLWEMKw2Xzf+FcjTleEwN7mX7Xey/QSF52xxD+H1hlXms6dJJqlmqFIK2HsYECME9g6lyyEJx60869YP9aEApWJ0b2RlcmdvaWJyaWRnZUZlZWQzMDAwam5ldHdvcmtGZWVjMzAwaXRvQWRkcmVzc3gzOWhaeFYzWU5TZmJDcVM2R0VzZXM3RGhBVlNhdHZhb050ZHNpTnZraW1QR0cyYzhmemtHb2Zyb21BZGRyZXNzSGFzaHhAN2JiNzE1Y2U3ZDQxMDc0N2JlYjk4Y2I2ZmIzMjJhNTg2NTg5NDAxODQzM2ViMTE1ZDY3NjI1YzViZWZiNmY2MQ==',
    id: '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
    body: {
      inputs: [
        {
          txId: '3acfccbb95bafc40ad56b30607635eb4077f21ac97948de38bddeedd3c8703b0',
          index: 0,
        },
      ],
      collaterals: [],
      references: [],
      collateralReturn: null,
      totalCollateral: null,
      outputs: [
        {
          address: 'addr1v8xputtxppjx9f255nqgz0xv9cquqm4ndemd659zdz4nznc7guuzv',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(10000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(90000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(7037027),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
      certificates: [],
      withdrawals: {},
      fee: BigInt(273377),
      validityInterval: {
        invalidBefore: null,
        invalidHereafter: null,
      },
      update: null,
      mint: {
        coins: BigInt(0),
        assets: {},
      },
      network: null,
      scriptIntegrityHash: null,
      requiredExtraSignatures: [],
    },
    metadata: {
      hash: '1c278913fc51ccef7681929feb60be65b383b741c5ea698bb5f5332c98bd163d',
      body: {
        scripts: [],
      },
    },
    inputSource: 'inputs',
  };
}
