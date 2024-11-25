export interface Block {
  parentHash: string;
  hash: string;
  height: number;
  timestamp: number;
  extra?: string;
}

export interface BlockInfo {
  height: number;
  hash: string;
}

export type ExtractorCallback = (extractorId: string) => Promise<void>;
