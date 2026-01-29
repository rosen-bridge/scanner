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
  protected getBoxesByAddress = async (address: string): Promise<ErgoBox[]> => {
    const rawBoxes = await this.api.getBoxesByAddressUnspent(address);
    if (!rawBoxes) return [];

    return Promise.all(
      rawBoxes.map(async (box) => ({
        boxId: box.boxId ?? '',
        value: BigInt(box.value),
        ergoTree: box.ergoTree,
        blockId: await this.getBlockByHeight(box.creationHeight),
        creationHeight: box.creationHeight,
        assets: (box.assets || []).map((asset) => ({
          tokenId: asset.tokenId,
          amount: BigInt(asset.amount),
        })),
        additionalRegisters: Object.fromEntries(
          Object.entries(box.additionalRegisters || {}).map(([k, v]) => [k, v]),
        ) as AdditionalRegisters,
        transactionId: box.transactionId ?? '',
        index: box.index ?? 0,
      })),
    );
  };

  /**
   * Retrieves blockId of a block by height.
   *
   */
  getBlockByHeight = async (height: number): Promise<string> => {
    const blocks = await this.api.getFullBlockAt(height);
    return blocks[0];
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
      const rawTxs = await this.api.getUnconfirmedTransactions({
        limit,
        offset,
      });

      if (rawTxs.length === 0) break;

      allTxs.push(
        ...rawTxs.map((tx) => ({
          id: tx.id,
          inputs: tx.inputs.map((inputBox) => ({
            boxId: inputBox.boxId,
            spendingProof: inputBox.spendingProof.proofBytes,
          })),
          dataInputs:
            tx.dataInputs?.map((dataInputBox) => ({
              boxId: dataInputBox.boxId,
            })) ?? [],
          outputs: tx.outputs.map<OutputBox>((outputBox) => ({
            boxId: outputBox.boxId!,
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
            transactionId: outputBox.transactionId ?? tx.id,
            index: outputBox.index!,
          })),
        })),
      );

      offset += rawTxs.length;
      if (rawTxs.length < limit) break;
    }

    return allTxs;
  };
}
