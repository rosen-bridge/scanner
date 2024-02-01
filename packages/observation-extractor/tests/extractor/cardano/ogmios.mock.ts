import { Transaction } from '@cardano-ogmios/schema';

export class Transactions {
  static valid: Transaction = {
    id: '07c446bd320e3c2cf7cf11de7dcba5407828602f69c7684cf4d1ec1cfaf66557',
    spends: 'inputs',
    inputs: [
      {
        transaction: {
          id: '63c421154f43b4db2ddd6f2f7d299e9ea7c14d6e2d9a790e226e8d6782c6c3e3',
        },
        index: 0,
      },
      {
        transaction: {
          id: '65ab81b9fe128ff0e05adb2e974f6e89d5c7dabaab13d11b25f0dd56b0fa0e6e',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'dffdd2683799accacdeed4a7e5de1fcd007154495d573303a50b4b719c897181',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ff5ddf3f526a21e13627faf1c79b85dfb9ffca34dc8b4ae1295a8187f6b39a4d',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ffa716509340b109212c7596ec592cf6dfd45a4880cd967c0bd97fd61815e0bf',
        },
        index: 0,
      },
    ],
    outputs: [
      {
        address: 'addr1v9kmp9flrq8gzh287q4kku8vmad3vkrw0rwqvjas6vyrf9s9at4dn',
        value: {
          ada: {
            lovelace: 14271656n,
          },
        },
      },
      {
        address:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
        value: {
          ada: {
            lovelace: 5425547n,
          },
          fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48: {
            '546f6b656e2d6c6f656e': 162232n,
            '77724552472d6c6f656e': 3745344781n,
            '777252534e2d6c6f656e': 6026968n,
          },
        },
      },
    ],
    fee: {
      ada: {
        lovelace: 186533n,
      },
    },
    validityInterval: {},
    metadata: {
      hash: 'bb02d896eb2c7dd12a9b385239b62a4b3bf06bf6b368314aba0a2ee1300563fe',
      labels: {
        '0': {
          json: [
            {
              to: 'ergo',
            },
            {
              bridgeFee: '6800501',
            },
            {
              networkFee: '34003',
            },
            {
              toAddress: '9iD5jMoLjK9azTdigyT8z1QY6qHrA6gVrJamMF8MJ2qt45pJpDc',
            },
            {
              fromAddress: [
                'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8',
                '',
              ],
            },
          ],
        },
      },
    },
    signatories: [
      {
        key: '242d2707ba522fb61d20313f65c715587f65ef43df333156a0c16c879614e284',
        signature:
          '26dc6a08bdafb0dec98004bc435e9f38dcbfbefb2a30b84adaec493e202d0a88634ebc7a67790a5091862de5e81974546d0a71eb1ff5e28d50c7b3600ade630a',
      },
    ],
  };
  static invalidAddress: Transaction = {
    id: '07c446bd320e3c2cf7cf11de7dcba5407828602f69c7684cf4d1ec1cfaf66557',
    spends: 'inputs',
    inputs: [
      {
        transaction: {
          id: '63c421154f43b4db2ddd6f2f7d299e9ea7c14d6e2d9a790e226e8d6782c6c3e3',
        },
        index: 0,
      },
      {
        transaction: {
          id: '65ab81b9fe128ff0e05adb2e974f6e89d5c7dabaab13d11b25f0dd56b0fa0e6e',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'dffdd2683799accacdeed4a7e5de1fcd007154495d573303a50b4b719c897181',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ff5ddf3f526a21e13627faf1c79b85dfb9ffca34dc8b4ae1295a8187f6b39a4d',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ffa716509340b109212c7596ec592cf6dfd45a4880cd967c0bd97fd61815e0bf',
        },
        index: 0,
      },
    ],
    outputs: [
      {
        address:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
        value: {
          ada: {
            lovelace: 14271656n,
          },
        },
      },
      {
        address:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
        value: {
          ada: {
            lovelace: 5425547n,
          },
          fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48: {
            '546f6b656e2d6c6f656e': 162232n,
            '77724552472d6c6f656e': 3745344781n,
            '777252534e2d6c6f656e': 6026968n,
          },
        },
      },
    ],
    fee: {
      ada: {
        lovelace: 186533n,
      },
    },
    validityInterval: {},
    metadata: {
      hash: 'bb02d896eb2c7dd12a9b385239b62a4b3bf06bf6b368314aba0a2ee1300563fe',
      labels: {
        '0': {
          json: [
            {
              to: 'ergo',
            },
            {
              bridgeFee: '6800501',
            },
            {
              networkFee: '34003',
            },
            {
              toAddress: '9iD5jMoLjK9azTdigyT8z1QY6qHrA6gVrJamMF8MJ2qt45pJpDc',
            },
            {
              fromAddress: [
                'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8',
                '',
              ],
            },
          ],
        },
      },
    },
    signatories: [
      {
        key: '242d2707ba522fb61d20313f65c715587f65ef43df333156a0c16c879614e284',
        signature:
          '26dc6a08bdafb0dec98004bc435e9f38dcbfbefb2a30b84adaec493e202d0a88634ebc7a67790a5091862de5e81974546d0a71eb1ff5e28d50c7b3600ade630a',
      },
    ],
  };
  static noMetadata: Transaction = {
    id: '07c446bd320e3c2cf7cf11de7dcba5407828602f69c7684cf4d1ec1cfaf66557',
    spends: 'inputs',
    inputs: [
      {
        transaction: {
          id: '63c421154f43b4db2ddd6f2f7d299e9ea7c14d6e2d9a790e226e8d6782c6c3e3',
        },
        index: 0,
      },
      {
        transaction: {
          id: '65ab81b9fe128ff0e05adb2e974f6e89d5c7dabaab13d11b25f0dd56b0fa0e6e',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'dffdd2683799accacdeed4a7e5de1fcd007154495d573303a50b4b719c897181',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ff5ddf3f526a21e13627faf1c79b85dfb9ffca34dc8b4ae1295a8187f6b39a4d',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ffa716509340b109212c7596ec592cf6dfd45a4880cd967c0bd97fd61815e0bf',
        },
        index: 0,
      },
    ],
    outputs: [
      {
        address:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
        value: {
          ada: {
            lovelace: 14271656n,
          },
        },
      },
      {
        address:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
        value: {
          ada: {
            lovelace: 5425547n,
          },
          fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48: {
            '546f6b656e2d6c6f656e': 162232n,
            '77724552472d6c6f656e': 3745344781n,
            '777252534e2d6c6f656e': 6026968n,
          },
        },
      },
    ],
    fee: {
      ada: {
        lovelace: 186533n,
      },
    },
    validityInterval: {},
    signatories: [
      {
        key: '242d2707ba522fb61d20313f65c715587f65ef43df333156a0c16c879614e284',
        signature:
          '26dc6a08bdafb0dec98004bc435e9f38dcbfbefb2a30b84adaec493e202d0a88634ebc7a67790a5091862de5e81974546d0a71eb1ff5e28d50c7b3600ade630a',
      },
    ],
  };
  static invalidMetadata: Transaction = {
    id: '07c446bd320e3c2cf7cf11de7dcba5407828602f69c7684cf4d1ec1cfaf66557',
    spends: 'inputs',
    inputs: [
      {
        transaction: {
          id: '63c421154f43b4db2ddd6f2f7d299e9ea7c14d6e2d9a790e226e8d6782c6c3e3',
        },
        index: 0,
      },
      {
        transaction: {
          id: '65ab81b9fe128ff0e05adb2e974f6e89d5c7dabaab13d11b25f0dd56b0fa0e6e',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'dffdd2683799accacdeed4a7e5de1fcd007154495d573303a50b4b719c897181',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ff5ddf3f526a21e13627faf1c79b85dfb9ffca34dc8b4ae1295a8187f6b39a4d',
        },
        index: 0,
      },
      {
        transaction: {
          id: 'ffa716509340b109212c7596ec592cf6dfd45a4880cd967c0bd97fd61815e0bf',
        },
        index: 0,
      },
    ],
    outputs: [
      {
        address:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
        value: {
          ada: {
            lovelace: 14271656n,
          },
        },
      },
      {
        address:
          'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
        value: {
          ada: {
            lovelace: 5425547n,
          },
          fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48: {
            '546f6b656e2d6c6f656e': 162232n,
            '77724552472d6c6f656e': 3745344781n,
            '777252534e2d6c6f656e': 6026968n,
          },
        },
      },
    ],
    fee: {
      ada: {
        lovelace: 186533n,
      },
    },
    validityInterval: {},
    metadata: {
      hash: 'bb02d896eb2c7dd12a9b385239b62a4b3bf06bf6b368314aba0a2ee1300563fe',
      labels: {
        '0': {
          json: 'SPWH',
        },
      },
    },
    signatories: [
      {
        key: '242d2707ba522fb61d20313f65c715587f65ef43df333156a0c16c879614e284',
        signature:
          '26dc6a08bdafb0dec98004bc435e9f38dcbfbefb2a30b84adaec493e202d0a88634ebc7a67790a5091862de5e81974546d0a71eb1ff5e28d50c7b3600ade630a',
      },
    ],
  };
}
