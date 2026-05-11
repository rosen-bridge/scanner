import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import RateLimitedAxios, { Axios } from '@rosen-clients/rate-limited-axios';

import { AbstractRunesProtocolNetwork } from './abstractRunesProtocolNetwork';
import {
  TxOutputRune,
  UnisatBoxDetail,
  UnisatResponse,
  UnisatTxRunes,
} from './types';

export class UnisatRunesProtocolNetwork extends AbstractRunesProtocolNetwork {
  protected unisatClient: Axios;
  protected readonly PAGE_SIZE = 500;

  constructor(
    protected readonly unisatUrl: string,
    protected readonly unisatApiKey: string,
    logger?: AbstractLogger,
  ) {
    super(logger);

    // init Unisat client
    const unisatHeaders = { 'Content-Type': 'application/json' };
    // Add API key to headers if provided
    if (unisatApiKey) {
      Object.assign(unisatHeaders, { Authorization: `Bearer ${unisatApiKey}` });
    }

    this.unisatClient = RateLimitedAxios.create({
      baseURL: unisatUrl,
      headers: unisatHeaders,
    });
  }

  /**
   * returns the Runes transfer of a transaction
   * @param txId
   * @param height
   */
  getTxOutputRunes = async (
    txId: string,
    height: number,
  ): Promise<TxOutputRune[]> => {
    // Transform the RPC transaction to the expected BitcoinRunesTx format
    const runes: TxOutputRune[] = [];

    // get the runes transfers of the transaction from Unisat
    let txRunes: UnisatBoxDetail[] = [];
    try {
      let offset = 0;
      let response = await this.unisatClient.get<UnisatResponse<UnisatTxRunes>>(
        `/v1/indexer/runes/event?txid=${txId}&start=${offset}&limit=${this.PAGE_SIZE}`,
      );
      this.logger.debug(
        `requested 'indexer/runes/event' filtering txId [${txId}] on offset|limit [${offset}|${this.PAGE_SIZE}]. Response: ${JsonBigInt.stringify(
          response.data,
        )}`,
      );
      const total = response.data.data.total;
      while (true) {
        const runes = response.data.data;
        if (height > runes.height) {
          throw new Error(
            `UnisatRunesProtocolNetwork is not synced. processing block height is [${height}] and synced height of network is [${runes.height}]`,
          );
        }
        if (runes.detail.length === 0) break;
        txRunes.push(...response.data.data.detail);
        offset += this.PAGE_SIZE;
        if (offset > total) break;
        response = await this.unisatClient.get<UnisatResponse<UnisatTxRunes>>(
          `/v1/indexer/runes/event?txid=${txId}&start=${offset}&limit=${this.PAGE_SIZE}`,
        );
        this.logger.debug(
          `requested 'indexer/runes/event' filtering txId [${txId}] on offset|limit [${offset}|${this.PAGE_SIZE}]. Response: ${JsonBigInt.stringify(
            response.data,
          )}`,
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

    for (const transfer of txRunes) {
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
