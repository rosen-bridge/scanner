import { Block } from "../objects/interfaces";

export abstract class AbstractDataBase<DataT>{
    abstract dataSource: unknown;
    abstract blockRepository: unknown;

    /**
     * get last saved block
     * @return Promise<Block or undefined>
     */
    abstract getLastSavedBlock(): Promise<Block | undefined>;

    /**
     * it deletes every block that more than or equal height
     * @param height
     * @return unknown
     */
    abstract removeForkedBlocks(height: number): unknown;

    /**
     * save blocks with observation of that block
     * @param height
     * @param blockHash
     * @param data
     * @return Promise<boolean>
     */
    abstract saveBlock(height: number, blockHash: string, data: DataT): Promise<boolean>;

    /**
     * get block hash and height
     * @param height
     * @return Promise<Block|undefined>
     */
    abstract getBlockAtHeight(height: number): Promise<Block | undefined>;
}

