import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap } from '@rosen-bridge/tokens';
import RateLimitedAxios, { Axios } from '@rosen-clients/rate-limited-axios';

import AbstractRunesProtocolNetwork from './abstractRunesProtocolNetwork';
import {
  TxOutputRune,
  OrdiscanResponse,
  OrdiscanRunesTxOutputUtxo,
  OrdiscanRunesData,
} from './types';

class OrdiscanRunesProtocolNetwork extends AbstractRunesProtocolNetwork {
  protected ordiscanClient: Axios;

  constructor(
    protected readonly ordiscanUrl: string,
    protected readonly ordiscanApiKey: string,
    protected readonly tokenMap: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(logger);

    // init Ordiscan client
    const ordiscanHeaders = { 'Content-Type': 'application/json' };
    // Add API key to headers if provided
    if (ordiscanApiKey) {
      Object.assign(ordiscanHeaders, {
        Authorization: `Bearer ${ordiscanApiKey}`,
      });
    }

    this.ordiscanClient = RateLimitedAxios.create({
      baseURL: ordiscanUrl,
      headers: ordiscanHeaders,
    });
  }

  /**
   * returns the Runes transfer of a transaction
   * @param txId
   */
  getTxOutputRunes = async (txId: string): Promise<TxOutputRune[]> => {
    let txRunes: OrdiscanRunesTxOutputUtxo[];
    try {
      const response = await this.ordiscanClient.get<
        OrdiscanResponse<OrdiscanRunesData>
      >(`/v1/tx/${txId}/runes`);
      this.logger.debug(
        `requested '/v1/tx/[${txId}]/runes'. Response: ${JsonBigInt.stringify(
          response.data,
        )}`,
      );

      txRunes = response.data.data.outputs;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const baseError = `Failed to get runes for tx [${txId}] from Ordiscan: `;
      if (e.response) {
        throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(baseError + e.message);
    }

    return txRunes.map((utxo) => {
      const wrappedRune = this.tokenMap.search('bitcoin-runes', {
        extra: { uniqueName: utxo.rune },
      });
      if (wrappedRune.length === 0) {
        throw new Error(
          `Failed to find token with uniqueName [${utxo.rune}] in token-map`,
        );
      }
      return {
        address: utxo.address,
        runeId: wrappedRune[0]['bitcoin-runes'].tokenId,
        runeAmount: utxo.rune_amount,
        vout: utxo.vout,
      } as TxOutputRune;
    });
  };
}

export default OrdiscanRunesProtocolNetwork;
