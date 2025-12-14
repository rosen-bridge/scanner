import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { DogeRpcObservationExtractor } from '@rosen-bridge/bitcoin-observation-extractor';
import { DogeRpcTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import axios from '@rosen-clients/rate-limited-axios';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';
import { RpcConnectionInfoInterface } from '../../types';

export class DogeRpcRawDataProvider extends AbstractRawDataProvider<DogeRpcTransaction> {
  protected client;

  constructor(
    protected dataSource: DataSource,
    protected extractor: DogeRpcObservationExtractor,
    rpcConnectionInfo: RpcConnectionInfoInterface,
    protected logger: AbstractLogger,
  ) {
    super('doge', dataSource, extractor, logger);
    const auth =
      rpcConnectionInfo.username && rpcConnectionInfo.password
        ? {
            username: rpcConnectionInfo.username,
            password: rpcConnectionInfo.password,
          }
        : undefined;
    this.client = axios.create({
      baseURL: rpcConnectionInfo.url,
      timeout: rpcConnectionInfo.timeout,
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
    });
  }

  /**
   * fetch doge transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<Transaction[]> }
   */
  protected fetchObservationTxs = async (observation: ObservationEntity) => {
    let tx;
    try {
      tx = await this.client.post('', {
        method: 'getrawtransaction',
        id: 0,
        params: [observation.sourceTxId, true],
      });
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }
    if (!tx?.data?.result)
      throw new Error(
        `Transaction [${observation.sourceTxId}] not found or invalid response from ${this.chain} chain.`,
      );
    return [tx.data.result];
  };
}
