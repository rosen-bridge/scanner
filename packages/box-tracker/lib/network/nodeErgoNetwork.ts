import {
  AdditionalRegisters,
  OutputBox,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

import { ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from './abstract/abstractErgoNetwork';

export class NodeErgoNetwork extends AbstractErgoNetwork {
  private api;

  /**
   * Creates an instance of NodeErgoNetwork.
   *
   * @param  address - The Ergo address to operate on.
   * @param  tokens[] - A list of tokens to track.
   * @param url - The base URL of the Ergo node.
   */
  constructor(address: string, tokens: Token[] = [], url: string) {
    super(address, tokens);
    this.api = ergoNodeClientFactory(url);
  }

  /**
   * Retrieves all unspent boxes associated with a given Ergo address.
   *
   */
  protected async getBoxesByAddress(address: string): Promise<ErgoBox[]> {
    const rawBoxes = await this.api.getBoxesByAddressUnspent(address);
    if (!rawBoxes) return [];

    return Promise.all(
      rawBoxes.map(async (b) => ({
        boxId: b.boxId ?? '',
        value: BigInt(b.value),
        ergoTree: b.ergoTree,
        blockId: await this.getBlockByHeight(b.creationHeight),
        creationHeight: b.creationHeight,
        assets: (b.assets || []).map((a) => ({
          tokenId: a.tokenId,
          amount: BigInt(a.amount),
        })),
        additionalRegisters: Object.fromEntries(
          Object.entries(b.additionalRegisters || {}).map(([k, v]) => [k, v]),
        ) as AdditionalRegisters,
        transactionId: b.transactionId ?? '',
        index: b.index ?? 0,
      })),
    );
  }

  /**
   * Retrieves blockId of a block by height.
   *
   */
  async getBlockByHeight(height: number): Promise<string> {
    const blocks = await this.api.getFullBlockAt(height);
    return blocks[0];
  }
  /**
   * Fetches all unconfirmed transactions currently in the mempool.
   *
   */
  async getMempoolTxs(): Promise<Transaction[]> {
    const allTxs: Transaction[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const rawTxs = await this.api.getUnconfirmedTransactions({
        limit,
        offset,
      });

      if (rawTxs.length === 0) break;

      allTxs.push(
        ...rawTxs.map((t) => ({
          id: t.id,
          inputs: t.inputs.map((i) => ({ boxId: i.boxId })),
          dataInputs: t.dataInputs?.map((d) => ({ boxId: d.boxId })) ?? [],
          outputs: t.outputs.map<OutputBox>((o) => ({
            boxId: o.boxId!,
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
            transactionId: o.transactionId ?? t.id,
            index: o.index!,
          })),
        })),
      );

      offset += rawTxs.length;
    }

    return allTxs;
  }
}
