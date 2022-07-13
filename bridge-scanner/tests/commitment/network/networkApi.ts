import { expect } from "chai";
import { ErgoNetworkApi, nodeApi } from "../../../lib/network/networkApi"
import { describe } from "mocha";
import MockAdapter from "axios-mock-adapter";

import blockAtHeight from "../dataset/blockAtHeight.json" assert { type: "json" }
import secondBlockAtHeight from "../dataset/secondBlockAtHeight.json" assert { type: "json" }
import blockTxs from "../dataset/blockTxs.json" assert { type: "json" }
import info from "../dataset/info.json" assert { type: "json" }
import { mockedResponse } from "./mockedResponse";
import { explorerApi } from "../../../lib/network/ErgoNetwork";

const mockedAxios = new MockAdapter(nodeApi);
const ergoNetwork = new ErgoNetworkApi();

const mockedErgoNetwork = new MockAdapter(explorerApi);


const txId1 = "54ab224b98e3c87ecb2a1ccd9a7ff794c9cc9507be8520cb4376539ad555bd3a"
const blockHash = "b1b7249cb76560cd7ee15c8baa29b870fd23e5482ddfcedf5d02048723caa7b7"
const blockHeight = 204105
mockedAxios.onGet(`/blocks/chainSlice`, {params: {fromHeight: blockHeight, toHeight: blockHeight}})
    .reply(200, blockAtHeight)
mockedAxios.onGet(`/blocks/chainSlice`, {params: {fromHeight: blockHeight - 2, toHeight: blockHeight}})
    .reply(200, secondBlockAtHeight)
mockedAxios.onGet(`/blocks/${blockHash}/transactions`)
    .reply(200, blockTxs)
mockedAxios.onGet(`info`)
    .reply(200, info)
mockedErgoNetwork.onGet(
    '/api/v1/boxes/unspent/byErgoTree/101c040204000e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac8530101040204000402040404040400040004020402040204000400040004000e2013fe3ae277a195b83048e3e268529118fa4c18cca0931e3b48a8f5fccec75bc9040404000400040204020400040004000400d801d601b2a473000095938cb2db63087201730100017302d17303d811d602db6308a7d603b27202730400d6048c720302d605b2a5730500d606db63087205d607b27206730600d6088c720702d609e4c6a70511d60ab17209d60be4c672050511d60cb1720bd60de4c6a70611d60eb27206730700d60f8c720e02d610b27202730800d6118c721002d6129683050193c27205c2a793e4c672050611720d938cb27206730900018cb27202730a0001938c7207018c720301938c720e018c721001959172047208d806d613e4c67205041ad6149a720a730bd61599720c730cd616c5a7d6179972047208d618b2a5730d00d196830c01721293b17213721493b47213730e7215e4c6a7041a93b27213721500721693720c721493b4720b730f7215720993b2720b7215007217939c7217b2720d73100099720f7211938cb2db6308721873110002721793cbc27218731293e4c67218041a83010e7216938cb2db6308b2a5731300731400017216d804d613e4c6a7041ad614e4c672050704d6159972087204d616b27209721400d19683040172129383010eb27213721400e4c67201041a939c7215b2720d731500997211720f959172167215968302019372169ab2720b7214007215937213e4c67205041ad803d617e4c67205041ad6189a72147316d61999720a731796830501937216721593b4721373187214b472177319721493b472137218720ab472177214721993b47209731a7214b4720b731b721493b472097218720ab4720b72147219',
    {params: {offset: 0, limit: 1}}
).reply(200, [mockedResponse.repoBox]);
mockedErgoNetwork.onGet(
    '/api/v1/boxes/unspent/byErgoTree/101c040204000e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac8530101040204000402040404040400040004020402040204000400040004000e2013fe3ae277a195b83048e3e268529118fa4c18cca0931e3b48a8f5fccec75bc9040404000400040204020400040004000400d801d601b2a473000095938cb2db63087201730100017302d17303d811d602db6308a7d603b27202730400d6048c720302d605b2a5730500d606db63087205d607b27206730600d6088c720702d609e4c6a70511d60ab17209d60be4c672050511d60cb1720bd60de4c6a70611d60eb27206730700d60f8c720e02d610b27202730800d6118c721002d6129683050193c27205c2a793e4c672050611720d938cb27206730900018cb27202730a0001938c7207018c720301938c720e018c721001959172047208d806d613e4c67205041ad6149a720a730bd61599720c730cd616c5a7d6179972047208d618b2a5730d00d196830c01721293b17213721493b47213730e7215e4c6a7041a93b27213721500721693720c721493b4720b730f7215720993b2720b7215007217939c7217b2720d73100099720f7211938cb2db6308721873110002721793cbc27218731293e4c67218041a83010e7216938cb2db6308b2a5731300731400017216d804d613e4c6a7041ad614e4c672050704d6159972087204d616b27209721400d19683040172129383010eb27213721400e4c67201041a939c7215b2720d731500997211720f959172167215968302019372169ab2720b7214007215937213e4c67205041ad803d617e4c67205041ad6189a72147316d61999720a731796830501937216721593b4721373187214b472177319721493b472137218720ab472177214721993b47209731a7214b4720b731b721493b472097218720ab4720b72147219',
    {params: {offset: 0, limit: 10}}
).reply(200, [mockedResponse.repoBox]);
mockedErgoNetwork.onGet('/api/v1/mempool/transactions/byAddress/N9nHZxAm7Z476Nbw6yF2X6BQEct7nNCm4SJeCK8DJEkERj6LXMJvKqG49WWSfNDufuuFEtN8msfWDd8UR4QUCmLEwFRWXC5hxEdk1XhdRSgiwuqyiPqpSTXtqUgGf67uCzEtHtN5nQKKuRYyr6xfFfV8YXKhms5JVqhmCM9869Nr4KzmLAdSLqwG6LswnFwRWwZZfC6Jf65RKV4xV5GTDqL5Ppc2QwnGDYFEUPPgLdskLbDAgwfDgE2mZnCfovUGmCjinh8UD1tW3AKfBPjFJbdF6eST8SB7EpDt162cZu7992Gaa3jNYwYnJKGKqU1izwb2WRVC3yXSHFQxr8GkTa3uQ9WAL1hyMSSNg7GqzF5a8GXFUTCw97zXUevKjtBAKxmjLQTfsmDdzYTe1oBNXEgffhVndtxhCfViYbnHVHUqEv8NQA8xiZaEzj9eCfrYyPepiq1sRruFwgjqhqhpetrQaKcSXmFjeFzCHnDR3aAV9dXQr6SyqAf7p7ML9H4rYNhLJAc4Usbuq8rVH8ysmTZPb7erhWmKXG8yFWqc6mE6tekXUuyvPhh3uXJWZgc6Z2RDbDNRvZNkxbUMDEDfb3iLtcNd3wGGLFndzryQNft8FZS4xwaskVZFQkFga3dfCgkMv3NAXrRTPmrDYD2WgurR8PfewJAJ2nu4GpMJadgTkkkLYvgrVxC8jp3w39dXzSCKAcQ7cGWyvYW6HK1s1VcG9QiogDf6YhM5mfroCCn6HweQ7hDdYtRvSyuDBVaZAJmhxKBffsGsApKocqPeZMjo8hsRr3bWgJA2xBhzxn42HCgDf2qULBH4b9HN5N3hyR7WURyVr9Y1vXwFTakEtMsr861X88mi2yUi7aqRh3XAFoN11Do9N34UPSzreELFk3SCxJT4uAdsKQrCm5yRo1zt5Mgh4tpHfgk4SsY7')
    .reply(200, mockedResponse.repoBoxMemPool);

mockedErgoNetwork.onGet(
    '/api/v1/boxes/unspent/byErgoTree/0008cd03c29ad59831be2e5baded45a03ce9a7d4c2e83d683e11c79790e76f640d0d3e30',
    {params: {offset: 0, limit: 1}}
).reply(200, [mockedResponse.watcherLastUnspentBox]);

mockedErgoNetwork.onGet(
    '/api/v1/boxes/unspent/byErgoTree/0008cd03c29ad59831be2e5baded45a03ce9a7d4c2e83d683e11c79790e76f640d0d3e30',
    {params: {offset: 0, limit: 10}}
).reply(200, [mockedResponse.watcherLast10UnspentBox]);



describe("Testing ergo network api", () => {
    describe("getBlockAtHeight", () => {
        it("Should return a json with hash and block_height field", async () => {
            const data = await ergoNetwork.getBlockAtHeight(blockHeight);
            expect(data).to.haveOwnProperty("hash")
            expect(data).to.haveOwnProperty("block_height")
            expect(data).to.haveOwnProperty("parent_hash")
            expect(data.block_height).to.eql(blockHeight);
        });
    });

    describe("getBlockTxs", () => {
        it("get the block transactions with block hash", async () => {
            const data = await ergoNetwork.getBlockTxs(blockHash);
            expect(data).to.have.lengthOf(1)
            expect(data[0].id).to.eq(txId1)
        });
    });

    describe("getCurrentHeight", () => {
        it("get the latest block", async () => {
            const data = await ergoNetwork.getCurrentHeight()
            expect(data).to.eq(205800)
        });
    });
})
