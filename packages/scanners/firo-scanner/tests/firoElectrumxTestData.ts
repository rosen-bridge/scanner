export const blockHeader = {
  hex: '020000000a1b2c3d4e5f6789abcdef01234567890abcdef0123456789abcdef0123456781a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b80924a663c2b0f1a00000000',
  hash: '7534b042d90bb78b3ea39f6b8e1da9bcda46ce24def6fcfef8adebf73b66f85e',
  parentHash:
    '78563412f0debc9a78563412f0debc0a8967452301efcdab89675f4e3d2c1b0a',
};

export const testTx = {
  hex: '0200000001deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef0300000000ffffffff0100e1f505000000001776a914abcdefabcdefabcdefabcdefabcdefabcdef88ac00000000',
  txid: '8020d39e6de747536c5fc08b32989615edf0fc9f6e068b301c2e53a1590fd8a0',
  expectedVin: [
    {
      txid: 'efbeaddeefbeaddeefbeaddeefbeaddeefbeaddeefbeaddeefbeaddeefbeadde',
      vout: 3,
    },
  ],
  expectedVout: [
    {
      value: 1.0,
      scriptHex: '76a914abcdefabcdefabcdefabcdefabcdefabcdef88ac',
    },
  ],
};

export const testTxV3 = {
  hex: '030008000100000000000000000000000000000000000000000000000000000000000000000000000000ffffffff0280f0fa020000000017a9141234567890abcdef1234567890abcdef123456788700a3e111000000001976a914deadbeefdeadbeefdeadbeefdeadbeefdeadbeef88ac0000000000',
  txid: '35e3e5391cca0b2938654a1bf1036a12e93f5c57c641640259a6c59b81771afc',
};
