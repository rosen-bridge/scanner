import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractScanner } from 'abstract-scanner'
import { Repository } from 'typeorm'
import { BlockEntity } from 'abstract-scanner/entities/blockEntity'
import { AbstractExtractor } from 'abstract-scanner/interfaces/abstractExtractor'
import { ErgoNetworkApi } from "./network/ergoNetworkApi";
import { ErgoScannerConfig } from "./interfaces";

class ErgoScanner extends AbstractScanner<wasm.Transaction> {
    readonly blockRepository: Repository<BlockEntity>;
    extractors: Array<AbstractExtractor<wasm.Transaction>>;
    readonly initialHeight: number;
    networkAccess: ErgoNetworkApi;

    constructor(config: ErgoScannerConfig){
        super();
        this.blockRepository = config.dataSource.getRepository(BlockEntity);
        this.extractors = []
        this.initialHeight = config.initialHeight
        this.networkAccess = new ErgoNetworkApi(config.nodeUrl, config.timeout);
    }
}

export {
    ErgoScanner
}
