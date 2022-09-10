import { ExtractedObservation } from "../interfaces/extractedObservation";

export const firstObservations: Array<ExtractedObservation> = [{
    fromChain: "erg",
    toChain: "cardano",
    fromAddress: "ErgoAddress",
    toAddress: "cardanoAddress",
    amount: "1000000000",
    bridgeFee: "1000000",
    networkFee: "1000000",
    sourceChainTokenId: "ergoTokenId",
    targetChainTokenId: "cardanoTokenId",
    sourceTxId: "ergoTxId1",
    sourceBlockId: "ergoBlockId",
    requestId: "reqId1",
}, {
    fromChain: "erg",
    toChain: "cardano",
    fromAddress: "ergoAddress",
    toAddress: "cardanoAddress",
    amount: "1100000000",
    bridgeFee: "1000000",
    networkFee: "1000000",
    sourceChainTokenId: "ergoTokenId",
    targetChainTokenId: "cardanoTokenId",
    sourceTxId: "ergoTxId2",
    sourceBlockId: "ergoBlockId",
    requestId: "reqId2",
}];

export const secondObservations: Array<ExtractedObservation> = [{
    ...firstObservations[0],
    requestId: "reqId3",
}, {
    ...firstObservations[1],
    requestId: "reqId4",
}];
