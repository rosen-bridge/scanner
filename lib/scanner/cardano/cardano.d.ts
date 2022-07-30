import { Repository } from 'typeorm';
import { AbstractScanner } from '../abstract';
import { CardanoScannerConfig } from "./interfaces";
import { KoiosNetwork } from "./network/koios";
import { KoiosTransaction } from "./interfaces/Koios";
import { BlockEntity } from "../../entities/blockEntity";
import { AbstractExtractor } from "../../interfaces";
declare class CardanoKoiosScanner extends AbstractScanner<KoiosTransaction> {
    readonly blockRepository: Repository<BlockEntity>;
    extractors: Array<AbstractExtractor<KoiosTransaction>>;
    readonly initialHeight: number;
    networkAccess: KoiosNetwork;
    name: () => string;
    constructor(config: CardanoScannerConfig);
}
export { CardanoKoiosScanner };
