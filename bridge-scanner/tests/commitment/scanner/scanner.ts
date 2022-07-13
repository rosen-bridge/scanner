import { expect } from "chai";
import { Scanner } from "../../../lib/scanner/scanner";
import { DataSource } from "typeorm";
import { commitmentEntities, entities } from "../../../lib/entities";
import { migrations } from "../../../lib/migrations";
import { BridgeDataBase } from "../../../lib/models/bridgeModel";
import { firstCommitment, firstPermitBox, firstWIDBox } from "../models/commitmentModel";
import { ErgoNetworkApi } from "../../../lib/network/networkApi";
import { NodeTransaction } from "../../../lib/network/ergoApiModels";
import tx from "../dataset/tx.json" assert { type: "json" };
import commitmentTx from "../dataset/commitmentTx.json" assert { type: "json" };
import { ErgoConfig } from "../../../lib/config/config";
import { BoxType } from "../../../lib/entities/bridge/BoxEntity";
import chai from "chai";
import spies from "chai-spies";

chai.use(spies);

const commitmentAddress = "EurZwDoNTXuraUu37sjKwpEPkoumCwXHrwk8jUZzRCVyrrDywfQsbXSfh4sD9KYuNw3sqJDyKqh9URkzGTKzpFU28hWx2uUJJVhJ6LigNANqfVVjEFf4g5kkwTqLES4CpAyNLv3v8tBgtB2kGzjMZpU3qbwpZ8eh4JQQUw5cztzXc715H61hqPTH13i1qfGdph8GLV8DkczLHGektosSWXNQRXJBRvH6DVuyPRYsEeyjYr4agBxyEZ5PTx7KgYwKGFWhKbgkdaLzySZjFV7bSZXArLGpykP1UgS62o6aBydg1oPM3PTFugHQJbtusQShDNGCu5V7XXfePtJ2ybhS32NT3vP15Lzf1sXwXerGbMWLiznyLc4op1TJd5LyWrCYtznhwmjEZ7iKBxNT49BuL5QBQ3RiFFmazkhXrLLQnnqmhBfH8s8yA6rQD8hmyFm5YCaTfBPTG1LznGWtw6G9h5pZnAMuqHBBsEnKjRArTTR7uabKTCBK11oaVo8bqh3JPpHumLv7YAiC1GDHYst7KoVct9vwF5kByEag6turXiWA1JH4KNayh4VVwz8PLcGx5eyThMLkNw6t1VApcgM6DehcMhCc5D5jW4MicKrvwwYTEU4qwfHjMQ1ftanb7pRZkDZPuL9qppvQZhDdM8DzgXdMGnJK44aXujkuWZFvzKVzpPVyswgqnaLyznPEQ9xt5PVQmGrVXe44TPw9UDdeeW9wEzyVx4BHkC36LgHkbhWM36mAAfSDvFAxrDaBEBGEPt3wrJct8A6C4osCpcvUDRqKCPg2PkgrcYuem"
const permitAddress = "EE7687i4URb4YuSGSQXPCb6iAFxAd5s8H1DLbUFQnSrJ8rED2KXdq8kUPQZ3pcPVFD97wQ32PATufWyvyhvit6sokNfLUMPqCZeVN85foTQx6zae88o2T8V9B1LqKtuZsxKG94hKxSoWmTTVUhy9TYiYhJUackckhwWi8LzbLYaVmozJRFgq4RXgzsa4bRTcQrp5fZjBmfDxgfbTyUt4JaVATkdRsDL41QKcXaq5Sds49beNhBaV8KqhY4Rj9muYfLoEvf3T4yX56YwhwQibXSWHKZpbXKYasRZ6NooQyP6XnjLcfLx2KzGoNJSoZNHih5YR9Heo7v3CHYDUur1dC8KT2ibKkA21SYyYZ4i1dQgsSjqx3QwpV6Yo6k87T4tvPeKNoHj47G4bUmGk4kuKZo2NQQXLfBsXLyELaGqbWAMJtzVwvDUQXAhWTXUkgQo9VnzWAoXkkt9oDUE8qFh1FRRfqeKaXkMY1ZxvkJa9AeZnssfoYEoDzqgkt7Nfziw5xgMJDDCRgZyZgN1CC3qaDH319gnE6aCMib5pnyY"
const watcherAddress = "9f5veZdZq1C15GCqm6uej3kpRPh3Eq1Mtk1TqWjQx3CzMEZHXNz"
const WID = "f875d3b916e56056968d02018133d1c122764d5c70538e70e56199f431e95e9b"


export const loadDataBase = async (name: string): Promise<BridgeDataBase> => {
    const ormConfig = new DataSource({
        type: "sqlite",
        database: `./sqlite/bridge-test-${name}.sqlite`,
        entities: [...entities, ...commitmentEntities],
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
    });
    describe("checkTx", () => {
        it("should be undefined", async () => {
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            const commitment = await scanner.checkTx(<NodeTransaction><unknown>tx, [commitmentAddress]);
            expect(commitment).to.be.undefined
        });
        it("should be commitment", async () => {
            const DB = await loadDataBase("checkTx");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            commitmentTx.outputs[1].assets[0].tokenId = ErgoConfig.getConfig().RWTId
            const commitment = await scanner.checkTx(<NodeTransaction><unknown>commitmentTx, [commitmentAddress]);
            expect(commitment).to.not.be.undefined;
            expect(commitment?.WID).to.eql("f875d3b916e56056968d02018133d1c122764d5c70538e70e56199f431e95e9b")
            expect(commitment?.eventId).to.eql("ab59962c20f57d9d59e95f5170ccb3472df4279ad4967e51ba8be9ba75144c7b")
            expect(commitment?.commitment).to.eql("c0666e24aa83e38b3955aae906140bda7f2e1974aca897c28962e7eaebd84026")
        });
    });
    describe("commitmentAtHeight", () => {
        it("Should find one valid commitment", async () => {
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            chai.spy.on(scanner, 'checkTx', () => [{}])
            const commitments = await scanner.extractCommitments(
                [<NodeTransaction><unknown>commitmentTx]
            );
            expect(commitments.length).to.be.equal(1);
        });
    });
    describe("updatedCommitmentsAtHeight", () => {
        it("should find 1 updated commitment", async () => {
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            chai.spy.on(DB, 'findCommitmentsById', () => [])
            const data = await scanner.updatedCommitments(
                [<NodeTransaction><unknown>commitmentTx],
                DB,
                ["cea4dacf032e7e152ea0a5029fe6a84d685d22f42f7137ef2735ce90663192d7"]
            );
            expect(data.length).to.be.equal(1);
            expect(data[0].boxId).to.eql("cea4dacf032e7e152ea0a5029fe6a84d685d22f42f7137ef2735ce90663192d7")
        });
    });
    describe("specialBoxesAtHeight", () => {
        it("Should find one permit box and one WID box", async () => {
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            commitmentTx.outputs[0].assets[0].tokenId = ErgoConfig.getConfig().RWTId
            const specialBoxes = await scanner.extractSpecialBoxes(
                [<NodeTransaction><unknown>commitmentTx],
                permitAddress,
                watcherAddress,
                WID
            );
            expect(specialBoxes.length).to.be.equal(2);
            expect(specialBoxes[0].type).to.eq(BoxType.PERMIT)
            expect(specialBoxes[1].type).to.eq(BoxType.WID)
        });
        it("Should find one plain watcher box", async () => {
            const DB = await loadDataBase("checkTx");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            const specialBoxes = await scanner.extractSpecialBoxes(
                [<NodeTransaction><unknown>tx],
                permitAddress,
                watcherAddress,
                WID
            );
            expect(specialBoxes.length).to.be.equal(1);
            expect(specialBoxes[0].type).to.eq(BoxType.PLAIN)
        });
    });
    describe("spentSpecialBoxesAtHeight", () => {
        it("should find 2 updated boxesSample", async () => {
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            chai.spy.on(DB, 'findUnspentSpecialBoxesById', () => [{boxId: "cea4dacf032e7e152ea0a5029fe6a84d685d22f42f7137ef2735ce90663192d7"}])
            const data = await scanner.spentSpecialBoxes(
                [<NodeTransaction><unknown>commitmentTx],
                DB,
                ["cd0e9ad2ae564768bc6bf74a350934117040686fd267f313fce27d7df00fe549"]
            );
            expect(data.length).to.be.equal(2);
            expect(data[0]).to.eql("cea4dacf032e7e152ea0a5029fe6a84d685d22f42f7137ef2735ce90663192d7")
            expect(data[1]).to.eql("cd0e9ad2ae564768bc6bf74a350934117040686fd267f313fce27d7df00fe549")
        });
    })
    describe("getRepoBox", () => {
        it("should return repoBox(with tracking mempool)", async () => {
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            const repoBox = await scanner.getRepoBox();
            expect(repoBox.box_id().to_str()).to.be.equal("636c5fe2c9a58041699373b21edae447574d6590782ee653638b9d3f66295728");
        });
    });
    describe("getWID", () => {
        it("checks is there any wid in the usersBoxes", async () => {
            const sampleWID = "4911d8b1e96bccba5cbbfe2938578b3b58a795156518959fcbfc3bd7232b35a8";
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            const usersHex = ["414441", sampleWID];
            const users: Array<Uint8Array> = [];
            for (const user of usersHex) {
                users.push(new Uint8Array(Buffer.from(user, "hex")));
            }
            const WID = await scanner.getWID(users);
            expect(WID).to.be.equal(sampleWID);
        });
    });
    describe("getAddressWID", () => {
        it("wid", async () => {
            const DB = await loadDataBase("scanner-test");
            const ergoNetwork = new ErgoNetworkApi();
            const scanner = new Scanner(DB, ergoNetwork);
            chai.spy.on(
                scanner,
                'getWID',
                () => "cea4dacf032e7e152ea0a5029fe6a84d685d22f42f7137ef2735ce90663192d7"
            )
            const wid = await scanner.getAddressWID();
            expect(wid).to.be.equal("cea4dacf032e7e152ea0a5029fe6a84d685d22f42f7137ef2735ce90663192d7");
        })

    });
});
