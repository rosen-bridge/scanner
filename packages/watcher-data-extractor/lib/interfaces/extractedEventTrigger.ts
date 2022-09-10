interface ExtractedEventTrigger{
    boxId: string,
    boxSerialized: string,
    fromChain: string,
    toChain: string,
    fromAddress: string,
    toAddress: string,
    amount: string,
    bridgeFee: string,
    networkFee: string,
    sourceChainTokenId: string,
    targetChainTokenId: string,
    sourceBlockId: string,
    sourceTxId: string,
    WIDs: string,
}

export { ExtractedEventTrigger };
