import { Ordiscan } from 'ordiscan';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap } from '@rosen-bridge/tokens';

import AbstractRunesProtocolNetwork from './abstractRunesProtocolNetwork';
import { BITCOIN_RUNES_CHAIN } from './constants';
import { TxOutputRune, OrdiscanRunesTxOutputUtxo } from './types';

class OrdiscanRunesProtocolNetwork extends AbstractRunesProtocolNetwork {
  protected ordiscanClient: Ordiscan;

  constructor(
    protected readonly ordiscanApiKey: string,
    protected readonly tokenMap: TokenMap,
    logger?: AbstractLogger,
  ) {
    super(logger);

    this.ordiscanClient = new Ordiscan(ordiscanApiKey);
  }

  /**
   * returns the Runes transfer of a transaction
   * @param txId
   */
  getTxOutputRunes = async (txId: string): Promise<TxOutputRune[]> => {
    let txRunes: OrdiscanRunesTxOutputUtxo[];
    try {
      const response = await this.ordiscanClient.tx.getRunes({ txid: txId });
      this.logger.debug(
        `requested getRunes with txId [${txId}]. Response: ${JsonBigInt.stringify(
          response,
        )}`,
      );

      txRunes = response.outputs;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const baseError = `Failed to get runes for tx [${txId}] from Ordiscan: `;
      if (e.response) {
        throw new Error(baseError + `${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(baseError + e.message);
    }

    return txRunes
      .map((utxo) => {
        const wrappedRune = this.tokenMap.search(BITCOIN_RUNES_CHAIN, {
          extra: { uniqueName: utxo.rune },
        });
        if (wrappedRune.length === 0) {
          this.logger.debug(
            `Failed to find runes with uniqueName [${utxo.rune}] in token-map`,
          );
          return;
        }
        return {
          address: utxo.address,
          runeId: wrappedRune[0][BITCOIN_RUNES_CHAIN].tokenId,
          runeAmount: utxo.rune_amount,
          vout: utxo.vout,
        } as TxOutputRune;
      })
      .filter((utxo) => !!utxo);
  };
}

export default OrdiscanRunesProtocolNetwork;
