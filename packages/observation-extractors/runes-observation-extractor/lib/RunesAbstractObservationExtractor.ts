import {
  AbstractObservationExtractor,
  ExtractedObservation,
} from '@rosen-bridge/abstract-observation-extractor';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { blake2b } from 'blakejs';
import Axios, { AxiosHeaders } from 'axios';
import { OrdiscanRunesTransfer } from './types';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import {
  AbstractRosenDataExtractor,
  TokenTransformation,
} from '@rosen-bridge/rosen-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

export abstract class RunesAbstractObservationExtractor<
  TransactionType
> extends AbstractObservationExtractor<TransactionType> {
  readonly FROM_CHAIN = 'bitcoin-runes';

  constructor(
    protected readonly lockAddress: string,
    protected readonly ordiscanUrl: string,
    protected readonly ordiscanApiKey: string,
    dataSource: DataSource,
    tokens: TokenMap,
    extractor: AbstractRosenDataExtractor<TransactionType>,
    logger?: AbstractLogger
  ) {
    super(dataSource, tokens, extractor, logger);
    this.lockAddress = lockAddress;
    this.ordiscanUrl = ordiscanUrl;
    this.ordiscanApiKey = ordiscanApiKey;
  }

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   * transactions and in case of success return true and in case of failure returns false
   * additionally, if it fails due to unexpected reasons such as network issues, it re-throws the error
   * @param txs
   * @param block
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
          // check if rune is transferred to the lock address
          if (outRune.address !== this.lockAddress) continue;

          // check if rune is supported by Rosen bridge
          const wrappedRune = this.tokens.search(this.FROM_CHAIN, {
            tokenId: outRune.rune,
          });

          if (
            wrappedRune.length > 0 &&
            Object.hasOwn(wrappedRune[0], data.toChain)
          ) {
            const wrappedAmount = this.tokens
              .wrapAmount(
                outRune.rune,
                BigInt(outRune.rune_amount),
                this.FROM_CHAIN
              )
              .amount.toString();
            runesTransformation = {
              from: outRune.rune,
              to: this.tokens.getID(wrappedRune[0], data.toChain),
              amount: wrappedAmount,
            };

            break;
          }
        }
      } catch (e) {
        this.logger.debug(`Failed to get Runes data from tx [${txId}]: ${e}`);
        throw e;
      }

      if (!runesTransformation) {
        this.logger.debug(`No supported Runes is locked`);
        continue;
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
  protected getTxRunesTransfer = async (
    txId: string
  ): Promise<OrdiscanRunesTransfer> => {
    const headers: AxiosHeaders = new AxiosHeaders();
    headers.setAuthorization(`Bearer ${this.ordiscanApiKey}`);
    const res = await Axios.get(`${this.ordiscanUrl}/v1/tx/${txId}/runes`, {
      headers: headers,
    });
    return res.data;
  };
}
