import { DeleteResult, MoreThanOrEqual, Repository } from "typeorm";
import { BlockEntity, PROCEED, PROCESSING } from "./entities/blockEntity";
import { AbstractExtractor } from "./interfaces/abstractExtractor";
import { AbstractNetworkConnector } from "./interfaces/abstractNetworkConnector";
import { Block } from "./interfaces/block";

export abstract class AbstractScanner<TransactionType> {
    abstract readonly blockRepository: Repository<BlockEntity>;
    abstract readonly initialHeight: number;
    abstract extractors: Array<AbstractExtractor<TransactionType>>;
    abstract networkAccess: AbstractNetworkConnector<TransactionType>;

    /**
     * get last saved block
     * @return Promise<BlockEntity or undefined>
     */
    getLastSavedBlock = async (): Promise<BlockEntity | undefined> => {
        const lastBlock = await this.blockRepository.find({
            where: {status: PROCEED},
            order: {height: 'DESC'},
            take: 1
        });
        if (lastBlock.length !== 0) {
            return lastBlock[0];
        } else {
            return undefined;
        }
    }

    /**
     * get block hash and height
     * @param height
     * @param status
     * @return Promise<BlockEntity|undefined>
     */
    getBlockAtHeight = async (height: number, status: string = PROCEED): Promise<BlockEntity | undefined> => {
        const block = await this.blockRepository.findOneBy({
            status: status,
            height: height,
        });
        if (block !== null) {
            return block;
        } else {
            return undefined;
        }
    }

    /**
     * it deletes every block that more than or equal height
     * @param height
     * @return Promise<DeleteResult>
     */
    removeForkedBlocks = async (height: number): Promise<DeleteResult> => {
        return await this.blockRepository.delete({
            height: MoreThanOrEqual(height)
        });
    }

    /**
     * function that checks if fork is happen in the blockchain or not
     * @return Promise<Boolean>
     */
    isForkHappen = async (): Promise<boolean> => {
        const lastSavedBlock = await this.getLastSavedBlock();
        if (lastSavedBlock !== undefined) {
            const lastSavedBlockFromNetwork = await this.networkAccess.getBlockAtHeight(lastSavedBlock.height);
            return (lastSavedBlockFromNetwork.hash !== lastSavedBlock.hash);
        } else {
            return false;
        }
    }

    /**
     * store a block into database.
     * @param block
     */
    saveBlock = async (block: Block): Promise<BlockEntity | boolean> => {
        const row = new BlockEntity();
        row.height = block.blockHeight;
        row.hash = block.hash;
        row.parentHash = block.parentHash;
        row.status = PROCESSING;
        return await this.blockRepository.save(row).catch(() => false);
    }

    /**
     * Update status of a block to proceed
     * @param blockHeight: height of expected block
     */
    updateBlockStatus = async (blockHeight: number): Promise<boolean> => {
        const block = await this.getBlockAtHeight(blockHeight, PROCESSING);
        if (block === undefined) {
            return false;
        }
        block.status = PROCEED;
        return await this.blockRepository.save(block).then(() => true).catch(() => false);
    }

    /**
     * register a nre extractor to scanner.
     * @param extractor
     */
    registerExtractor = (extractor: AbstractExtractor<TransactionType>): void => {
        if (this.extractors.filter(extractorItem => extractorItem.id === extractor.id).length === 0) {
            this.extractors.push(extractor);
        }
    }

    /**
     * remove an extractor from scanner
     * @param extractor
     */
    removeExtractor = (extractor: AbstractExtractor<TransactionType>): void => {
        const extractorIndex = this.extractors.findIndex((extractorItem) => {
            return extractorItem.id === extractor.id
        });
        this.extractors.splice(extractorIndex, 1);
    }

    /**
     * worker function that runs for syncing the database with the Cardano blockchain and checks if we have any fork
     * scenario in the blockchain and invalidate the database till the database synced again.
     */
    update = async () => {
        const processBlock = async (block: Block) => {
            const savedBlock = await this.saveBlock(block);
            if (typeof savedBlock === "boolean") {
                return false;
            }
            const txs = await this.networkAccess.getBlockTxs(block.hash);
            const result = (await Promise.all(this.extractors.map(
                (extractor) => {
                    return extractor.processTransactions(txs);
                }))).reduce((prev, curr) => prev && curr, true);
            if (result && await this.updateBlockStatus(block.blockHeight)) {
                return savedBlock;
            } else {
                return false;
            }
        }
        try {
            let lastSavedBlock = (await this.getLastSavedBlock());
            if (lastSavedBlock === undefined) {
                const block = await this.networkAccess.getBlockAtHeight(this.initialHeight);
                await processBlock(block);
                return;
            }
            if (!await this.isForkHappen()) {
                const currentHeight = await this.networkAccess.getCurrentHeight()
                if (this.initialHeight >= currentHeight) {
                    return;
                }
                for (let height = lastSavedBlock.height + 1; height <= currentHeight; height++) {
                    const block = await this.networkAccess.getBlockAtHeight(height);
                    if (lastSavedBlock !== undefined) {
                        if (block.parentHash === lastSavedBlock?.hash) {
                            const savedBlock = await processBlock(block);
                            if (typeof savedBlock === "boolean") {
                                break;
                            } else {
                                lastSavedBlock = savedBlock;
                            }
                        } else {
                            break;
                        }
                    }
                }
            } else {
                let forkPoint = lastSavedBlock;
                let forkPointHeight = forkPoint.height;
                let blockFromNetwork = await this.networkAccess.getBlockAtHeight(forkPointHeight);
                while (blockFromNetwork.hash !== forkPoint.hash && blockFromNetwork.parentHash !== forkPoint.parentHash) {
                    let block = await this.getBlockAtHeight(forkPointHeight - 1);
                    while (block !== undefined && forkPointHeight > this.initialHeight) {
                        forkPointHeight--;
                        block = await this.getBlockAtHeight(forkPointHeight - 1);
                    }
                    if (block !== undefined) {
                        forkPoint = block;
                        blockFromNetwork = await this.networkAccess.getBlockAtHeight(forkPointHeight - 1);
                    } else {
                        break;
                    }
                }
                await this.removeForkedBlocks(forkPointHeight);
            }
        } catch (e) {
            console.log(e)
        }
    }

}
