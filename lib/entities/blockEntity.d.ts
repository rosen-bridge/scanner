declare const PROCESSING = "PROCESSING";
declare const PROCEED = "PROCEED";
export declare class BlockEntity {
    height: number;
    hash: string;
    parentHash: string;
    status: string;
    scanner: string;
}
export { PROCEED, PROCESSING };
