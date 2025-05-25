export type OrdiscanRunesTransfer = {
  txid: string;
  runestone_messages: RunestoneMessage[];
  inputs: RunicInput[];
  outputs: RunicOutput[];
};

export type RunicInput = {
  address: string;
  output: string;
  rune: string;
  rune_amount: string;
};

export type RunicOutput = {
  address: string;
  vout: number;
  rune: string;
  rune_amount: string;
};

export type RunestoneMessage = { rune: string; type: RunestoneMessageType };

export type RunestoneMessageType = 'ETCH' | 'MINT' | 'TRANSFER';
