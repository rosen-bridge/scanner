import { DataSource } from "typeorm";
import { migrations } from "../migrations";
import PermitEntity from "../entities/PermitEntity";
import CommitmentEntity from "../entities/CommitmentEntity";
import EventTriggerEntity from "../entities/EventTriggerEntity";
import * as wasm from "ergo-lib-wasm-nodejs";
import { commitmentAddress, eventTriggerAddress, last10BlockHeader, permitAddress, RWTId } from "./utilsVariable.mock";

/**
 * generates a dataSource with filename passed to the function for database file name
 *  used for test datasource
 * @param name
 */
export const loadDataBase = async (name = "rosen-extractor"): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: "sqlite",
        database: `./sqlite/${name}-test.sqlite`,
        entities: [PermitEntity, CommitmentEntity, EventTriggerEntity],
        migrations: migrations,
        synchronize: false,
        logging: false
    });
    await dataSource.initialize();
    await dataSource.runMigrations();
    return dataSource;
}

/**
 * cleaning all table of the passed datasource
 * @param dataSource
 */
export async function clearDB(dataSource: DataSource) {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
        const repository = await dataSource.getRepository(entity.name);
        await repository.query(`DELETE FROM ${entity.tableName};`);
        await repository.query(`DELETE FROM SQLITE_SEQUENCE WHERE name='${entity.tableName}';`);
    }
}

/**
 * generates transaction with output address sets to permitAddress
 *  hasToken sets that rwt set in the output or not
 * @param hasToken
 * @param WID
 */
export const permitTxGenerator = (
    hasToken = true,
    WID: string,
) => {
    const sk = wasm.SecretKey.random_dlog();
    const permitAddressContract = wasm.Contract.pay_to_address(wasm.Address.from_base58(permitAddress));
    const address = wasm.Contract.pay_to_address(sk.get_address());
    const outBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str("100000000"));
    const outBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        outBoxValue,
        permitAddressContract,
        0,
    );

    if (hasToken) {
        outBoxBuilder.add_token(
            wasm.TokenId.from_str(RWTId),
            wasm.TokenAmount.from_i64(wasm.I64.from_str("10")),
        );
    }

    outBoxBuilder.set_register_value(4, wasm.Constant.from_coll_coll_byte(
        [new Uint8Array(Buffer.from(WID, 'hex'))]
    ));

    const outBox = outBoxBuilder.build();
    const tokens = new wasm.Tokens();
    tokens.add(
        new wasm.Token(
            wasm.TokenId.from_str(RWTId),
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

/**
 * generates transaction with output address sets to commitmentAddress
 * @param hasToken
 * @param WID
 * @param requestId
 * @param eventDigest
 */
export const commitmentTxGenerator = (
    hasToken = true,
    WID: Array<string>,
    requestId: Array<string>,
    eventDigest: string,
) => {
    const sk = wasm.SecretKey.random_dlog();
    const commitmentAddressContract = wasm.Contract.pay_to_address(wasm.Address.from_base58(commitmentAddress));
    const address = wasm.Contract.pay_to_address(sk.get_address());
    const outBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str("100000000"));
    const outBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        outBoxValue,
        commitmentAddressContract,
        0,
    );

    if (hasToken) {
        outBoxBuilder.add_token(
            wasm.TokenId.from_str(RWTId),
            wasm.TokenAmount.from_i64(wasm.I64.from_str("10")),
        );
    }

    const R4Value = WID.map((val) => {
        return new Uint8Array(Buffer.from(val, 'hex'))
    });
    outBoxBuilder.set_register_value(4, wasm.Constant.from_coll_coll_byte(
        R4Value
    ));

    const R5Value = requestId.map((val) => {
        return new Uint8Array(Buffer.from(val, 'hex'))
    });
    outBoxBuilder.set_register_value(5, wasm.Constant.from_coll_coll_byte(
        R5Value
    ));

    outBoxBuilder.set_register_value(6, wasm.Constant.from_byte_array(
        new Uint8Array(Buffer.from(eventDigest, 'hex'))
    ));


    const outBox = outBoxBuilder.build();
    const tokens = new wasm.Tokens();
    tokens.add(
        new wasm.Token(
            wasm.TokenId.from_str(RWTId),
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

/**
 * generate transaction that first output address is set to eventTrigger address
 * @param hasToken
 * @param WID
 * @param eventData
 */
export const eventTriggerTxGenerator = (
    hasToken = true,
    WID: Array<string>,
    eventData: Array<string>,
) => {
    const sk = wasm.SecretKey.random_dlog();
    const eventTriggerAddressContract = wasm.Contract.pay_to_address(wasm.Address.from_base58(eventTriggerAddress));
    const address = wasm.Contract.pay_to_address(sk.get_address());
    const outBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str("100000000"));
    const outBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        outBoxValue,
        eventTriggerAddressContract,
        0,
    );

    if (hasToken) {
        outBoxBuilder.add_token(
            wasm.TokenId.from_str(RWTId),
            wasm.TokenAmount.from_i64(wasm.I64.from_str("10")),
        );
    }

    const R4Value = WID.map((val) => {
        return new Uint8Array(Buffer.from(val, 'hex'))
    });
    outBoxBuilder.set_register_value(4, wasm.Constant.from_coll_coll_byte(
        R4Value
    ));
    const R5Value: Array<Uint8Array> = [];
    for (let i = 0; i < eventData.length; i++) {
        if ([5, 6, 7].includes(i)) {
            R5Value.push(new Uint8Array(Buffer.from(eventData[i], 'hex')))
        } else {
            R5Value.push(new Uint8Array(Buffer.from(eventData[i])))
        }
    }
    outBoxBuilder.set_register_value(5, wasm.Constant.from_coll_coll_byte(
        R5Value
    ));

    const outBox = outBoxBuilder.build();
    const tokens = new wasm.Tokens();
    tokens.add(
        new wasm.Token(
            wasm.TokenId.from_str(RWTId),
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
