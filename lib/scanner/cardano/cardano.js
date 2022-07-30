import { AbstractScanner } from '../abstract';
import { KoiosNetwork } from "./network/koios";
import { BlockEntity } from "../../entities/blockEntity";
class CardanoKoiosScanner extends AbstractScanner {
    blockRepository;
    extractors;
    initialHeight;
    networkAccess;
    name = () => "cardano-koios";
    constructor(config) {
        super();
        this.blockRepository = config.dataSource.getRepository(BlockEntity);
        this.extractors = [];
        this.initialHeight = config.initialHeight;
        this.networkAccess = new KoiosNetwork(config.koiosUrl, config.timeout);
    }
}
export { CardanoKoiosScanner };
