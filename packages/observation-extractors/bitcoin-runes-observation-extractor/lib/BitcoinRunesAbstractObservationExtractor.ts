import {
  AbstractObservationExtractor,
  ExtractedObservation,
} from '@rosen-bridge/abstract-observation-extractor';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { blake2b } from 'blakejs';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import {
  AbstractRosenDataExtractor,
  TokenTransformation,
} from '@rosen-bridge/rosen-extractor';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import RateLimitedAxios, { Axios } from '@rosen-clients/rate-limited-axios';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TxOutputRune, UnisatResponse, UnisatTxRunes } from './types';

export abstract class BitcoinRunesAbstractObservationExtractor<
  TransactionType,
> extends AbstractObservationExtractor<TransactionType> {
  readonly FROM_CHAIN = 'bitcoin-runes';
  protected unisatClient: Axios;

  constructor(
    protected readonly lockAddress: string,
    protected readonly unisatUrl: string,
    protected readonly unisatApiKey: string,
    dataSource: DataSource,
    tokens: TokenMap,
    extractor: AbstractRosenDataExtractor<TransactionType>,
    logger?: AbstractLogger,
  ) {
    super(dataSource, tokens, extractor, logger);

    // init Unisat client
    const unisatHeaders = { 'Content-Type': 'application/json' };
    // Add API key to headers if provided
    if (unisatApiKey) {
      Object.assign(unisatHeaders, { 'x-api-key': unisatApiKey });
    }
    this.unisatClient = RateLimitedAxios.create({
      baseURL: unisatUrl,
      headers: unisatHeaders,
    });
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
    block: Block,
  ): Promise<boolean> => {
    const observations: Array<ExtractedObservation> = [];
    for (const transaction of txs) {
      const data = this.extractor.get(transaction);

      if (!data) continue;

      const txId = this.getTxId(transaction);

      // validate rune conditions and fill token info in data
      let runesTransformation: TokenTransformation | undefined;

      try {
        const txOutputRunes = await this.getTxOutputRunes(txId);
        for (const outRune of txOutputRunes) {
          // check if rune is transferred to the lock address
          if (outRune.address !== this.lockAddress) continue;

          // check if rune is supported by Rosen bridge
          const wrappedRune = this.tokens.search(this.FROM_CHAIN, {
            tokenId: outRune.runeId,
          });

          if (
            wrappedRune.length > 0 &&
            Object.hasOwn(wrappedRune[0], data.toChain)
          ) {
            const wrappedAmount = this.tokens
              .wrapAmount(
                outRune.runeId,
                BigInt(outRune.runeAmount),
                this.FROM_CHAIN,
              )
              .amount.toString();
            runesTransformation = {
              from: outRune.runeId,
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
        blake2b(this.getTxId(transaction), undefined, 32),
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
   * returns the Runes transfer of a transaction according to unisat
   * @param txId
   */
  protected getTxOutputRunes = async (
    txId: string,
  ): Promise<TxOutputRune[]> => {
    // Transform the RPC transaction to the expected BitcoinRunesTx format
    const runes: TxOutputRune[] = [];

    // get the runes transfers of the transaction from Unisat
    let txRunes: UnisatTxRunes;
    try {
      const response = await this.unisatClient.get<
        UnisatResponse<UnisatTxRunes>
      >(`/v1/indexer/runes/event?txid=${txId}`);
      this.logger.debug(
        `requested 'indexer/runes/event' filtering txId [${txId}]. Response: ${JsonBigInt.stringify(
          response.data,
        )}`,
      );

      txRunes = response.data.data;
      if (txRunes.detail.length !== txRunes.total) {
        throw Error(
          `Unexpected pagination: expected [${txRunes.total}] runes but got [${txRunes.detail.length}]`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const baseError = `Failed to get runes event for tx [${txId}] from Unisat: `;
      if (e.response) {
        throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(baseError + e.message);
    }

    for (const transfer of txRunes.detail) {
      if (transfer.txid !== txId) {
        throw new Error(
          `ImpossibleBehavior: Fetched runes event for tx [${txId}] but got a transfer with txId [${transfer.txid}]`,
        );
      }
      if (transfer.type === 'send') continue;
      runes.push({
        address: transfer.address,
        runeId: transfer.runeId,
        runeAmount: transfer.amount,
        vout: transfer.vout,
      });
    }

    return runes;
  };
}
