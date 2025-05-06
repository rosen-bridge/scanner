import {
  AbstractObservationExtractor,
  ExtractedObservation,
} from '@rosen-bridge/observation-extractor';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { blake2b } from 'blakejs';
import Axios, { AxiosHeaders } from 'axios';
import { OrdiscanRunesTransfer } from './types';

// TODO: move to configs
const ordiscanUrl = 'https://api.ordiscan.com';

// TODO: use the type from rosen-extractor updated package (need new release)
interface TokenTransformation {
  from: string;
  to: string;
  amount: string;
}

export abstract class RunesAbstractObservationExtractor<
  TransactionType
> extends AbstractObservationExtractor<TransactionType> {
  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * additionally, it returns false if the transaction is failed
   * @param block
   * @param txs
   */
  processTransactions = async (
    txs: Array<TransactionType>,
    block: Block
  ): Promise<boolean> => {
    const observations: Array<ExtractedObservation> = [];
    for (const transaction of txs) {
      const data = this.extractor.get(transaction);
      if (!data) continue;

      const txId = this.getTxId(transaction);

      // validate rune conditions and fill token info in data
      let runesTransformation: TokenTransformation | undefined;

      try {
        const txRunesTransfer = await this.getTxRunesTransfer(txId);

        for (const outRune of txRunesTransfer.outputs) {
          // TODO: check if its ok to remove line 51 since lock address gets checked in `RunesRpcRosenExtractor.ts` validateLock (but logic differs)

          // check if rune is transferred to the lock address
          // if (outRune.address !== rosenLockAddress) continue;

          // check if rune is supported by Rosen bridge
          const wrappedRune = this.tokens.search(this.FROM_CHAIN, {
            tokenId: outRune.rune,
          });

          if (
            wrappedRune.length > 0 &&
            Object.hasOwn(wrappedRune[0], data.toChain)
          ) {
            runesTransformation = {
              from: outRune.rune,
              to: this.tokens.getID(wrappedRune[0], data.toChain),
              amount: outRune.rune_amount,
            };
            break;
          }
        }
      } catch (e) {
        this.logger.debug(`Failed to get Runes data from tx [${txId}]: ${e}`);
        return false;
      }

      if (!runesTransformation) {
        this.logger.debug(`No supported Rune is locked`);
        return false;
      }

      const requestId = Buffer.from(
        blake2b(this.getTxId(transaction), undefined, 32)
      ).toString('hex');

      observations.push({
        fromChain: this.FROM_CHAIN,
        toChain: data.toChain,
        amount: runesTransformation.amount,
        sourceChainTokenId: runesTransformation.from,
        targetChainTokenId: runesTransformation.to,
        sourceTxId: data.sourceTxId,
        bridgeFee: data.bridgeFee,
        networkFee: data.networkFee,
        sourceBlockId: block.hash,
        requestId: requestId,
        toAddress: data.toAddress,
        fromAddress: data.fromAddress,
      });
    }
    return this.actions.storeObservations(observations, block, this.getId());
  };

  /**
   * returns the Runes transfer of a transaction according to Ordiscan
   * @param txId
   */
  getTxRunesTransfer = async (txId: string): Promise<OrdiscanRunesTransfer> => {
    const apiKey = '';
    const headers: AxiosHeaders = new AxiosHeaders();
    headers.setAuthorization(`Bearer ${apiKey}`);
    const res = await Axios.get(`${ordiscanUrl}/v1/tx/${txId}/runes`, {
      headers: headers,
    });
    return res.data;
  };
}
