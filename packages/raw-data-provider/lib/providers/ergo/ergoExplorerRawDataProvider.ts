import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { ErgoObservationExtractor } from '@rosen-bridge/ergo-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { Transaction } from '@rosen-bridge/scanner-interfaces';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';

export class ErgoExplorerRawDataProvider extends AbstractRawDataProvider<Transaction> {
  protected client;

  constructor(
    protected dataSource: DataSource,
    protected extractor: ErgoObservationExtractor,
    explorerUrl: string,
    protected logger: AbstractLogger,
  ) {
    super('ergo', dataSource, extractor, logger);
    this.client = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * fetch ergo transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<Transaction[]> }
   */
  protected fetchObservationTxs = async (
    observation: ObservationEntity,
  ): Promise<Transaction[]> => {
    try {
      const tx = await this.client.v1.getApiV1TransactionsP1(
        observation.sourceTxId,
      );
      return [
        {
          id: tx.id,
          dataInputs: tx.dataInputs ?? [],
          inputs: tx.inputs ?? [],
          outputs: tx.outputs!.map((ob) => ({
            ...ob,
            assets: ob.assets ?? [],
            additionalRegisters: Object.fromEntries(
              Object.entries(ob.additionalRegisters).map((nr) => {
                return [nr[0], nr[1].serializedValue];
              }),
            ),
          })),
        },
      ];
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }
  };
}
