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
  InteractionContext,
} from '@cardano-ogmios/client';
import {
  ChainSyncClient,
  createChainSyncClient,
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

  rollForward = async (response: ForwardResponse, requestNext: () => void) => {
    if (Object.prototype.hasOwnProperty.call(response.block, 'babbage')) {
      const babbageBlock = (response.block as Babbage).babbage;
      const block = {
        hash: babbageBlock.header.blockHash,
        blockHeight: babbageBlock.header.blockHeight,
        parentHash: babbageBlock.header.prevHash,
        extra: `${babbageBlock.header.slot}`,
      };
      await this.forwardBlock(block, babbageBlock.body);
    }
    requestNext();
  };

  findIntersection = async (context: InteractionContext) => {
    let count = 1;
    let skip = 0;
    while (count !== 0) {
      try {
        const blocks = await this.action.getLastSavedBlocks(skip, count);
        if (blocks === undefined) count = 0;
        const points = blocks
          ? blocks.map((item) => ({
              slot: parseInt(item.extra),
              hash: item.hash,
            }))
          : [this.initPoint];
        const intersect = await findIntersect(context, points);
        return intersect.point as Point;
      } catch {
        skip += count;
        count *= 2;
      }
    }
    return undefined;
  };

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
      await this.client.startSync([intersect]);
    } else {
      throw Error('Can not start scanner. initial block is invalid');
    }
  };

  stop = async (): Promise<void> => {
    await this.client.shutdown();
  };
}

export { CardanoOgmiosScanner };
