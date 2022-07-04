import { expect } from "chai";
import { Scanner } from "../../../lib/scanner/scanner";
import { DataSource } from "typeorm";
import { commitmentEntities, entities } from "../../../lib/entities";
import { migrations } from "../../../lib/migrations";
import { BridgeDataBase } from "../../../lib/models/bridgeModel";
import { firstCommitment, firstPermitBox, firstWIDBox } from "../models/commitmentModel";
import { ErgoNetworkApi } from "../../../lib/network/networkApi";

export const loadDataBase = async (name: string): Promise<BridgeDataBase> => {
    const ormConfig = new DataSource({
        type: "sqlite",
        database: `./sqlite/bridge-test-${name}.sqlite`,
        entities: [...entities,...commitmentEntities],
        synchronize: false,
        migrations: migrations,
        logging: false,
    });
    return await BridgeDataBase.init(ormConfig);
}

describe("Scanner test", () => {
    describe("isForkHappen", () => {
        it("fork doesn't happened", async () => {
            const DB = await loadDataBase("scanner");
            await DB.removeForkedBlocks(204105);
            await DB.saveBlock(
                204105,
                "b1b7249cb76560cd7ee15c8baa29b870fd23e5482ddfcedf5d02048723caa7b7",
                "ceeeeef02c67527d88343ac32f4b43d529204aef7c82e291ce41a30513ba6415",
                {
                    newCommitments: [firstCommitment],
                    updatedCommitments: [],
                    newBoxes: [firstPermitBox, firstWIDBox],
                    spentBoxes: []
                }
            );
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            expect(await scanner.isForkHappen()).to.equal(false);
        });

        it("fork happened", async () => {
            const DB = await loadDataBase("scanner");
            await DB.removeForkedBlocks(204105);
            await DB.saveBlock(
                204105,
                "e1699582bd2e3426839e10f7f5066bafc6e3847fd4511a2013ba3b4e13514267",
                "b1b7249cb76560cd7ee15c8baa29b870fd23e5482ddfcedf5d02048723caa7b7",
                {
                    newCommitments: [firstCommitment],
                    updatedCommitments: [],
                    newBoxes: [firstPermitBox, firstWIDBox],
                    spentBoxes: []
                }
            );
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            expect(await scanner.isForkHappen()).to.be.true;
        });

        it("is undefined", async () => {
            const DB = await loadDataBase("scanner-empty");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            expect(await scanner.isForkHappen()).to.be.false;
        });

    });
    describe("update", () => {
        it("scanner without fork", async () => {
            const DB = await loadDataBase("scanner-without-fork");
            await DB.removeForkedBlocks(204105);
            await DB.saveBlock(
                204105,
                "b1b7249cb76560cd7ee15c8baa29b870fd23e5482ddfcedf5d02048723caa7b7",
                "ceeeeef02c67527d88343ac32f4b43d529204aef7c82e291ce41a30513ba6415",
                {
                    newCommitments: [firstCommitment],
                    updatedCommitments: [],
                    newBoxes: [firstPermitBox, firstWIDBox],
                    spentBoxes: []
                }
            );
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            await scanner.update();
            const lastBlock = await DB.getLastSavedBlock();
            expect(lastBlock?.block_height).to.be.equal(204105);
        });
        it("scanner with fork", async () => {
            const DB = await loadDataBase("scanner-with-fork");
            await DB.removeForkedBlocks(204105);
            await DB.saveBlock(
                204105,
                "54ab224b98e3c87ecb2a1ccd9a7ff794c9cc9507be8520cb4376539ad555bd3a",
                "ceeeeef02c67527d88343ac32f4b43d529204aef7c82e291ce41a30513ba6415",
                {
                    newCommitments: [firstCommitment],
                    updatedCommitments: [],
                    newBoxes: [firstPermitBox, firstWIDBox],
                    spentBoxes: []
                }
            );
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            await scanner.update();
            const lastBlock = await DB.getLastSavedBlock();
            expect(lastBlock).to.be.undefined;
        });
    })
});
