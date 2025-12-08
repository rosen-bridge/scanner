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
  protected getBoxesByAddress = async (address: string): Promise<ErgoBox[]> => {
    const rawBoxes = (
      await this.api.v1.getApiV1BoxesUnspentByaddressP1(address)
    ).items;
    if (rawBoxes) {
      return rawBoxes.map((box) => ({
        boxId: box.boxId,
        value: BigInt(box.value),
        ergoTree: box.ergoTree,
        creationHeight: box.creationHeight,
        blockId: box.blockId,
        assets: (box.assets || []).map((asset) => ({
          tokenId: asset.tokenId,
          amount: BigInt(asset.amount),
        })),
        additionalRegisters: Object.fromEntries(
          Object.entries(box.additionalRegisters || {}).map(([k, v]) => [
            k,
            v.serializedValue,
          ]),
        ) as AdditionalRegisters,
        transactionId: box.transactionId,
        index: box.index,
      }));
    }
    return [];
  };

  /**
   * Fetches all unconfirmed transactions currently in the mempool.
   *
   */
  getMempoolTxs = async (): Promise<Transaction[]> => {
    const allTxs: Transaction[] = [];
    let offset = 0;
    const limit = 100;
    while (true) {
      const response = await this.api.v0.getApiV0TransactionsUnconfirmed({
        limit,
        offset,
      });
      const rawTxs = response.items ?? [];

      if (rawTxs.length === 0) break;

      allTxs.push(
        ...rawTxs.map((tx) => ({
          id: tx.id,
          inputs: tx.inputs?.map((inputBox) => ({ boxId: inputBox.id })) ?? [],
          dataInputs:
            tx.dataInputs?.map((dataInputBox) => ({
              boxId: dataInputBox.id,
            })) ?? [],
          outputs:
            tx.outputs?.map<OutputBox>((outputBox) => ({
              boxId: outputBox.id,
              value: BigInt(outputBox.value),
              ergoTree: outputBox.ergoTree,
              creationHeight: outputBox.creationHeight,
              assets: (outputBox.assets || []).map((asset) => ({
                tokenId: asset.tokenId,
                amount: BigInt(asset.amount),
              })),
              additionalRegisters: Object.fromEntries(
                Object.entries(outputBox.additionalRegisters || {}).map(
                  ([k, v]) => [k, v],
                ),
              ) as AdditionalRegisters,
              transactionId: outputBox.txId,
              index: outputBox.index,
            })) ?? [],
        })),
      );

      offset += rawTxs.length;
    }

    return allTxs;
  };
}
