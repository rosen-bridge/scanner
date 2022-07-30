import { AbstractScanner } from "../abstract";
import { BlockEntity } from "../../entities/blockEntity";
import { ErgoNetworkApi } from "./network/ergoNetworkApi";
class ErgoScanner extends AbstractScanner {
    blockRepository;
    extractors;
    initialHeight;
    networkAccess;
    constructor(config) {
        super();
        this.blockRepository = config.dataSource.getRepository(BlockEntity);
        this.extractors = [];
        this.initialHeight = config.initialHeight;
        this.networkAccess = new ErgoNetworkApi(config.nodeUrl, config.timeout);
    }
    name = () => {
        return "ergo-node";
    };
}
export { ErgoScanner };
