export interface ExtractedObservation {
    fromChain: string,
    toChain: string,
    networkFee: string,
    bridgeFee: string,
    amount: string,
    sourceChainTokenId: string,
    targetChainTokenId: string,
    sourceTxId: string,
    sourceBlockId: string,
    requestId: string,
    toAddress: string,
    fromAddress: string,
}
