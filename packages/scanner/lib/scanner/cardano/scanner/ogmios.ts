import { WebSocketScanner } from '../../abstract/webSocketScanner';
import {
  Block,
  BlockPraos,
  Point,
  PointOrOrigin,
  TipOrOrigin,
  Transaction,
} from '@cardano-ogmios/schema';
import {
  createInteractionContext,
  createChainSynchronizationClient,
  InteractionContext,
} from '@cardano-ogmios/client';
import {
  ChainSynchronizationClient,
  findIntersection,
} from '@cardano-ogmios/client/dist/ChainSynchronization';
import { BlockDbAction } from '../../action';
import { CardanoOgmiosConfig } from '../interfaces';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  CONNECTION_RETRIAL,
  RECONNECTION_DELAY,
  SLOT_SHELLY_NUMBER,
} from '../../../constants';

interface BackwardResponse {
  point: PointOrOrigin;
  tip: TipOrOrigin;
}

interface ForwardResponse {
  block: Block;
  tip: TipOrOrigin;
}

class CardanoOgmiosScanner extends WebSocketScanner<Transaction> {
  client: ChainSynchronizationClient;
  initPoint: Point;
  host: string;
  port: number;
  useTls: boolean;
  connectionRetrialInterval: number;
  private connected: boolean;
  name = () => 'cardano-ogmios';

  constructor(config: CardanoOgmiosConfig, logger?: AbstractLogger) {
    super(logger, config.maxTryBlock);
    this.action = new BlockDbAction(config.dataSource, this.name(), logger);
    this.host = config.nodeHostOrIp;
    this.port = config.nodePort;
    this.useTls = config.useTls ?? false;
    this.connectionRetrialInterval = config.connectionRetrialInterval;
    this.connected = false;
    this.initPoint = {
      id: config.initialHash,
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
    const hash = (response.point as Point).id;
    const savedBlock = await this.action.getBlockWithHash(hash);
    this.logger.debug(
      `Rolling backward to height ${
        savedBlock?.height
      } in scanner ${this.name()}`
    );
    if (savedBlock) {
      const block = {
        hash: savedBlock.hash,
        blockHeight: savedBlock.height,
        parentHash: savedBlock.parentHash,
        extra: savedBlock.extra,
        timestamp: savedBlock.timestamp,
      };
      await this.stepBackward(block);
    }
    requestNext();
  };

  /**
   * Step forward when new block arrived ogmios-client call this function
   * @param response: new block
   * @param requestNext: tell library that this block proceeds. pass next block when available
   */
  rollForward = async (response: ForwardResponse, requestNext: () => void) => {
    if (response.block.type === 'praos') {
      const praosBlock = response.block as BlockPraos;
      this.logger.debug(
        `Queueing new block at height ${
          praosBlock.height
        } in scanner ${this.name()}`
      );
      const block = {
        hash: praosBlock.id,
        blockHeight: praosBlock.height,
        parentHash: praosBlock.ancestor,
        extra: `${praosBlock.slot}`,
        // Caution: In case of a hard fork and change in slot duration, this must change!
        timestamp: praosBlock.slot + SLOT_SHELLY_NUMBER,
      };
      if (praosBlock.transactions)
        await this.stepForward(block, praosBlock.transactions);
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
        const release = await this.mutex.acquire();
        const blocks = await this.action.getLastSavedBlocks(skip, count);
        release();
        if (blocks.length === 0) count = 0;
        const points =
          blocks.length > 0
            ? blocks.map((item) => ({
                slot: item.extra ? parseInt(item.extra) : 0,
                id: item.hash,
              }))
            : [this.initPoint];
        const intersect = await findIntersection(context, points);
        const intersectPoint = intersect.intersection as Point;
        let height = 0;
        if (blocks.length) {
          const foundedBlock = blocks.find(
            (item) => (item.hash = intersectPoint.id)
          );
          if (foundedBlock) {
            height = foundedBlock.height;
          }
        }
        return { point: intersect.intersection as Point, height: height };
      } catch {
        skip += count;
        count *= 2;
      }
    }
    return undefined;
  };

  /**
   * Handles ogmios connection closure
   */
  connectionCloseHandler = async () => {
    this.connected = false;
    this.logger.warn('Ogmios connection closed');
    let trial = 0;
    const connectionTrial = async () => {
      trial++;
      if (trial > CONNECTION_RETRIAL) {
        this.logger.error(
          `Could not connect to ogmios client after ${CONNECTION_RETRIAL} retrials. Check the ogmios connection and restart the service.`
        );
        return;
      }
      this.logger.debug(
        `Retrying to connect to ogmios client in trial step #${trial}`
      );
      try {
        await this.start();
      } catch (e) {
        this.logger.warn(
          `An error occurred while reconnecting to ogmios client: ${e}`
        );
        setTimeout(connectionTrial, this.connectionRetrialInterval);
      }
    };
    setTimeout(connectionTrial, RECONNECTION_DELAY);
  };

  /**
   * start scanner. first find fork point. fork all blocks and request updates from node.
   */
  start = async (): Promise<void> => {
    const context: InteractionContext = await createInteractionContext(
      (err) => this.logger.error(`${err}`),
      this.connectionCloseHandler,
      { connection: { port: this.port, host: this.host, tls: this.useTls } }
    );
    const intersect = await this.findIntersection(context);
    if (intersect) {
      // find intersect then start from that point
      this.client = await createChainSynchronizationClient(
        context,
        {
          rollBackward: this.rollBackward,
          rollForward: this.rollForward,
        },
        { sequential: true }
      );
      this.connected = true;
      await this.forkBlock(intersect.height + 1);
      await this.client.resume([intersect.point], 2);
    } else {
      throw Error('Can not start scanner. initial block is invalid');
    }
  };

  /**
   * stop ws connection to node.
   */
  stop = async (): Promise<void> => {
    this.connected = false;
    await this.client.shutdown();
  };

  /**
   * @returns The connection status of ogmios scanner
   */
  getConnectionStatus = () => this.connected;
}

export { CardanoOgmiosScanner };
