import { AbstractScanner } from 'abstract-scanner'
import { Repository } from 'typeorm'
import { BlockEntity } from 'abstract-scanner/entities/blockEntity'
import { AbstractExtractor } from 'abstract-scanner/interfaces/abstractExtractor'
import { CardanoScannerConfig } from "./interfaces";
import { KoiosNetwork } from "./network/koios";
import { KoiosTransaction } from "./interfaces/Koios";

class CardanoKoiosScanner extends AbstractScanner<KoiosTransaction> {
    readonly blockRepository: Repository<BlockEntity>;
    extractors: Array<AbstractExtractor<KoiosTransaction>>;
    readonly initialHeight: number;
    networkAccess: KoiosNetwork;

    constructor(config: CardanoScannerConfig){
        super();
        this.blockRepository = config.dataSource.getRepository(BlockEntity);
        this.extractors = []
        this.initialHeight = config.initialHeight
        this.networkAccess = new KoiosNetwork(config.koiosUrl, config.timeout);
    }
}

export {
    CardanoKoiosScanner
}
