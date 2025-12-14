import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { ErgoObservationExtractor } from '@rosen-bridge/ergo-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { Transaction } from '@rosen-bridge/scanner-interfaces';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';

export class ErgoNodeRawDataProvider extends AbstractRawDataProvider<Transaction> {
  protected client;

  constructor(
    protected dataSource: DataSource,
    protected extractor: ErgoObservationExtractor,
    nodeUrl: string,
    protected logger: AbstractLogger,
  ) {
    super('ergo', dataSource, extractor, logger);
    this.client = ergoNodeClientFactory(nodeUrl);
  }

  /**
   * fetch ergo transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<Transaction[]> }
   */
  protected fetchObservationTxs = async (observation: ObservationEntity) => {
    let tx;
    try {
      tx = await this.client.getTxById(observation.sourceTxId);
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }

    if (!tx)
      throw new Error(
        `Transaction [${observation.sourceTxId}] not found or invalid response from ${this.chain} chain.`,
      );

    return [
      {
        id: tx.id,
        dataInputs: tx.dataInputs ?? [],
        inputs: (tx.inputs ?? []).map((ib) => ({ ...ib, boxId: ib.boxId! })),
        outputs: tx.outputs.map((ob) => ({
          ...ob,
          transactionId: ob.transactionId!,
          index: ob.index!,
          boxId: ob.boxId!,
          assets: ob.assets ?? [],
        })),
      },
    ];
  };
}
