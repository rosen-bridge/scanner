import { WebSocketScanner } from '../../abstract/webSocketScanner';
import {
  Babbage,
  Block,
  Point,
  PointOrOrigin,
  TipOrOrigin,
  TxBabbage,
} from '@cardano-ogmios/schema';
import {
  createInteractionContext,
  createChainSyncClient,
  InteractionContext,
} from '@cardano-ogmios/client';
import {
  ChainSyncClient,
  findIntersect,
} from '@cardano-ogmios/client/dist/ChainSync';
import { BlockDbAction } from '../../action';
import { CardanoOgmiosConfig } from '../interfaces';

interface BackwardResponse {
  point: PointOrOrigin;
  tip: TipOrOrigin;
}

interface ForwardResponse {
  block: Block;
  tip: TipOrOrigin;
}

class CardanoOgmiosScanner extends WebSocketScanner<TxBabbage> {
  client: ChainSyncClient;
  initPoint: Point;
  host: string;
  port: number;
  name = () => 'cardano-ogmios';

  constructor(config: CardanoOgmiosConfig) {
    super();
    this.action = new BlockDbAction(config.dataSource, this.name());
    this.host = config.nodeIp;
    this.port = config.nodePort;

    this.initPoint = {
      hash: config.initialHash,
      slot: config.initialSlot,
    };
  }

  /**
   * process block when a block forked library call this function
   * @param response: forked block
   * @param requestNext: a function to tell node to send next block
   */
  rollBackward = async (
    response: BackwardResponse,
    requestNext: () => void
  ) => {
    const hash = (response.point as Point).hash;
    const block = await this.action.getBlockWithHash(hash);
    if (block) {
      await this.forkBlock(block.height);
    }
    requestNext();
  };

  /**
   * Step forward when new block arrived ogmios-client call this function
   * @param response: new block
   * @param requestNext: tell library that this block proceeds. pass next block when available
   */
  rollForward = async (response: ForwardResponse, requestNext: () => void) => {
    if (Object.prototype.hasOwnProperty.call(response.block, 'babbage')) {
      const babbageBlock = (response.block as Babbage).babbage;
      const block = {
        hash: babbageBlock.headerHash,
        blockHeight: babbageBlock.header.blockHeight,
        parentHash: babbageBlock.header.prevHash,
        extra: `${babbageBlock.header.slot}`,
      };
      await this.forwardBlock(block, babbageBlock.body);
    }
    requestNext();
  };

  /**
   * find intersect between stored blocks and blockchain.
   * @param context: blockchain context
   */
  findIntersection = async (context: InteractionContext) => {
    let count = 1;
    let skip = 0;
    while (count !== 0) {
      try {
        const blocks = await this.action.getLastSavedBlocks(skip, count);
        if (blocks.length === 0) count = 0;
        const points =
          blocks.length > 0
            ? blocks.map((item) => ({
                slot: item.extra ? parseInt(item.extra) : 0,
                hash: item.hash,
              }))
            : [this.initPoint];
        const intersect = await findIntersect(context, points);
        const intersectPoint = intersect.point as Point;
        let height = 0;
        if (blocks.length) {
          const foundedBlock = blocks.find(
            (item) => (item.hash = intersectPoint.hash)
          );
          if (foundedBlock) {
            height = foundedBlock.height;
          }
        }
        return { point: intersect.point as Point, height: height };
      } catch {
        skip += count;
        count *= 2;
      }
    }
    return undefined;
  };

  /**
   * start scanner. first find fork point. fork all blocks and request updates from node.
   */
  start = async (): Promise<void> => {
    const context: InteractionContext = await createInteractionContext(
      (err) => console.error(err),
      () => console.log('Connection closed.'),
      { connection: { port: 1337, host: this.host } }
    );
    const intersect = await this.findIntersection(context);
    if (intersect) {
      // find intersect then start from that point
      this.client = await createChainSyncClient(context, {
        rollBackward: this.rollBackward,
        rollForward: this.rollForward,
      });
      await this.forkBlock(intersect.height);
      await this.client.startSync([intersect.point]);
    } else {
      throw Error('Can not start scanner. initial block is invalid');
    }
  };

  /**
   * stop ws connection to node.
   */
  stop = async (): Promise<void> => {
    await this.client.shutdown();
  };
}

export { CardanoOgmiosScanner };
