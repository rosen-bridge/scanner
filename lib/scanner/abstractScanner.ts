import { AbstractNetworkConnector } from "../network/abstractNetworkConnector";
import { AbstractDataBase } from "../models/abstractDBModel";
import { Block } from "../objects/interfaces";

export abstract class AbstractScanner<DataT>{
    abstract _dataBase: AbstractDataBase<DataT>;
    abstract _networkAccess: AbstractNetworkConnector;
    abstract _initialHeight: number;

    /**
     * function that checks if fork is happen in the blockchain or not
     * @return Promise<Boolean>
     */
    isForkHappen = async (): Promise<Boolean> => {
        const lastSavedBlock = await this._dataBase.getLastSavedBlock();
        if (lastSavedBlock !== undefined) {
            const lastSavedBlockFromNetwork = await this._networkAccess.getBlockAtHeight(lastSavedBlock.block_height);
            return (lastSavedBlockFromNetwork.hash !== lastSavedBlock.hash);
        } else {
            return false;
        }
    }

    abstract getBlockInformation(block: Block): Promise<DataT>;

    /**
     * worker function that runs for syncing the database with the Cardano blockchain and checks if we have any fork
     * scenario in the blockchain and invalidate the database till the database synced again.
     */
    update = async () => {
        try {
            const lastSavedBlock = (await this._dataBase.getLastSavedBlock());
            if (!await this.isForkHappen()) {
                const lastBlockHeight = await this._networkAccess.getCurrentHeight()
                let height = null;
                if (lastSavedBlock !== undefined) {
                    height = lastSavedBlock.block_height + 1;
                } else {
                    if (this._initialHeight > lastBlockHeight) {
                        console.log("scanner initial height is more than current block height!");
                        return;
                    }
                    height = this._initialHeight;
                }
                for (height; height <= lastBlockHeight; height++) {
                    const block = await this._networkAccess.getBlockAtHeight(height);
                    if (block.parent_hash === lastSavedBlock?.hash) {
                        const info = await this.getBlockInformation(block);
                        if (!await this._dataBase.saveBlock(block.block_height, block.hash, info)) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            } else {
                let forkPointer = lastSavedBlock!;
                let blockFromNetwork = await this._networkAccess.getBlockAtHeight(forkPointer.block_height);
                while (blockFromNetwork.hash !== forkPointer.hash && blockFromNetwork.parent_hash !== forkPointer.parent_hash) {
                    const block = await this._dataBase.getBlockAtHeight(forkPointer.block_height - 1);
                    if (block === undefined) {
                        break;
                    } else {
                        forkPointer = block;
                    }
                    blockFromNetwork = await this._networkAccess.getBlockAtHeight(blockFromNetwork.block_height - 1);
                }
                await this._dataBase.removeForkedBlocks(forkPointer.block_height);
            }
        } catch (e) {
            console.log(e)
        }
    }

}
