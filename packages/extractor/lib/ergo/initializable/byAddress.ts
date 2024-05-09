import { AbstractLogger } from '@rosen-bridge/abstract-logger';

import { ErgoExtractedData, ErgoNetworkType, ErgoBox } from '../interfaces';
import { AbstractInitializableErgoExtractor } from './abstract';
import { BlockInfo } from '../../interfaces';
import { ExplorerNetwork } from '../network/explorer';
import { NodeNetwork } from '../network/node';

export abstract class InitializableByAddressErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractInitializableErgoExtractor<ExtractedData> {
  constructor(
    type: ErgoNetworkType,
    url: string,
    address: string,
    initialize?: boolean,
    logger?: AbstractLogger
  ) {
    super(initialize, logger);
    let network: ExplorerNetwork | NodeNetwork;
    if (type == ErgoNetworkType.Explorer) {
      network = new ExplorerNetwork(url);
    } else if (type == ErgoNetworkType.Node) {
      network = new NodeNetwork(url);
    } else throw new Error(`Network type ${type} is not supported`);
    this.getTxBlock = network.getTxBlock;
    this.getBoxesWithOffsetLimit = (offset: number, limit: number) =>
      network.getBoxesByAddress(address, offset, limit);
  }

  /**
   * @returns explorer client data with specified limit and offset
   */
  getBoxesWithOffsetLimit: (
    offset: number,
    limit: number
  ) => Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }>;

  /**
   * Return block information of specified tx
   * @param txId
   */
  getTxBlock: (txId: string) => Promise<BlockInfo>;
}
