import { JsonRpcProvider, TransactionResponse } from 'ethers';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import {
  BinanceRpcObservationExtractor,
  EthereumRpcObservationExtractor,
} from '@rosen-bridge/evm-observation-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import axios from '@rosen-clients/rate-limited-axios';

import { AbstractRawDataProvider } from '../../abstractRawDataProvider';
import { ConnectionByAuthInfoInterface } from '../../types';

export class EvmRawDataProvider extends AbstractRawDataProvider<TransactionResponse> {
  protected client: JsonRpcProvider;
  protected chain: 'ethereum' | 'binance';

  constructor(
    protected dataSource: DataSource,
    protected extractor:
      | EthereumRpcObservationExtractor
      | BinanceRpcObservationExtractor,
    evmConnectionInfo: ConnectionByAuthInfoInterface,
    protected logger: AbstractLogger,
  ) {
    const chain =
      extractor instanceof EthereumRpcObservationExtractor
        ? 'ethereum'
        : 'binance';
    super(chain, dataSource, extractor, logger);
    this.chain = chain;
    let url = evmConnectionInfo.url;
    if (evmConnectionInfo.authToken)
      url = axios.getUri({
        baseURL: evmConnectionInfo.url,
        url: evmConnectionInfo.authToken,
      });
    this.client = new JsonRpcProvider(url, undefined);
  }

  /**
   * fetch evm transactions related to the input observation parameter
   *
   * @param observation
   * @returns { Promise<TransactionResponse[]> }
   */
  protected fetchObservationTxs = async (
    observation: ObservationEntity,
  ): Promise<TransactionResponse[] | undefined> => {
    try {
      const txs = (await this.client.getBlock(observation.height, true))
        ?.prefetchedTransactions;
      if (txs) return txs;
    } catch (err) {
      throw new Error(
        `Fetch transactions by [${observation.sourceTxId}] id of related observation for [${this.chain}] chain failed: ${err}`,
      );
    }
  };
}
