import { expect } from "chai";
import { Scanner } from "../../../lib/scanner/scanner";
import { firstObservations, loadDataBase } from "../models/models";
import { KoiosNetwork } from "../../../lib/network/koios";

const sampleObservation = {
    fromChain: 'CARDANO',
    toChain: 'ERGO',
    fee: '10000',
    amount: '10',
    sourceChainTokenId: 'asset12y0ewmxggeglymjpmp9mjf5qzh4kgwj9chtkpv',
    targetChainTokenId: 'cardanoTokenId',
    sourceTxId: 'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
    sourceBlockId: '93395496d590ec6db0f2fd13a7bcf91e82a9f230ef677f6216ea8c9f57df6ab3',
    requestId: 'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
    toAddress: 'ergoAddress',
    fromAddress: 'cardanoAddress',
};

describe("Scanner test", () => {
    describe("isForkHappen", () => {
        it("fork doesn't happened", async () => {
            const DB = await loadDataBase("scanner");
            await DB.removeForkedBlocks(3433333);
            await DB.saveBlock(
                3433333,
                "26197be6579e09c7edec903239866fbe7ff6aee2e4ed4031c64d242e9dd1bff6",
                "1111111111111111111111111111111111111111111111111111111111111111",
                firstObservations
            );
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            expect(await scanner.isForkHappen()).to.equal(false);
        });

        it("fork happened", async () => {
            const DB = await loadDataBase("scanner");
            await DB.removeForkedBlocks(3433333);
            await DB.saveBlock(
                3433333,
                "e1699582bd2e3426839e10f7f5066bafc6e3847fd4511a2013ba3b4e13514267",
                "1111111111111111111111111111111111111111111111111111111111111111",
                firstObservations
            );
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            expect(await scanner.isForkHappen()).to.be.true;
        });

        it("is undefined", async () => {
            const DB = await loadDataBase("scanner-empty");
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            expect(await scanner.isForkHappen()).to.be.false;
        });

    });
    describe("update", () => {
        it("scanner without fork", async () => {
            const DB = await loadDataBase("scanner-without-fork");
            await DB.removeForkedBlocks(3433333);
            await DB.saveBlock(
                3433333,
                "26197be6579e09c7edec903239866fbe7ff6aee2e4ed4031c64d242e9dd1bff6",
                "1111111111111111111111111111111111111111111111111111111111111111",
                firstObservations
            );
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            await scanner.update();
            const lastBlock = await DB.getLastSavedBlock();
            expect(lastBlock?.block_height).to.be.equal(3433334);
        });
        it("scanner with fork", async () => {
            const DB = await loadDataBase("scanner-with-fork");
            await DB.removeForkedBlocks(3433333);
            await DB.saveBlock(
                3433333,
                "397e969e0525d82dc46a33e31634187dae94b12a6cc4b534e4e52f6d313aef22",
                "1111111111111111111111111111111111111111111111111111111111111111",
                firstObservations
            );
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            await scanner.update();
            const lastBlock = await DB.getLastSavedBlock();
            expect(lastBlock).to.be.undefined;
        });
    })
    describe("isRosenData", () => {
        it("should be Rosen Data", async () => {
            const DB = await loadDataBase("cardanoUtils");
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            const validData = {
                "to": "ERGO",
                "fee": "10000",
                "from": "CARDANO",
                "toAddress": "ergoAddress",
                "fromAddress": "cardanoAddress",
                "targetChainTokenId": "cardanoTokenId",
            };
            expect(scanner.isRosenData(validData)).to.be.true;
        });
        it("should not be Rosen Data", async () => {
            const DB = await loadDataBase("cardanoUtils");
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            const invalidData = {
                "to": "ERGO",
                "fee": "10000",
                "from": "CARDANO",
            };
            expect(scanner.isRosenData(invalidData)).to.be.false;
        });
    });
    describe("isRosenMetaData", () => {
        it("should be RosenMetaData", async () => {
            const DB = await loadDataBase("cardanoUtils");
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            const validMetaData = {
                0: {}
            }
            expect(scanner.isRosenMetaData(validMetaData)).to.be.true;
        });
        it("should not be RosenMetaData", async () => {
            const DB = await loadDataBase("cardanoUtils");
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            const validMetaData = {
                1: {}
            }
            expect(scanner.isRosenMetaData(validMetaData)).to.be.false;
        });
    });
    describe("checkTx", () => {
        // TODO: AssetFingerprint.fromParts
        // it("should be observation", async () => {
        //     const koiosNetwork = new KoiosNetwork();
        //     const observation = await CardanoUtils.checkTx(
        //         "cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa"
        //         , "93395496d590ec6db0f2fd13a7bcf91e82a9f230ef677f6216ea8c9f57df6ab3"
        //         , ["addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re"]
        //         , koiosNetwork
        //     );
        //     expect(observation).to.be.eql(sampleObservation);
        // });
        it("should be undefined", async () => {
            const DB = await loadDataBase("cardanoUtils");
            const koiosNetwork = new KoiosNetwork();
            const scanner = new Scanner(DB, koiosNetwork);
            const observation = await scanner.checkTx(
                "edce02f2f23ddc3270964d2ba74ff6375a5a78fd6caf1c66102565b83f5d3ca2"
                , "93395496d590ec6db0f2fd13a7bcf91e82a9f230ef677f6216ea8c9f57df6ab3"
                , ["addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re"]
                , koiosNetwork
            );
            expect(observation).to.be.undefined;
        });
    });
    describe("observationAtHeight", () => {
        const koiosNetwork = new KoiosNetwork();
        // TODO: Should be fix AssetFingerprint.fromParts
        // it("first index should be undefined and second be observation", async () => {
        //     const observations = await CardanoUtils.observationsAtHeight(
        //         "93395496d590ec6db0f2fd13a7bcf91e82a9f230ef677f6216ea8c9f57df6ab3"
        //         , koiosNetwork
        //     );
        //     expect(observations.length).to.be.equal(1);
        //     expect(observations[0]).to.be.eql(sampleObservation);
        // });
    })
});
