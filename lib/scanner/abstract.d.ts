import { DeleteResult, Repository } from "typeorm";
import { BlockEntity } from "../entities/blockEntity";
import { Block, AbstractNetworkConnector, AbstractExtractor } from "../interfaces";
export declare abstract class AbstractScanner<TransactionType> {
    abstract readonly blockRepository: Repository<BlockEntity>;
    abstract readonly initialHeight: number;
    abstract extractors: Array<AbstractExtractor<TransactionType>>;
    abstract networkAccess: AbstractNetworkConnector<TransactionType>;
    abstract name: () => string;
    /**
     * get last saved block
     * @return Promise<BlockEntity or undefined>
     */
    getLastSavedBlock: () => Promise<BlockEntity | undefined>;
    /**
     * get block hash and height
     * @param height
     * @param status
     * @return Promise<BlockEntity|undefined>
     */
    getBlockAtHeight: (height: number, status?: string) => Promise<BlockEntity | undefined>;
    /**
     * it deletes every block that more than or equal height
     * @param height
     * @return Promise<DeleteResult>
     */
    removeForkedBlocks: (height: number) => Promise<DeleteResult>;
    /**
     * function that checks if fork is happen in the blockchain or not
     * @return Promise<Boolean>
     */
    isForkHappen: () => Promise<boolean>;
    /**
     * store a block into database.
     * @param block
     */
    saveBlock: (block: Block) => Promise<BlockEntity | boolean>;
    /**
     * Update status of a block to proceed
     * @param blockHeight: height of expected block
     */
    updateBlockStatus: (blockHeight: number) => Promise<boolean>;
    /**
     * register a nre extractor to scanner.
     * @param extractor
     */
    registerExtractor: (extractor: AbstractExtractor<TransactionType>) => void;
    /**
     * remove an extractor from scanner
     * @param extractor
     */
    removeExtractor: (extractor: AbstractExtractor<TransactionType>) => void;
    /**
     * worker function that runs for syncing the database with the Cardano blockchain and checks if we have any fork
     * scenario in the blockchain and invalidate the database till the database synced again.
     */
    update: () => Promise<void>;
}
