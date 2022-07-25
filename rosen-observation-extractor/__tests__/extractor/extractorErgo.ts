import { AbstractExecutorErgo } from "../../src/extractor/extractorErgo";
import { loadDataBase } from "../actions/db";
import * as wasm from 'ergo-lib-wasm-nodejs';
import { last10BlockHeader } from "./sample";

const observationTxGenerator = (
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


test('processTransactions', async () => {
    const dataSource = await loadDataBase("processTransaction");
    const extractor = new AbstractExecutorErgo("1", dataSource);
    const Tx = observationTxGenerator();
    console.log(Tx.to_json())
    const res = await extractor.processTransactions("1", [Tx]);
    expect(res).toBe(true);
})

test('isRosenData', async () => {
    const dataSource = await loadDataBase("isRosenData");
    const extractor = new AbstractExecutorErgo("1", dataSource);
    const Tx = observationTxGenerator();
    expect(extractor.isRosenData(Tx.outputs().get(0))).toBe(true)
})

test('isRosenData', async () => {
    const dataSource = await loadDataBase("isRosenData");
    const extractor = new AbstractExecutorErgo("1", dataSource);
    const Tx = observationTxGenerator();
    expect(extractor.isRosenData(Tx.outputs().get(0))).toBe(true)
})

test('isRosenData', async () => {
    const dataSource = await loadDataBase("isRosenData");
    const extractor = new AbstractExecutorErgo("1", dataSource);
    const Tx = observationTxGenerator(false);
    expect(extractor.isRosenData(Tx.outputs().get(0))).toBe(false)
})

test('isRosenData', async () => {
    const dataSource = await loadDataBase("isRosenData");
    const extractor = new AbstractExecutorErgo("1", dataSource);
    const Tx = observationTxGenerator(true, ["Cardano", "address", "10000"]);
    expect(extractor.isRosenData(Tx.outputs().get(0))).toBe(false)
})