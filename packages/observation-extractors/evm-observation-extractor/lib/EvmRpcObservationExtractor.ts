import { Transaction } from 'ethers';
import { AbstractObservationExtractor } from '@rosen-bridge/observation-extractor';
import { EvmRpcRosenExtractor } from '@rosen-bridge/rosen-extractor';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';

export class EthereumRpcObservationExtractor extends AbstractObservationExtractor<Transaction> {
  readonly FROM_CHAIN = 'ethereum';

  constructor(
    lockAddress: string,
    dataSource: DataSource,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(
      dataSource,
      tokens,
      new EvmRpcRosenExtractor(lockAddress, tokens, 'ethereum', 'eth', logger),
      logger
    );
  }

  /**
   * gets Id for current extractor
   */
  getId = () => 'ethereum-rpc-extractor';

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: Transaction) => {
    if (tx.hash == null) {
      throw Error(
        'ImpossibleBehaviour: Transactions comming from RPC have to be signed.'
      );
    }
    return tx.hash;
  };
}
