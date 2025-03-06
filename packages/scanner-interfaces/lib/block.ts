export interface Block {
  parentHash: string;
  hash: string;
  height: number;
  timestamp: number;
  extra?: string;
  txCount?: number;
}

export interface BlockInfo {
  height: number;
  hash: string;
}
