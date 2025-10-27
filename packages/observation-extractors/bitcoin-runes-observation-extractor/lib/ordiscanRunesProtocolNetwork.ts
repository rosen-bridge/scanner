import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import RateLimitedAxios, { Axios } from '@rosen-clients/rate-limited-axios';

import AbstractRunesProtocolNetwork from './abstractRunesProtocolNetwork';
import {
  TxOutputRune,
  OrdiscanResponse,
  OrdiscanRunesTxOutputUtxo,
  OrdiscanRunesData,
  OrdiscanRuneInfo,
} from './types';

class OrdiscanRunesProtocolNetwork extends AbstractRunesProtocolNetwork {
  protected ordiscanClient: Axios;

  constructor(
    protected readonly ordiscanUrl: string,
    protected readonly ordiscanApiKey: string,
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
   * returns the info of the rune
   * @param rune
   */
  getRuneInfo = async (rune: string): Promise<OrdiscanRuneInfo> => {
    try {
      const response = await this.ordiscanClient.get<
        OrdiscanResponse<OrdiscanRuneInfo>
      >(`/v1/rune/${rune}`);
      this.logger.debug(
        `requested '/v1/rune/[${rune}]'. Response: ${JsonBigInt.stringify(
          response.data,
        )}`,
      );

      return response.data.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const baseError = `Failed to get rune info of [${rune}] from Ordiscan: `;
      if (e.response) {
        throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(baseError + e.message);
    }
  };

  /**
   * returns the Runes transfer of a transaction
   * @param txId
   */
  getTxOutputRunes = async (
    txId: string,
  ): Promise<{ runes: TxOutputRune[]; height: number }> => {
    // get the runes transfers of the transaction from Ordiscan
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

    const runeNameToIdMap: Map<string, string> = new Map(
      txRunes.map((utxo) => [utxo.rune, '']),
    );

    const runeInfos = await Promise.all(
      runeNameToIdMap.keys().map((rune) => this.getRuneInfo(rune)),
    );

    for (const runeInfo of runeInfos) {
      runeNameToIdMap.set(runeInfo.name, runeInfo.id);
    }

    const runes = txRunes.map(
      (utxo) =>
        ({
          address: utxo.address,
          runeId: runeNameToIdMap.get(utxo.rune)!,
          runeAmount: utxo.rune_amount,
          vout: utxo.vout,
        }) as TxOutputRune,
    );

    return { runes, height: 0 };
  };
}

export default OrdiscanRunesProtocolNetwork;
