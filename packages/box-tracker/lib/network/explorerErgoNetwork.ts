import {
  AdditionalRegisters,
  OutputBox,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from './abstract/abstractErgoNetwork';

export class ExplorerErgoNetwork extends AbstractErgoNetwork {
  private api;

  /**
   * Creates an instance of ExplorerErgoNetwork.
   *
   * @param address - The Ergo address to operate on.
   * @param tokens[] - A list of tokens to track.
   * @param url - The base URL of the Ergo Explorer API.
   */
  constructor(address: string, tokens: Token[] = [], url: string) {
    super(address, tokens);
    this.api = ergoExplorerClientFactory(url);
  }

  /**
   * Retrieves all unspent boxes associated with a given Ergo address
   * by querying the Ergo Explorer API.
   *
   */
  protected async getBoxesByAddress(address: string): Promise<ErgoBox[]> {
    const rawBoxes = (
      await this.api.v1.getApiV1BoxesUnspentByaddressP1(address)
    ).items;
    if (rawBoxes) {
      return rawBoxes.map((b) => ({
        boxId: b.boxId,
        value: BigInt(b.value),
        ergoTree: b.ergoTree,
        creationHeight: b.creationHeight,
        blockId: b.blockId,
        assets: (b.assets || []).map((a) => ({
          tokenId: a.tokenId,
          amount: BigInt(a.amount),
        })),
        additionalRegisters: Object.fromEntries(
          Object.entries(b.additionalRegisters || {}).map(([k, v]) => [
            k,
            v.serializedValue,
          ]),
        ) as AdditionalRegisters,
        transactionId: b.transactionId,
        index: b.index,
      }));
    }
    return [];
  }
  /**
   * Fetches all unconfirmed transactions currently in the mempool.
   *
   */
  async getMempoolTxs(): Promise<Transaction[]> {
    const rawTxs = (await this.api.v0.getApiV0TransactionsUnconfirmed()).items;
    if (rawTxs) {
      return rawTxs.map((t) => ({
        id: t.id,
        inputs: t.inputs?.map((e) => ({ boxId: e.id })) ?? [],
        dataInputs: t.dataInputs?.map((e) => ({ boxId: e.id })) ?? [],
        outputs:
          t.outputs?.map<OutputBox>((o) => ({
            boxId: o.id,
            value: BigInt(o.value),
            ergoTree: o.ergoTree,
            creationHeight: o.creationHeight,
            assets: (o.assets || []).map((a) => ({
              tokenId: a.tokenId,
              amount: BigInt(a.amount),
            })),
            additionalRegisters: Object.fromEntries(
              Object.entries(o.additionalRegisters || {}).map(([k, v]) => [
                k,
                v,
              ]),
            ) as AdditionalRegisters,
            transactionId: o.txId,
            index: o.index,
          })) ?? [],
      }));
    }
    return [];
  }
}
