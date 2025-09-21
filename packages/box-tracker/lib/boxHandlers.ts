export type Asset = {
  tokenId: string;
  amount: bigint;
};

export type AdditionalRegisters = Record<string, string>;

export type Token = {
  tokenId: string;
  amount: bigint;
};

export type ErgoBox = {
  boxId: string;
  value: bigint;
  ergoTree: string;
  creationHeight: number;
  assets: Array<Asset>;
  additionalRegisters: AdditionalRegisters;
  transactionId: string;
  index: number;
};

export function generateTracker(address: string, tokens: Token[]) {
  return (box: ErgoBox): boolean => {
    const isAddressMatch = box.ergoTree === address;

    const hasAllTokens = tokens.every((t) => {
      const asset = box.assets.find((a) => a.tokenId === t.tokenId);
      return asset !== undefined && asset.amount >= t.amount;
    });

    return isAddressMatch && hasAllTokens;
  };
}

export function reduceTrack(
  boxes: ErgoBox[],
  spentBoxIds: string[],
): ErgoBox | undefined {
  return boxes.find((box) => !spentBoxIds.includes(box.boxId));
}
