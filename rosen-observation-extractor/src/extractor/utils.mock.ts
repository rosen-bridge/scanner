import { DataSource } from "typeorm";
import { ObservationEntity } from "../entities/observationEntity";
import { migrations } from "../migrations";
import * as wasm from "ergo-lib-wasm-nodejs";

export const last10BlockHeader = [{
    "extensionId": "27143b3ad6607ca59fc6b882a96d999c1147dbedb4caa3c945208318feb6ef76",
    "difficulty": "5635571712",
    "votes": "000000",
    "timestamp": 1653932558503,
    "size": 221,
    "stateRoot": "b3e7d62d8c8d7d6ae38a69b2c369d307c2b41d01f21a313bd4b98345a1551e9516",
    "height": 215806,
    "nBits": 83972072,
    "version": 2,
    "id": "9dbe11053b952358e555451169ec9df7f0583bd80e822c0e8a71907edc3fe9af",
    "adProofsRoot": "4087e5f27842be6105e553d8f7a29a75ad59a04884014d5634bab29b68f6985c",
    "transactionsRoot": "87a0d482a763d1933edff775e469f8e0f618d1bbc0a3dbaf14e98a9538908c8f",
    "extensionHash": "29a8cd654991d2cfac09c9e78b1f58730ff3577ad0afd42f13b58e47a62f7277",
    "powSolutions": {
        "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        "n": "00000000b7f19562",
        "d": 0
    },
    "adProofsId": "cb91890c525e1f13b84bf5af7178c6dfc55125f3b6a7b16f3891064a8434d717",
    "transactionsId": "7986444f8f181172e32272df7e7d1bd1fab520f024230802f6bde38c77262b5e",
    "parentId": "8718e93fa6ea4ec8b3f955b654acf0d6f594e1420df2da4907b8c2eebdecc686"
},
    {
        "extensionId": "e04c61992a27ce4ebe82809f94b8290c078397830a24779908ddd52cd092c6f5",
        "difficulty": "5635571712",
        "votes": "000000",
        "timestamp": 1653932631795,
        "size": 221,
        "stateRoot": "7e56555ce442061f504f92047579f9afef9b2acb259edd56e419dfcecc5df4e716",
        "height": 215807,
        "nBits": 83972072,
        "version": 2,
        "id": "4fdbd7ec22ec03477b5b4cb04239c8b30f6f95ac7a3add388cb5a1eae993d2b1",
        "adProofsRoot": "73cf773ab227ce9b74960397616c9fd89d57bb857c8eac912c0c3d2773e9412b",
        "transactionsRoot": "b0e5ca1a2ebeda25087cd601f51485103b12a3dd4492c47419b52c1684738b78",
        "extensionHash": "29a8cd654991d2cfac09c9e78b1f58730ff3577ad0afd42f13b58e47a62f7277",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "0000000381e364f9",
            "d": 0
        },
        "adProofsId": "2ca8e8de7ca57ca155476cd83314f2e11d61d058baec7951fad80d98523f560d",
        "transactionsId": "e2e6ecb25b549ab3ebff505c3cf4a356a4df3b3f869fbc9082018cead4fa141f",
        "parentId": "9dbe11053b952358e555451169ec9df7f0583bd80e822c0e8a71907edc3fe9af"
    },
    {
        "extensionId": "ef8ac46dbcfdcb0fe04fda74f6d206f92a0235be1c4643f7e5bc901d7ddae079",
        "difficulty": "5635571712",
        "votes": "000000",
        "timestamp": 1653932970497,
        "size": 221,
        "stateRoot": "e3256897e8d264de11a7a2dbde246602d6d89c63c9c3d17dab67b6d5de5b32c816",
        "height": 215808,
        "nBits": 83972072,
        "version": 2,
        "id": "7acaca47daadf829438baa14b32f2fcd026937636b6fcd3d05e40d3c43215e46",
        "adProofsRoot": "32e49ee8e06bac632a71b20649d6a226f9a916103991d5664d5fa76ea73e1da8",
        "transactionsRoot": "7d758d1ceec75791f11171483c3d2703b047d38ce52e7470662613031e9fb313",
        "extensionHash": "9c77092d2e63fdf246cd894527c185947bfea37e6511665dba16a1f9790673fa",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "000000026912218c",
            "d": 0
        },
        "adProofsId": "bcd7a97e0e5b51be17204c16168d37310d17e43bb3242753f92e2a463619f9e4",
        "transactionsId": "54319ad6b9f7ca7b3d9f8d467fe31e56d65841cc24e983a300a4fcf89b2c5888",
        "parentId": "4fdbd7ec22ec03477b5b4cb04239c8b30f6f95ac7a3add388cb5a1eae993d2b1"
    },
    {
        "extensionId": "b08fef096a9cf24bad3a7e7e049b6b812ca43b51795e4a643591e05ec2f0196f",
        "difficulty": "5090705408",
        "votes": "000000",
        "timestamp": 1653933205053,
        "size": 220,
        "stateRoot": "e318a25a13dfd14ae41e3820097c33b7d49e8b9bc479d13c93a8d98601588fd316",
        "height": 215809,
        "nBits": 83963758,
        "version": 2,
        "id": "f91cdc031f9ab8451b39a3b292781325cd3941393e1967319df4c5e593daa593",
        "adProofsRoot": "37d2632b0092dae168e0bccc5192173f12c7d43e631b0f9c4d4bb76d34b0502f",
        "transactionsRoot": "226640250d9c7e4f317da15ab2b05c96f70dfc387ac3be2b79917592c24dea29",
        "extensionHash": "e8d3674f5f14dd2f1eced0aa1f74e23a3294dc62bbd018c349666dcf5de38bad",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "000000017bd52182",
            "d": 0
        },
        "adProofsId": "714677588ae780b6b432e8f53e5d6b0399506a7eda24e300199df9c62de32198",
        "transactionsId": "3a13afd7c9c6d54f5c888213bc88311d75feef789664902155770d605c01eca2",
        "parentId": "7acaca47daadf829438baa14b32f2fcd026937636b6fcd3d05e40d3c43215e46"
    },
    {
        "extensionId": "a91cbd4ff37c5c29e01c36524a24d6f54b3f97396080b8c5d782650104b952d8",
        "difficulty": "5090705408",
        "votes": "000000",
        "timestamp": 1653933351656,
        "size": 220,
        "stateRoot": "022494222deea6d3fa1145a27b5782f383e01cc96555e28a2bd7a11187d87a5816",
        "height": 215810,
        "nBits": 83963758,
        "version": 2,
        "id": "c3abfe4d6bad9f19a84c11a7dda4e7b0cca1e4aa42f50f34f395f8a6f898d622",
        "adProofsRoot": "ae47944cf48005cc54caa538bbcee25480f0c82a8bb0dd23ca92a9a481cb6ce7",
        "transactionsRoot": "b34ec763e862304f470373d6556f0c0e4fd9e14e5ba8f542d350ea9c29e850f3",
        "extensionHash": "e8d3674f5f14dd2f1eced0aa1f74e23a3294dc62bbd018c349666dcf5de38bad",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "00000000d2fbb6d3",
            "d": 0
        },
        "adProofsId": "58ff7896d75c302420c2b52ced0d8a3750a4b747824ba181765cb6f8861863f1",
        "transactionsId": "1766ccdd64d8601403c1262bd187db9ebb26dc5adb9ae7100ef92c24472763fa",
        "parentId": "f91cdc031f9ab8451b39a3b292781325cd3941393e1967319df4c5e593daa593"
    },
    {
        "extensionId": "9bdebff276f7cf8051ee9f217bcd319f30b1befb9098f2343652a90a7c635039",
        "difficulty": "5090705408",
        "votes": "000000",
        "timestamp": 1653933434918,
        "size": 220,
        "stateRoot": "4277cabc6bff122c93b7f4f84924733c38278c5a739c0e538452e670dd1e838816",
        "height": 215811,
        "nBits": 83963758,
        "version": 2,
        "id": "75a8f5b78624bb5eb4f8e3ac702f80eb10d3a05feeb50d1c8e1e7e17f8fb61b3",
        "adProofsRoot": "0f193db5aacec6ef6d85177100244b12415b80f196964f523338b6c6a0140247",
        "transactionsRoot": "ece2b525d82bd7620ccd8e6c79bf6a56ca22bdafe830e22022dd8bbbc9f946fa",
        "extensionHash": "66c134df905d7d1d263ebe638d97d384af93ba592954d55fc865b9e54eef70f2",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "00000000202e9454",
            "d": 0
        },
        "adProofsId": "139cf63bd95bf0068c6dedc1f22b3925b37256b3401d4db0dbbb58e8fe391626",
        "transactionsId": "ae6e3aca91077dbb894e0e0f2b136049d8ba2791958a5df932dbb654d2f6f034",
        "parentId": "c3abfe4d6bad9f19a84c11a7dda4e7b0cca1e4aa42f50f34f395f8a6f898d622"
    },
    {
        "extensionId": "3396ffe01e400d4eda6f51745e901f1b22b5b75c7a4da209426de9450d7c2f32",
        "difficulty": "5090705408",
        "votes": "000000",
        "timestamp": 1653933451736,
        "size": 220,
        "stateRoot": "c216821348f1fe154902da75a97c6861e061fa4cb0d84de1ebd27b994bba71ef16",
        "height": 215812,
        "nBits": 83963758,
        "version": 2,
        "id": "b40264ee73987b5919b40f679d4a23cb52aad5d3e9b9f052e76ab2f4c2e03c08",
        "adProofsRoot": "4a8acc9bf0ccc863c0a4c973ccd60dfab47e4548b139069cf0963b2216e7300f",
        "transactionsRoot": "a84c2e3e3b8191783f887d8ab61e3982e011da21a69f658f78e1e561ca589bb7",
        "extensionHash": "92f4f29731ee9bd01d8d39d1256dc7b55a03cef7f8e445f12afe74705517985c",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "0000000094978b6a",
            "d": 0
        },
        "adProofsId": "5b2d299f412b8066b16e9b3cf9f6e1de2c62302db25bda1346f7ccefaf0d6d9e",
        "transactionsId": "b7035ad8507fac49f46e14fc2e414239474ad045f29b6f198b565dec77639602",
        "parentId": "75a8f5b78624bb5eb4f8e3ac702f80eb10d3a05feeb50d1c8e1e7e17f8fb61b3"
    },
    {
        "extensionId": "1ad0f5ea4d0249da84cef643b07ebb499a09d6a08e115ec35d521bcceb668f7e",
        "difficulty": "5090705408",
        "votes": "000000",
        "timestamp": 1653933511999,
        "size": 220,
        "stateRoot": "85ee11729ac50ad30eb4cd5937f10e1453eec800fbea6276c76e9b0b10da551f16",
        "height": 215813,
        "nBits": 83963758,
        "version": 2,
        "id": "07c4231ad059271f87926baba27ffc59cc9df23b3bb74bbfc958e1e267e55657",
        "adProofsRoot": "3d26bf3d3a77f7c3cd79c70bdad0233b26f20ffc7799c1797397995917d4c941",
        "transactionsRoot": "1b0fdd82251cdd998868c44ff247b1f3309aee4f7685bef57d4815883f0974cf",
        "extensionHash": "92f4f29731ee9bd01d8d39d1256dc7b55a03cef7f8e445f12afe74705517985c",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "000000008c46fe39",
            "d": 0
        },
        "adProofsId": "6979d03b995a191e2aff734e1b12c44b4852ab782260b1da21f1ec0473cbb09e",
        "transactionsId": "2b64466b904e59552d5796e99b0428b24e85a79da180d5b4ca4d9f05289dc562",
        "parentId": "b40264ee73987b5919b40f679d4a23cb52aad5d3e9b9f052e76ab2f4c2e03c08"
    },
    {
        "extensionId": "ae51baeb1dd8f68fc9bc5c5d7ddfe227fc1a453045ce5704d2f57b5f7d5c0f9d",
        "difficulty": "5090705408",
        "votes": "000000",
        "timestamp": 1653933569225,
        "size": 220,
        "stateRoot": "870b8cc02f42360bef9766dc42c58a7eac71a12ef186e8b6498b859b304c835516",
        "height": 215814,
        "nBits": 83963758,
        "version": 2,
        "id": "2aeed311b23c92427c16f2262bde3396484e109fcddb4f1a56aa1dd5a7b2113b",
        "adProofsRoot": "c4cd0df1ee4cad41a010732e21ffd0d073bde060145c640b31aac508a4668594",
        "transactionsRoot": "935b773457cb4065b7947bc1600b8849707cd70f9f8ca4520adc288f2d4a3d80",
        "extensionHash": "c5556727874b10550de7a90240f1bbe9d1e1dcef5741e34d93b73d592a2b4c93",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "0000000085faadb5",
            "d": 0
        },
        "adProofsId": "de0e6fa550cbf280f0fdf01aca7ae06acc4ee6944073080d822ff2346a2d7098",
        "transactionsId": "fa989159c28706c7700cc9f09dc215e4c7da17343fd5b12bd2473921ff2bbc3f",
        "parentId": "07c4231ad059271f87926baba27ffc59cc9df23b3bb74bbfc958e1e267e55657"
    },
    {
        "extensionId": "a5d21ffb6ba8a35c3b5450d6ccb9eb2073cd588a57bdcaa4a767199e74d83576",
        "difficulty": "5090705408",
        "votes": "000000",
        "timestamp": 1653933624717,
        "size": 220,
        "stateRoot": "364c459ee947d41d618411a398b0fb4ed77e2d5188727ff3abc8476f45defc4116",
        "height": 215815,
        "nBits": 83963758,
        "version": 2,
        "id": "98ed9df1f0f54d18180fb8957ee364e1e94b68ded4fc55eb52d15a56dbb7e53d",
        "adProofsRoot": "82a0c03bab1d69677ffa5ce2b180b37bd461e34239e036f0f21cbc9eb515afa9",
        "transactionsRoot": "5d0d691a780bd078d21b6484d4f72b91a8f70d553b25546938bd16831f27f3d9",
        "extensionHash": "c5556727874b10550de7a90240f1bbe9d1e1dcef5741e34d93b73d592a2b4c93",
        "powSolutions": {
            "pk": "03702266cae8daf75b7f09d4c23ad9cdc954849ee280eefae0d67bd97db4a68f6a",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "00000000aa7f2207",
            "d": 0
        },
        "adProofsId": "58679314a2d9d6432c34577787701555a4ed778574b877d1e4c23c12f09600a9",
        "transactionsId": "2ac59a2e809aa9f92ea8106aea9de46822a80758d5899f337dac1baf19215ee3",
        "parentId": "2aeed311b23c92427c16f2262bde3396484e109fcddb4f1a56aa1dd5a7b2113b"
    }];

export const cardanoTxValid={
    block_hash: "",
    metadata: [{
        key: "0",
        json: JSON.parse('{"to": "ERGO","bridgeFee": "10000","networkFee": "10000","toAddress": "ergoAddress","targetChainTokenId": "cardanoTokenId"}')
    }],
    tx_hash: "",
    inputs: [
        {
            "payment_addr": {
                "bech32": "addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0",
                "cred": "90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6"
            },
            "stake_addr": null,
            "tx_hash": "9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6",
            "tx_index": 1,
            "value": "979445417",
            "asset_list": [
                {
                    "policy_id": "ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2",
                    "asset_name": "646f6765",
                    "quantity": "10000000"
                },
                {
                    "policy_id": "ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2",
                    "asset_name": "7369676d61",
                    "quantity": "9999978"
                }
            ]
        }
    ],
    outputs: [{
        payment_addr: {
            bech32: 'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
            cred: "b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21"
        },
        tx_hash: 'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
        stake_addr: null,
        tx_index: 0,
        value: '10000000',
        asset_list: [
            {
                policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
                asset_name: '7369676d61',
                quantity: '10'
            }
        ]
    }, {
        payment_addr: {
            bech32: 'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: "90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6"
        },
        tx_hash: 'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
        stake_addr: null,
        tx_index: 1,
        value: '969261084',
        asset_list: [
            {
                policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
                asset_name: '646f6765',
                quantity: '10000000'
            },
            {
                policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
                asset_name: '7369676d61',
                quantity: '9999968'
            }
        ]
    }]
};

export const loadDataBase = async (name: string): Promise<DataSource> => {
    return new DataSource({
        type: "sqlite",
        database: `./sqlite/${name}-test.sqlite`,
        entities: [ObservationEntity],
        migrations: migrations,
        synchronize: false,
        logging: false
    }).initialize().then(
        async (dataSource) => {
            await dataSource.runMigrations();
            return dataSource
        }
    );
}

export const observationTxGenerator = (
    hasToken = true,
    data: Array<string> = ["Cardano", "address", "10000", "1000"]
) => {
    const sk = wasm.SecretKey.random_dlog();
    const address = wasm.Contract.pay_to_address(sk.get_address());
    const outBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str("100000000"));
    const outBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        outBoxValue,
        address,
        0,
    );
    if (hasToken) {
        outBoxBuilder.add_token(
            wasm.TokenId.from_str("f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3"),
            wasm.TokenAmount.from_i64(wasm.I64.from_str("10")),
        );
    }
    const registerValue = data.map((val) => {
        return new Uint8Array(Buffer.from(val))
    });
    outBoxBuilder.set_register_value(4, wasm.Constant.from_coll_coll_byte(
        registerValue
    ));

    const outBox = outBoxBuilder.build();
    const tokens = new wasm.Tokens();
    tokens.add(
        new wasm.Token(
            wasm.TokenId.from_str("f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3"),
            wasm.TokenAmount.from_i64(wasm.I64.from_str("10"))
        )
    );

    const inputBox = new wasm.ErgoBox(
        wasm.BoxValue.from_i64(wasm.I64.from_str('1100000000')),
        0,
        address,
        wasm.TxId.zero(),
        0,
        tokens
    );

    const unspentBoxes = new wasm.ErgoBoxes(inputBox);
    const txOutputs = new wasm.ErgoBoxCandidates(outBox);
    const fee = wasm.TxBuilder.SUGGESTED_TX_FEE();
    const boxSelector = new wasm.SimpleBoxSelector();
    const targetBalance = wasm.BoxValue.from_i64(outBoxValue.as_i64().checked_add(fee.as_i64()));
    const boxSelection = boxSelector.select(unspentBoxes, targetBalance, tokens);
    const tx = wasm.TxBuilder.new(
        boxSelection,
        txOutputs,
        0,
        fee,
        sk.get_address(),
        wasm.BoxValue.SAFE_USER_MIN()
    ).build();
    const blockHeaders = wasm.BlockHeaders.from_json(last10BlockHeader);
    const preHeader = wasm.PreHeader.from_block_header(blockHeaders.get(0));
    const ctx = new wasm.ErgoStateContext(preHeader, blockHeaders);
    const sks = new wasm.SecretKeys();
    sks.add(sk);
    const wallet = wasm.Wallet.from_secrets(sks);
    return wallet.sign_transaction(ctx, tx, unspentBoxes, wasm.ErgoBoxes.from_boxes_json([]))
}

