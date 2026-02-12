import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BitcoinRpcObservationExtractor } from '@rosen-bridge/bitcoin-observation-extractor';
import { BitcoinRunesRpcObservationExtractor } from '@rosen-bridge/bitcoin-runes-observation-extractor';
import { BitcoinRpcTransaction } from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import axios from '@rosen-clients/rate-limited-axios';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';
import { RpcConnectionInfoInterface } from '../../types';

export class BitcoinRpcRawDataProvider extends AbstractRawDataProvider<BitcoinRpcTransaction> {
  protected client;

  constructor(
    protected dataSource: DataSource,
    protected extractor:
      | BitcoinRpcObservationExtractor
      | BitcoinRunesRpcObservationExtractor,
    rpcConnectionInfo: RpcConnectionInfoInterface,
    protected logger: AbstractLogger,
  ) {
    const chain =
      extractor instanceof BitcoinRunesRpcObservationExtractor
        ? 'bitcoin-runes'
        : 'bitcoin';
    super(chain, dataSource, extractor, logger);
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
   * fetch bitcoin transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<BitcoinRpcTransaction[]> }
   */
  protected fetchObservationTxs = async (
    observation: ObservationEntity,
  ): Promise<BitcoinRpcTransaction[]> => {
    try {
      return (
        await this.client.post('', {
          method: 'getrawtransaction',
          id: 0,
          params: [observation.sourceTxId, true],
        })
      ).data?.result;
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }
  };
}
