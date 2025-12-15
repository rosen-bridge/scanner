import {
  createChainSynchronizationClient,
  findIntersection,
} from '@cardano-ogmios/client/dist/ChainSynchronization';
import {
  createInteractionContext,
  InteractionContext,
} from '@cardano-ogmios/client/dist/Connection';
import { Point, Transaction } from '@cardano-ogmios/schema';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { CardanoOgmiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';
import { ForwardResponse, OgmiosConnectionInfoInterface } from '../../types';

export class CardanoOgmiosRawDataProvider extends AbstractRawDataProvider<Transaction> {
  protected firstHeight: number | undefined;

  constructor(
    protected dataSource: DataSource,
    protected extractor: CardanoOgmiosObservationExtractor,
    protected ogmiosConnectionInfo: OgmiosConnectionInfoInterface,
    protected logger: AbstractLogger,
  ) {
    super('cardano', dataSource, extractor, logger);
    this.firstHeight = undefined;
  }

  /**
   * find intersect between stored blocks and blockchain.
   * @param context: blockchain context
   */
  private findIntersection = async (
    context: InteractionContext,
    height: number,
  ) => {
    const block = await this.action.getBlockOfHeight(this.chain, height);
    if (!block && height != 1)
      throw new Error(
        `Block is undefined on ${this.chain} chain at ${height} height`,
      );
    if (block && block.extra == undefined)
      throw new Error(
        `Slot value is undefined for block on ${this.chain} chain at ${height} height`,
      );

    let point: Point | 'origin' = 'origin';
    if (block)
      point = {
        slot: Number(block.extra),
        id: block.hash,
      } as Point;
    if (point == 'origin' && height != 1)
      throw new Error(
        `Can't provide point details for observation at [${height}] height, previous block details not exists.`,
      );
    this.logger.debug(
      `RawDataProvider fetched point of cardano-ogmios block at [${height}] height is ${JSON.stringify(point)}`,
    );
    const intersect = await findIntersection(context, [point]);
    this.logger.debug(
      `RawDataProvider cardano-ogmios returned intersection value is ${JSON.stringify({ point: intersect.intersection, height: height })}`,
    );
    return intersect.intersection;
  };

  /**
   * fetches a transaction from cardano-ogmios using the observation source transaction id
   *
   * @param context interaction context used to create the ogmios synchronization client
   * @param intersect starting point for chain synchronization or origin
   * @param observation observation entity containing the source transaction id
   * @returns the matched transaction or undefined if not found
   */
  protected fetchTx = async (
    context: InteractionContext,
    intersect: Point | 'origin',
    observation: ObservationEntity,
  ) => {
    let tx;
    let resolveDone: () => void;

    const done = new Promise<void>((resolve) => {
      resolveDone = resolve;
    });
    const client = await createChainSynchronizationClient(
      context,
      {
        rollBackward: async () => {},
        rollForward: async (response: ForwardResponse) => {
          this.logger.debug(
            `The cardano-ogmios rollForward method execute for block by [${response.block}] details`,
          );
          try {
            if (response.block.type === 'praos') {
              this.logger.debug(
                `The cardano-ogmios observation by ${observation?.id} id fetched`,
              );
              tx = response.block.transactions
                ?.filter((tx) => tx.id == observation?.sourceTxId)
                .at(0);
              this.logger.debug(
                `Content of cardano-ogmios fetched transaction by [${observation?.id}] id is: ${JsonBigInt.stringify(tx)}`,
              );
            }
          } finally {
            resolveDone();
          }
        },
      },
      { sequential: true },
    );

    await client.resume([intersect], 2);
    await done;
    await client.shutdown();
    this.logger.debug(`RawDataProvider cardano-ogmios client stopped`);
    return tx;
  };

  /**
   * fetch cardano-Ogmios transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<Transaction[]> }
   */
  protected fetchObservationTxs = async (observation: ObservationEntity) => {
    let tx;
    try {
      if (!this.firstHeight)
        this.firstHeight = (
          await this.action.fetchChainObservations(
            this.chain,
            0,
            this.extractor.getId(),
            1,
          )
        ).at(0)?.height;

      if (this.firstHeight && observation.height == this.firstHeight) {
        this.logger.warn(
          `No previous observation found for transaction ${observation.sourceTxId} at height ${observation.height}; this is the first stored record`,
        );
        return [];
      }

      const context: InteractionContext = await createInteractionContext(
        (err) =>
          this.logger.error(`creating of Interaction-Context failed: ${err}`),
        () => {},
        { connection: this.ogmiosConnectionInfo },
      );
      const intersect = await this.findIntersection(
        context,
        observation.height - 1,
      );
      if (intersect) {
        this.logger.debug(
          `Initializing of new client for cardano-ogmios start`,
        );
        tx = await this.fetchTx(context, intersect, observation);
      }
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }
    if (!tx)
      throw new Error(
        `Transaction [${observation.sourceTxId}] not found or invalid response from ${this.chain} chain.`,
      );
    return [tx];
  };
}
