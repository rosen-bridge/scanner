import { BlockEntity, Transaction } from '@rosen-bridge/scanner';
import { EventTriggerEntity } from '../../lib';

export const permitAddress =
  'EE7687i4URb4YuSGSQXPCbAjMfN4dUt5Qx8BqKZJiZhDY8fdnSUwcAGqAsqfn1tW1byXB8nDrgkFzkAFgaaempKxfcPtDzAbnu9QfknzmtfnLYHdxPPg7Qtjy7jK5yUpPQ2M4Ps3h5kH57xWDJxcKviEMY11rQnxATjTKTQgGtfzsAPpqsUyT2ZpVYsFzUGJ4nSj4WaDZSU1Hovv6dPkSTArLQSjp38wE72ae6hbNJwXGkqgfBtdVXcZVtnqevw9xUNcE6i942CQ9hVMfbdRobnsaLgsDLQomsh8jLMXqkMde5qH2vGBUqnLKgjxCZaa7vStpPXT5EuzLn9napGwUcbJjgRk69FsRSfCrcydZbYxw4Gnh6ZB9at2USpwL1HdVkHVh8M6Kbw6ppRfeG4JeFsUw33H4sSRk6UPqfuFcRUf7Cec2vmPezXTPT7CXQqEeCjxmWXqfyEQUfnCwpiH5fQ9A8CQ3jTyFhxBTpoGDdtiVCmhqhKxjh9M7gcjpr1dUjGMCWxjir94ejfq24XQrSscrZuUT5NVHTWAkzQ';
export const RWTId =
  '3c6cb596273a737c3e111c31d3ec868b84676b7bad82f9888ad574b44edef267';
export const commitmentAddress =
  '58grLgCGkazxJRdoVa73dDS2cFC2ZmfzWL3ibDeHPtcoXmWd72jjvjXX59Yi8S7MyLHGiWi44eRreMy1tz23AndoJVQMSatGFZnMzax3x4Xi8rJNsaKGSREEq4oY8gHJ53UtH7yW3D32HoFEkwrXNGCfzHCZ58jSuDzGxfmzWoLSFRqBAE7DFDjq1Ro6jVpJkQjNXwzKCPaSY2mLvFb9RSPLRSzMEW4A9Gjhr9MGnPaHD7L1WAk7c851Q66A3wKtFNzwts4cju48CEMMYZN3MzyzVeEAgsbnggNHA4RbQD2vDEZRNuYwruD9SWeJ337BsWnpJaXedkqu3sQREnA93U1Q2yeW2QRE3z77K7tiVjWziekFZW3Bbvy3MPURAAJpY1N3gEzhV3WLS48XZqYAVTRDBsXKWk1r5bNorRJUaXWSEvwRJNbJLsbhQD5WrZsVvkPXtjM1NG8Uyv96CSohKcuitgfpYrnvdGwyGyS2wRAf6UNveP73sJEpBFvEcFNJWmFkWwvEj9EAihGXcygTpkW5bNuEjt3jPwbavjtiRf74xD1z27FuT3bBdFF4hAr3tycJi4jzLHDMroQfaYMauwSWLrRCRq9w4HgaRAh8HeqYH1TVwi85dVrnmJCzzCPwycTk5ApgpoJLzarNMq5FSws9E6PXhTuNihgoTLQmehV2dSPLF8ATLFDxR1vaT8is3zGgs6Qg1ZfFmhe9poxvt2FjwYmnxTNMn5pgGCGf2eob8Ax1FfHLzh678kSxhGgxCa4bJeTfvZwPuXUBLrfAEbyR69XDSWruzxQffu6csRkCUEo49zTvU1YQZfLifXGo2RrZnihp545b3QuZL';
export const eventTriggerAddress =
  'LkY4RECaMvZiFwMrxpzB4uTr1ZqrKGFkZ5mUnoMPw7LEB5crVok7VueBVTS2NCMt5TYSaHRDiHnTezgGQvKcBMJUawkQEpGZWp87nLHHbaG3VaxxeQK94fxAj2zSzSU2svzA6DPrKR7JL4LZPLaW98cWBwk1YWQTqjWebTgvPkMvqYKsGgjn8Zk6uxEiXvRLzfDvGutVAmNRzcXwU9NjdBKSJrfpWFoFLMDY3chG2gcCSYiYjnqYW1sQNEcnDPJscNbcoFYEonUojtZ6m1zjwvWHXcH5UpKk9SEmxemgi7x1ezKnYJupbHsaiGEJEhtcAUWmMCSJH5iRQZQbKAud5qYDM7VX3MAqaAv9wB6uRaGKuoKShyzP';
export const block: BlockEntity = {
  id: 1,
  height: 10,
  hash: 'hash',
  parentHash: 'parentHash',
  status: 'hi',
  scanner: '1',
  timestamp: 10,
};
export const block2: BlockEntity = {
  id: 2,
  height: 11,
  hash: 'hash2',
  parentHash: 'parentHash2',
  status: 'hi',
  scanner: '1',
  timestamp: 11,
};

export const sampleEventEntity: EventTriggerEntity = {
  id: 10,
  txId: 'txId',
  eventId: 'eventId',
  extractor: 'extractorId',
  boxId: 'id',
  boxSerialized: 'boxSerialized',
  block: 'hash',
  height: 10,
  toAddress: 'cardanoAddr2',
  fromChain: 'ergo',
  toChain: 'cardano',
  fromAddress: 'address',
  amount: '17',
  bridgeFee: '34',
  networkFee: '51',
  sourceChainTokenId: 'sourceToken',
  targetChainTokenId: 'targetToken',
  sourceTxId: 'txId',
  sourceBlockId: 'blockId',
  WIDsCount: 0,
  WIDsHash: '',
  sourceChainHeight: 10,
};

export const sampleExtractedPermit = {
  boxId: '1',
  boxSerialized: 'serialized1',
  WID: 'wid1',
  txId: 'txId1',
  block: 'blockId',
  height: 100,
};

export const last10BlockHeader = [
  {
    extensionId:
      '27143b3ad6607ca59fc6b882a96d999c1147dbedb4caa3c945208318feb6ef76',
    difficulty: '5635571712',
    votes: '000000',
    timestamp: 1653932558503,
    size: 221,
    stateRoot:
      'b3e7d62d8c8d7d6ae38a69b2c369d307c2b41d01f21a313bd4b98345a1551e9516',
    height: 215806,
    nBits: 83972072,
    version: 2,
    id: '9dbe11053b952358e555451169ec9df7f0583bd80e822c0e8a71907edc3fe9af',
    adProofsRoot:
      '4087e5f27842be6105e553d8f7a29a75ad59a04884014d5634bab29b68f6985c',
    transactionsRoot:
      '87a0d482a763d1933edff775e469f8e0f618d1bbc0a3dbaf14e98a9538908c8f',
    extensionHash:
      '29a8cd654991d2cfac09c9e78b1f58730ff3577ad0afd42f13b58e47a62f7277',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '00000000b7f19562',
      d: 0,
    },
    adProofsId:
      'cb91890c525e1f13b84bf5af7178c6dfc55125f3b6a7b16f3891064a8434d717',
    transactionsId:
      '7986444f8f181172e32272df7e7d1bd1fab520f024230802f6bde38c77262b5e',
    parentId:
      '8718e93fa6ea4ec8b3f955b654acf0d6f594e1420df2da4907b8c2eebdecc686',
  },
  {
    extensionId:
      'e04c61992a27ce4ebe82809f94b8290c078397830a24779908ddd52cd092c6f5',
    difficulty: '5635571712',
    votes: '000000',
    timestamp: 1653932631795,
    size: 221,
    stateRoot:
      '7e56555ce442061f504f92047579f9afef9b2acb259edd56e419dfcecc5df4e716',
    height: 215807,
    nBits: 83972072,
    version: 2,
    id: '4fdbd7ec22ec03477b5b4cb04239c8b30f6f95ac7a3add388cb5a1eae993d2b1',
    adProofsRoot:
      '73cf773ab227ce9b74960397616c9fd89d57bb857c8eac912c0c3d2773e9412b',
    transactionsRoot:
      'b0e5ca1a2ebeda25087cd601f51485103b12a3dd4492c47419b52c1684738b78',
    extensionHash:
      '29a8cd654991d2cfac09c9e78b1f58730ff3577ad0afd42f13b58e47a62f7277',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '0000000381e364f9',
      d: 0,
    },
    adProofsId:
      '2ca8e8de7ca57ca155476cd83314f2e11d61d058baec7951fad80d98523f560d',
    transactionsId:
      'e2e6ecb25b549ab3ebff505c3cf4a356a4df3b3f869fbc9082018cead4fa141f',
    parentId:
      '9dbe11053b952358e555451169ec9df7f0583bd80e822c0e8a71907edc3fe9af',
  },
  {
    extensionId:
      'ef8ac46dbcfdcb0fe04fda74f6d206f92a0235be1c4643f7e5bc901d7ddae079',
    difficulty: '5635571712',
    votes: '000000',
    timestamp: 1653932970497,
    size: 221,
    stateRoot:
      'e3256897e8d264de11a7a2dbde246602d6d89c63c9c3d17dab67b6d5de5b32c816',
    height: 215808,
    nBits: 83972072,
    version: 2,
    id: '7acaca47daadf829438baa14b32f2fcd026937636b6fcd3d05e40d3c43215e46',
    adProofsRoot:
      '32e49ee8e06bac632a71b20649d6a226f9a916103991d5664d5fa76ea73e1da8',
    transactionsRoot:
      '7d758d1ceec75791f11171483c3d2703b047d38ce52e7470662613031e9fb313',
    extensionHash:
      '9c77092d2e63fdf246cd894527c185947bfea37e6511665dba16a1f9790673fa',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '000000026912218c',
      d: 0,
    },
    adProofsId:
      'bcd7a97e0e5b51be17204c16168d37310d17e43bb3242753f92e2a463619f9e4',
    transactionsId:
      '54319ad6b9f7ca7b3d9f8d467fe31e56d65841cc24e983a300a4fcf89b2c5888',
    parentId:
      '4fdbd7ec22ec03477b5b4cb04239c8b30f6f95ac7a3add388cb5a1eae993d2b1',
  },
  {
    extensionId:
      'b08fef096a9cf24bad3a7e7e049b6b812ca43b51795e4a643591e05ec2f0196f',
    difficulty: '5090705408',
    votes: '000000',
    timestamp: 1653933205053,
    size: 220,
    stateRoot:
      'e318a25a13dfd14ae41e3820097c33b7d49e8b9bc479d13c93a8d98601588fd316',
    height: 215809,
    nBits: 83963758,
    version: 2,
    id: 'f91cdc031f9ab8451b39a3b292781325cd3941393e1967319df4c5e593daa593',
    adProofsRoot:
      '37d2632b0092dae168e0bccc5192173f12c7d43e631b0f9c4d4bb76d34b0502f',
    transactionsRoot:
      '226640250d9c7e4f317da15ab2b05c96f70dfc387ac3be2b79917592c24dea29',
    extensionHash:
      'e8d3674f5f14dd2f1eced0aa1f74e23a3294dc62bbd018c349666dcf5de38bad',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '000000017bd52182',
      d: 0,
    },
    adProofsId:
      '714677588ae780b6b432e8f53e5d6b0399506a7eda24e300199df9c62de32198',
    transactionsId:
      '3a13afd7c9c6d54f5c888213bc88311d75feef789664902155770d605c01eca2',
    parentId:
      '7acaca47daadf829438baa14b32f2fcd026937636b6fcd3d05e40d3c43215e46',
  },
  {
    extensionId:
      'a91cbd4ff37c5c29e01c36524a24d6f54b3f97396080b8c5d782650104b952d8',
    difficulty: '5090705408',
    votes: '000000',
    timestamp: 1653933351656,
    size: 220,
    stateRoot:
      '022494222deea6d3fa1145a27b5782f383e01cc96555e28a2bd7a11187d87a5816',
    height: 215810,
    nBits: 83963758,
    version: 2,
    id: 'c3abfe4d6bad9f19a84c11a7dda4e7b0cca1e4aa42f50f34f395f8a6f898d622',
    adProofsRoot:
      'ae47944cf48005cc54caa538bbcee25480f0c82a8bb0dd23ca92a9a481cb6ce7',
    transactionsRoot:
      'b34ec763e862304f470373d6556f0c0e4fd9e14e5ba8f542d350ea9c29e850f3',
    extensionHash:
      'e8d3674f5f14dd2f1eced0aa1f74e23a3294dc62bbd018c349666dcf5de38bad',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '00000000d2fbb6d3',
      d: 0,
    },
    adProofsId:
      '58ff7896d75c302420c2b52ced0d8a3750a4b747824ba181765cb6f8861863f1',
    transactionsId:
      '1766ccdd64d8601403c1262bd187db9ebb26dc5adb9ae7100ef92c24472763fa',
    parentId:
      'f91cdc031f9ab8451b39a3b292781325cd3941393e1967319df4c5e593daa593',
  },
  {
    extensionId:
      '9bdebff276f7cf8051ee9f217bcd319f30b1befb9098f2343652a90a7c635039',
    difficulty: '5090705408',
    votes: '000000',
    timestamp: 1653933434918,
    size: 220,
    stateRoot:
      '4277cabc6bff122c93b7f4f84924733c38278c5a739c0e538452e670dd1e838816',
    height: 215811,
    nBits: 83963758,
    version: 2,
    id: '75a8f5b78624bb5eb4f8e3ac702f80eb10d3a05feeb50d1c8e1e7e17f8fb61b3',
    adProofsRoot:
      '0f193db5aacec6ef6d85177100244b12415b80f196964f523338b6c6a0140247',
    transactionsRoot:
      'ece2b525d82bd7620ccd8e6c79bf6a56ca22bdafe830e22022dd8bbbc9f946fa',
    extensionHash:
      '66c134df905d7d1d263ebe638d97d384af93ba592954d55fc865b9e54eef70f2',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '00000000202e9454',
      d: 0,
    },
    adProofsId:
      '139cf63bd95bf0068c6dedc1f22b3925b37256b3401d4db0dbbb58e8fe391626',
    transactionsId:
      'ae6e3aca91077dbb894e0e0f2b136049d8ba2791958a5df932dbb654d2f6f034',
    parentId:
      'c3abfe4d6bad9f19a84c11a7dda4e7b0cca1e4aa42f50f34f395f8a6f898d622',
  },
  {
    extensionId:
      '3396ffe01e400d4eda6f51745e901f1b22b5b75c7a4da209426de9450d7c2f32',
    difficulty: '5090705408',
    votes: '000000',
    timestamp: 1653933451736,
    size: 220,
    stateRoot:
      'c216821348f1fe154902da75a97c6861e061fa4cb0d84de1ebd27b994bba71ef16',
    height: 215812,
    nBits: 83963758,
    version: 2,
    id: 'b40264ee73987b5919b40f679d4a23cb52aad5d3e9b9f052e76ab2f4c2e03c08',
    adProofsRoot:
      '4a8acc9bf0ccc863c0a4c973ccd60dfab47e4548b139069cf0963b2216e7300f',
    transactionsRoot:
      'a84c2e3e3b8191783f887d8ab61e3982e011da21a69f658f78e1e561ca589bb7',
    extensionHash:
      '92f4f29731ee9bd01d8d39d1256dc7b55a03cef7f8e445f12afe74705517985c',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '0000000094978b6a',
      d: 0,
    },
    adProofsId:
      '5b2d299f412b8066b16e9b3cf9f6e1de2c62302db25bda1346f7ccefaf0d6d9e',
    transactionsId:
      'b7035ad8507fac49f46e14fc2e414239474ad045f29b6f198b565dec77639602',
    parentId:
      '75a8f5b78624bb5eb4f8e3ac702f80eb10d3a05feeb50d1c8e1e7e17f8fb61b3',
  },
  {
    extensionId:
      '1ad0f5ea4d0249da84cef643b07ebb499a09d6a08e115ec35d521bcceb668f7e',
    difficulty: '5090705408',
    votes: '000000',
    timestamp: 1653933511999,
    size: 220,
    stateRoot:
      '85ee11729ac50ad30eb4cd5937f10e1453eec800fbea6276c76e9b0b10da551f16',
    height: 215813,
    nBits: 83963758,
    version: 2,
    id: '07c4231ad059271f87926baba27ffc59cc9df23b3bb74bbfc958e1e267e55657',
    adProofsRoot:
      '3d26bf3d3a77f7c3cd79c70bdad0233b26f20ffc7799c1797397995917d4c941',
    transactionsRoot:
      '1b0fdd82251cdd998868c44ff247b1f3309aee4f7685bef57d4815883f0974cf',
    extensionHash:
      '92f4f29731ee9bd01d8d39d1256dc7b55a03cef7f8e445f12afe74705517985c',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '000000008c46fe39',
      d: 0,
    },
    adProofsId:
      '6979d03b995a191e2aff734e1b12c44b4852ab782260b1da21f1ec0473cbb09e',
    transactionsId:
      '2b64466b904e59552d5796e99b0428b24e85a79da180d5b4ca4d9f05289dc562',
    parentId:
      'b40264ee73987b5919b40f679d4a23cb52aad5d3e9b9f052e76ab2f4c2e03c08',
  },
  {
    extensionId:
      'ae51baeb1dd8f68fc9bc5c5d7ddfe227fc1a453045ce5704d2f57b5f7d5c0f9d',
    difficulty: '5090705408',
    votes: '000000',
    timestamp: 1653933569225,
    size: 220,
    stateRoot:
      '870b8cc02f42360bef9766dc42c58a7eac71a12ef186e8b6498b859b304c835516',
    height: 215814,
    nBits: 83963758,
    version: 2,
    id: '2aeed311b23c92427c16f2262bde3396484e109fcddb4f1a56aa1dd5a7b2113b',
    adProofsRoot:
      'c4cd0df1ee4cad41a010732e21ffd0d073bde060145c640b31aac508a4668594',
    transactionsRoot:
      '935b773457cb4065b7947bc1600b8849707cd70f9f8ca4520adc288f2d4a3d80',
    extensionHash:
      'c5556727874b10550de7a90240f1bbe9d1e1dcef5741e34d93b73d592a2b4c93',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '0000000085faadb5',
      d: 0,
    },
    adProofsId:
      'de0e6fa550cbf280f0fdf01aca7ae06acc4ee6944073080d822ff2346a2d7098',
    transactionsId:
      'fa989159c28706c7700cc9f09dc215e4c7da17343fd5b12bd2473921ff2bbc3f',
    parentId:
      '07c4231ad059271f87926baba27ffc59cc9df23b3bb74bbfc958e1e267e55657',
  },
  {
    extensionId:
      'a5d21ffb6ba8a35c3b5450d6ccb9eb2073cd588a57bdcaa4a767199e74d83576',
    difficulty: '5090705408',
    votes: '000000',
    timestamp: 1653933624717,
    size: 220,
    stateRoot:
      '364c459ee947d41d618411a398b0fb4ed77e2d5188727ff3abc8476f45defc4116',
    height: 215815,
    nBits: 83963758,
    version: 2,
    id: '98ed9df1f0f54d18180fb8957ee364e1e94b68ded4fc55eb52d15a56dbb7e53d',
    adProofsRoot:
      '82a0c03bab1d69677ffa5ce2b180b37bd461e34239e036f0f21cbc9eb515afa9',
    transactionsRoot:
      '5d0d691a780bd078d21b6484d4f72b91a8f70d553b25546938bd16831f27f3d9',
    extensionHash:
      'c5556727874b10550de7a90240f1bbe9d1e1dcef5741e34d93b73d592a2b4c93',
    powSolutions: {
      pk: '03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a',
      w: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      n: '00000000aa7f2207',
      d: 0,
    },
    adProofsId:
      '58679314a2d9d6432c34577787701555a4ed778574b877d1e4c23c12f09600a9',
    transactionsId:
      '2ac59a2e809aa9f92ea8106aea9de46822a80758d5899f337dac1baf19215ee3',
    parentId:
      '2aeed311b23c92427c16f2262bde3396484e109fcddb4f1a56aa1dd5a7b2113b',
  },
];

export const addressBoxes = {
  items: [
    {
      boxId: '84c19f45cdfc7c35547deefe0e513a7e42919365c17f588536ef61b6885765f1',
      transactionId:
        '0734350dc4760e5596af44de772a1d00ced823a3a02a99bce807c7640e4b72db',
      blockId:
        '29344bbae793ed459fed6ab319ce618b3a77b4fe9c41fb7d7f8f067e4f4a24bf',
      value: 1100000n,
      index: 0,
      globalIndex: 632076n,
      creationHeight: 295143,
      settlementHeight: 295145,
      ergoTree:
        '10130400040004040400040204000e20a29d9bb0d622eb8b4f83a34c4ab1b7d3f18aaaabc3aa6876912a3ebaf0da10180404040004000400010104020400040004000e2064cc72f329f5db7b69667a10af3e1726161b9b7ce918a794ea80b9c32c4ce38805020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      address:
        'EE7687i4URb4YuSGSQXPCbAgnr73Bb67aXgwzpjguuNwyRrWwVamRPKsiE3hbewDFDzkQa2PDdQG1S3KGcPbbPqvaT15RXFcCELtrAJ5BeZJFf9EfumFNWKztr7Me5Z23TRUPNgbcYEpCkC3RJeui3Tv6jXbEF2v284inu65FisnWoicPvpbuJb3fHpLkr5JAFPcp6uGTqTaaNWMJxWrHRbpKtvwVjG2VibGBGZJPtMbG3pzryH7Aq6CtLKtCAkSivDUkQWbXpm7TuvMnRCL78LvdoqauB8fRHxxxMw5BbmhVqBsKigUa92WBJCdyM7efp5SM1EXvNskbDEtuHHiYbLPxBJHXvZWWa8XCKvbWVV5eWdWExzASe3KzPCDEFm5JY2Peq64SY5gz6yu9n23BxDtb7PueWCMYfJs2VaYcLbndFJpkcDJKDiaEm18wSd3oKQ9eENKNZ74H2JyqmjnX6yVXcecP6NUj5gE3N2b5Pm5MjL37wveibdWHeSRQZFepWQdVAK5TLTgDL9YEE4jv5RLqB6vZ5eMtfSjhZ2',
      assets: [
        {
          tokenId:
            '497287b9a1eff643791277744a74b7d598b834dc613f2ebc972e33767c61ac2b',
          index: 0,
          amount: BigInt(9),
          name: 'RWT',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {
        R4: '0e203582b12ab4413c9a877845e8faf18d546d1ae11ddd7bb365c0118c7abefdd157',
      },
      mainChain: true,
      spentTransactionId:
        'c5fe05781cfb76eaafd49653654d8612c246b9986cba8a7f3b4ce4cd86f0ec69',
    },
  ],
  total: 1,
};

export const spendTriggerTx: Transaction = {
  id: '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
  inputs: [
    {
      boxId: 'df87cc77c89c2163cd573168a83bd814ee5cbc4e415cd6ac9c34504925f2cfff',
    },
    {
      boxId: 'ff1343b449c5cc88ddc47734519c0b78b3e48ebb2085b4600cae0cbefa20292c',
    },
    {
      boxId: '092ddb5e9865fe70b6ddec3bbf0aad93facd8301bca3f9a2950157993e35eb83',
    },
  ],
  dataInputs: [
    {
      boxId: '6eccf30dc9e6d40e20f8dddc3d66e7ee45c82216906a2bacf14be9da8a811309',
    },
  ],
  outputs: [
    {
      boxId: 'ee0e4e03f3f264a45dabb52d4e843100819b6bfe4c3e5d75bed71b52c51f8a7a',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a01205cea78cd9e83ad6de5ae2b4a44494507dd74a8c13223621edfc553b902d5bf7e',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 0,
    },
    {
      boxId: '15f66e8871eeaa3952abb417d7365559006c9bc30fad7b177ab1b9a74072a60e',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a0120e8d2e63d683f57b1dc19bd554a316954703b74b1ebf7459f8b9cb8316dc6e6ba',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 1,
    },
    {
      boxId: '000a848a79687b7839649b4d83a7bc89d1e9340591fda6e9afd2de261518ddd5',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a0120549f37b65bf1c38e24132eeebe9053e8c1e8798a622cd0b3eccda1944ce9aad1',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 2,
    },
    {
      boxId: 'd0f6f778941ea63871902d218ae69f1cdecd5f665923e08adb20502587b091fb',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a01207dc9b5fd90c4343d48baddc8a7df8b005dd25a2765dadcabd6bfdcc337bcc292',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 3,
    },
    {
      boxId: '477ada03856dda3183c92c699e79d95eb221c3ea93df11752f25028324ad6e9e',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a0120ba094ca44078a94c780eb7df8e0e8ddcefda1d819bc026250c327b5f044fc100',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 4,
    },
    {
      boxId: '12efe21e37f601094ae47e6d8de413dce5b2593a28fc2255414f1ab04730d70f',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a0120307f6f54ca9bd07e1d979beb6d2a35a19ef03339cad45d3f7a3f9aba327799ea',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 5,
    },
    {
      boxId: '06c5489235bf8660c7fe70e6d652c7923700f8df40f3003564998a3cdd38912a',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a012097a2dabcd974d69a07c3a03e20d05a36d13b986ffca5670302997484dd87e247',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 6,
    },
    {
      boxId: '4dbc0055e9f84985632db1e5985daa5728c8c949c96ba41b16b66da9b8717dda',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a012035f401c431c3adcd4675177be89cc05c70a45de782e93dc226c545e38e37b95c',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 7,
    },
    {
      boxId: 'ad6fa87ec1933dfe01ec15d21f8cb9b64981a7256454c7f382988d9f14eb42c7',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a01200ea77346ecd826701113ef3596670f85ec0d4a000d37a06a762ba14623f360f3',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 8,
    },
    {
      boxId: '758b2ca6b91173a8f18f2ac46c7325debf9d041e0f5678064d38e10ab9829308',
      value: 300000n,
      ergoTree:
        '10130400040004040400040204000e204b1e5bcfbd6763b9cea8411841213611258fabed16293af6aa8cd8200b7e12860404040004000400010104020400040004000e20c2eeb21a772554cc9733586df12f27d2f444f50e623c1f57cf89c09dc5097c5505020101d807d601b2a5730000d6028cb2db6308a773010001d603aeb5b4a57302b1a5d901036391b1db630872037303d9010363aedb63087203d901054d0e938c7205017202d604e4c6a7041ad605b2a5730400d606db63087205d607ae7206d901074d0e938c720701720295938cb2db63087201730500017306d196830301ef7203938cb2db6308b2a473070073080001b2720473090095720796830201938cb27206730a0001720293c27205c2a7730bd801d608c2a7d196830501ef720393c27201720893e4c67201041a7204938cb2db6308b2a4730c00730d0001b27204730e00957207d801d609b27206730f0096830701938c720901720293cbc272057310e6c67205051ae6c67205060e93e4c67205070ecb720893e4c67205041a7204938c72090273117312',
      assets: [
        {
          tokenId:
            '9410db5b39388c6b515160e7248346d7ec63d5457292326da12a26cc02efb526',
          amount: 1n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 75n,
        },
      ],
      additionalRegisters: {
        R4: '1a01200e83836f818a16766ac7490c5eee7abdc9357e6bb955641ff8ac56412bf576d0',
      },
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 9,
    },
    {
      boxId: 'ad8f28d284586190025589a314c20c2b9afb62be023596c115c1eacef2a1fc5b',
      value: 47000000n,
      ergoTree:
        '0008cd02d0b75bc997751195d143671cc10e8a590f25b987f2b2dd0d99cc5f48c6966d3d',
      assets: [
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 1750n,
        },
      ],
      additionalRegisters: {
        R4: '0e208379c632717b8e1b2291e63b2345d5c54ca8506dc9f69d8761da12bfb2904f57',
      },
      creationHeight: 987965,
      transactionId:
        '33b89c7ad97eb9cab674518b19e5be856acfffeace863426393e823394d76117',
      index: 0,
    },
    {
      boxId: 'fcd1ed2f6348055bccc2ec8a99046cbaa667b5bd18ce4b8e1918a905ac103cf1',
      value: 80000n,
      ergoTree:
        '0008cd03cc76f1074a4477cd378329c4e902ee6145add72e9c26c82b4f2255e768d48811',
      assets: [],
      additionalRegisters: {},
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 11,
    },
    {
      boxId: '344467f00f2f9b87b09ab54973008e0391ca296517e89eab2e083c7218419cb4',
      value: 212307486360n,
      ergoTree:
        '100304000e20b039e4445337697deaad703fc8d1fcb129c4577e8673394fa2403e54d484eeda0400d801d601b2db6501fe730000ea02d1aedb63087201d901024d0e938c720201730198b2e4c672010510730200ade4c67201041ad901020ecdee7202',
      assets: [
        {
          tokenId:
            '4ed6449240d166b0e44c529b5bf06d210796473d3811b9aa0e15329599164c24',
          amount: 44999999980999999n,
        },
        {
          tokenId:
            'a1143e81c5ab485a807e6f0f76af1dd70cc5359b29e0b1229d0edfe490d33b67',
          amount: 4831963150n,
        },
        {
          tokenId:
            'c59e86ef9d0280de582d6266add18fca339a77dfb321268e83033fe47101dc4d',
          amount: 499999081615899n,
        },
        {
          tokenId:
            '51c1745883a62db6cf47f5765bd695317a01e54bcaaaeaa4aab0b517d2f46a24',
          amount: 99999999979886465n,
        },
      ],
      additionalRegisters: {},
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 12,
    },
    {
      boxId: '2ab834b8ff3f1fc2355ad94ac5c33ddd7a12a75d9f5e199c1854af977cd49988',
      value: 1100000n,
      ergoTree:
        '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
      assets: [],
      additionalRegisters: {},
      creationHeight: 987965,
      transactionId:
        '28e1cbc78b5847d57278169cf685eaef37c10ac7f18d26d07b0c5539c6d539a1',
      index: 13,
    },
  ],
};

export const testTokenMap = {
  idKeys: {},
  tokens: [],
};
