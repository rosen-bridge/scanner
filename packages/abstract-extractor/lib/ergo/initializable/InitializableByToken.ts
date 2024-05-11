import { AbstractLogger } from '@rosen-bridge/abstract-logger';

import { ErgoExtractedData, ErgoNetworkType, ErgoBox } from '../interfaces';
import { AbstractInitializableErgoExtractor } from './AbstractInitializable';
import { BlockInfo } from '../../interfaces';
import { ExplorerNetwork } from '../network/ExplorerNetwork';
import { NodeNetwork } from '../network/NodeNetwork';
import { AbstractNetwork } from '../network/AbstractNetwork';

export abstract class AbstractInitializableByTokenErgoExtractor<
  ExtractedData extends ErgoExtractedData
> extends AbstractInitializableErgoExtractor<ExtractedData> {
  private tokenId: string;
  private network: AbstractNetwork;

  constructor(
    type: ErgoNetworkType,
    url: string,
    tokenId: string,
    initialize?: boolean,
    logger?: AbstractLogger
  ) {
    super(initialize, logger);
    this.tokenId = tokenId;
    if (type == ErgoNetworkType.Explorer) {
      this.network = new ExplorerNetwork(url);
    } else if (type == ErgoNetworkType.Node) {
      this.network = new NodeNetwork(url);
    } else throw new Error(`Network type ${type} is not supported`);
  }

  /**
   * return boxes by token id from the specified network source
   * @param offset
   * @param limit
   */
  getBoxesWithOffsetLimit = (
    offset: number,
    limit: number
  ): Promise<{ boxes: ErgoBox[]; hasNextBatch: boolean }> => {
    return this.network.getBoxesByTokenId(this.tokenId, offset, limit);
  };

  /**
   * return block information from the specified network source
   * @param txId
   */
  getTxBlock = (txId: string): Promise<BlockInfo> => {
    return this.network.getTxBlock(txId);
  };
}
