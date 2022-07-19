import { AbstractScanner } from 'abstract-scanner'
import { Repository } from 'typeorm'
import { BlockEntity } from 'abstract-scanner/entities/blockEntity'
import { AbstractExecutor } from 'abstract-scanner/interfaces/abstractExecutor'
import { CardanoScannerConfig } from "./interfaces";
import { KoiosNetwork } from "./network/koios";
import { KoiosTransaction } from "./interfaces/Koios";

class CardanoKoiosScanner extends AbstractScanner<KoiosTransaction> {
    readonly blockRepository: Repository<BlockEntity>;
    executors: Array<AbstractExecutor<KoiosTransaction>>;
    readonly initialHeight: number;
    networkAccess: KoiosNetwork;

    constructor(config: CardanoScannerConfig){
        super();
        this.blockRepository = config.dataSource.getRepository(BlockEntity);
        this.executors = []
        this.initialHeight = config.initialHeight
        this.networkAccess = new KoiosNetwork(config.koiosUrl, config.timeout);
    }
}

export {
    CardanoKoiosScanner
}
