import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import RateLimitedAxios, { Axios } from '@rosen-clients/rate-limited-axios';

import AbstractRunesProtocolNetwork from './abstractRunesProtocolNetwork';
import { TxOutputRune, UnisatResponse, UnisatTxRunes } from './types';

class UnisatRunesProtocolNetwork extends AbstractRunesProtocolNetwork {
  protected unisatClient: Axios;

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
        throw new Error(
          `Unexpected pagination: expected [${txRunes.total}] runes but got [${txRunes.detail.length}]`,
        );
      }

      if (height > txRunes.height) {
        throw new Error(
          `UnisatRunesProtocolNetwork is not synced. processing block height is [${height}] and synced height of network is [${txRunes.height}]`,
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

export default UnisatRunesProtocolNetwork;
