import {
  AbstractObservationExtractor,
  ExtractedObservation,
} from '@rosen-bridge/observation-extractor';
import { isCallException, TransactionResponse } from 'ethers';
import { blake2b } from 'blakejs';
import { Block } from '@rosen-bridge/abstract-extractor';

export abstract class EvmRpcObservationExtractor extends AbstractObservationExtractor<TransactionResponse> {
  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * additionally, it returns false if the transaction is failed
   * @param block
   * @param txs
   */
  processTransactions = async (
    txs: Array<TransactionResponse>,
    block: Block
  ): Promise<boolean> => {
    const observations: Array<ExtractedObservation> = [];
    for (const transaction of txs) {
      const data = this.extractor.get(transaction);
      if (data) {
        try {
          const result = await transaction.wait(0);
          if (result) {
            const requestId = Buffer.from(
              blake2b(this.getTxId(transaction), undefined, 32)
            ).toString('hex');
            observations.push({
              fromChain: this.FROM_CHAIN,
              toChain: data.toChain,
              amount: data.amount,
              sourceChainTokenId: data.sourceChainTokenId,
              targetChainTokenId: data.targetChainTokenId,
              sourceTxId: data.sourceTxId,
              bridgeFee: data.bridgeFee,
              networkFee: data.networkFee,
              sourceBlockId: block.hash,
              requestId: requestId,
              toAddress: data.toAddress,
              fromAddress: data.fromAddress,
            });
          } else
            throw Error(
              `Impossible behavior: Evm Tx [${transaction.hash}] is included in block [${block.hash}] but waiting resulted in null or undefined`
            );
        } catch (e) {
          if (isCallException(e))
            this.logger.debug(
              `found valid lock transaction [${transaction.hash}] but tx is failed`
            );
          else throw e;
        }
      }
    }
    return this.actions.storeObservations(observations, block, this.getId());
  };

  /**
   * gets transaction id from TransactionType
   */
  getTxId = (tx: TransactionResponse) => {
    if (tx.hash == null) {
      throw Error(
        'ImpossibleBehavior: Transactions coming from RPC have to be signed.'
      );
    }
    return tx.hash;
  };
}
