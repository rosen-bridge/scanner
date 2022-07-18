import { DataSource, DeleteResult, MoreThanOrEqual, Repository } from "typeorm";
import { BlockEntity, PROCEED, PROCESSING } from "./entities/BlockEntity";
import { AbstractExecutor } from "./interfaces/abstractExecutor";
import { AbstractNetworkConnector } from "./interfaces/abstractNetworkConnector";
import { Block } from "./interfaces/Block";

export abstract class AbstractScanner<TxT>{
    abstract _dataSource: DataSource;
    abstract _blockRepository: Repository<BlockEntity>;
    abstract readonly _initialHeight: number;
    abstract _executors: Array<AbstractExecutor<TxT>>;
    abstract _networkAccess: AbstractNetworkConnector;

    /**
     * get last saved block
     * @return Promise<BlockEntity or undefined>
     */
    getLastSavedBlock = async (): Promise<BlockEntity | undefined> => {
        const lastBlock = await this._blockRepository.find({
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
        const block = await this._blockRepository.findOneBy({
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
        return await this._blockRepository.delete({
            height: MoreThanOrEqual(height)
        });
    }

    /**
     * function that checks if fork is happen in the blockchain or not
     * @return Promise<Boolean>
     */
    isForkHappen = async (): Promise<Boolean> => {
        const lastSavedBlock = await this.getLastSavedBlock();
        if (lastSavedBlock !== undefined) {
            const lastSavedBlockFromNetwork = await this._networkAccess.getBlockAtHeight(lastSavedBlock.height);
            return (lastSavedBlockFromNetwork.hash !== lastSavedBlock.hash);
        } else {
            return false;
        }
    }

    saveBlock = async (block: Block): Promise<BlockEntity | boolean> => {
        const row = new BlockEntity();
        row.height = block.blockHeight;
        row.hash = block.hash;
        row.parentHash = block.parentHash;
        row.status = PROCESSING;
        return await this._blockRepository.save(row).catch(err => false);
    }

    updateBlockStatus = async (blockHeight: number): Promise<Boolean> => {
        const block = await this.getBlockAtHeight(blockHeight, PROCESSING);
        if (block === undefined) {
            return false;
        }
        block.status = PROCEED;
        return await this._blockRepository.save(block).then(res => true).catch(err => false);
    }

    registerExecutor = (executor: AbstractExecutor<TxT>): void => {
        this._executors.push(executor);
    }

    removeExecutor = (executor: AbstractExecutor<TxT>): void => {
        const executorIndex = this._executors.findIndex((executor) => {
            return executor._id === executor._id
        });
        this._executors.splice(executorIndex, 1);
    }

    abstract getBlockTxs(blockHash: number): Promise<TxT>;

    /**
     * worker function that runs for syncing the database with the Cardano blockchain and checks if we have any fork
     * scenario in the blockchain and invalidate the database till the database synced again.
     */
    update = async () => {
        const saveBlock = async (block: Block) => {
            const savedBlock = await this.saveBlock(block);
            if (typeof savedBlock === "boolean") {
                return false;
            }
            const txs = await this.getBlockTxs(block.blockHeight);
            const result = (await Promise.all(this._executors.map(
                (executor) => {
                    return executor.processTransactions(txs);
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
                const block = await this._networkAccess.getBlockAtHeight(this._initialHeight);
                await saveBlock(block);
                return;
            }
            if (!await this.isForkHappen()) {
                const currentHeight = await this._networkAccess.getCurrentHeight()
                if (this._initialHeight >= currentHeight) {
                    return;
                }
                for (let height = lastSavedBlock.height + 1; height <= currentHeight; height++) {
                    const block = await this._networkAccess.getBlockAtHeight(height);
                    if (lastSavedBlock !== undefined) {
                        if (block.parentHash === lastSavedBlock?.hash) {
                            const savedBlock = await saveBlock(block);
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
                let blockFromNetwork = await this._networkAccess.getBlockAtHeight(forkPointHeight);
                while (blockFromNetwork.hash !== forkPoint.hash && blockFromNetwork.parentHash !== forkPoint.parentHash) {
                    let block = await this.getBlockAtHeight(forkPointHeight - 1);
                    while (block !== undefined && forkPointHeight > this._initialHeight) {
                        forkPointHeight--;
                        block = await this.getBlockAtHeight(forkPointHeight - 1);
                    }
                    if (block !== undefined) {
                        forkPoint = block;
                        blockFromNetwork = await this._networkAccess.getBlockAtHeight(forkPointHeight - 1);
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
