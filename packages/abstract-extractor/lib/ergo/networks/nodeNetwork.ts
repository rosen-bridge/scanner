import { InputBox, OutputBox } from '@rosen-bridge/scanner-interfaces';
import ergoNodeClientFactory, {
  IndexedErgoBox,
  IndexedErgoTransaction,
} from '@rosen-clients/ergo-node';

import { ExtendedTransaction } from '../interfaces';

export class NodeNetwork {
  private api;

  constructor(url: string) {
    this.api = ergoNodeClientFactory(url);
  }

  /**
   * convert node api input boxes to OutputBox interface
   * @param box
   * @returns ErgoBox
   */
  private convertInputBox = (box: IndexedErgoBox): OutputBox & InputBox => {
    return {
      transactionId: box.transactionId || '',
      index: box.index || 0,
      value: box.value || 0n,
      ergoTree: box.ergoTree || '',
      creationHeight: box.creationHeight || 0,
      assets: box.assets || [],
      additionalRegisters: box.additionalRegisters,
      boxId: box.boxId || '',
      extension: box.spendingProof?.extension,
      spendingProof: box.spendingProof?.proofBytes,
    };
  };

  /**
   * convert node api output boxes to OutputBox interface
   * @param box
   * @returns ErgoBox
   */
  private convertOutputBox = (box: IndexedErgoBox): OutputBox => {
    return {
      transactionId: box.transactionId || '',
      index: box.index || 0,
      value: box.value || 0n,
      ergoTree: box.ergoTree || '',
      creationHeight: box.creationHeight || 0,
      assets: box.assets || [],
      additionalRegisters: box.additionalRegisters,
      boxId: box.boxId || '',
    };
  };

  /**
   * convert Node transaction to extractor transaction type
   * @param tx
   */
  private convertTransaction = (
    tx: IndexedErgoTransaction,
  ): ExtendedTransaction => {
    return {
      id: tx.id || '',
      inclusionHeight: tx.inclusionHeight,
      blockId: tx.blockId,
      outputs: tx.outputs.map((output) => this.convertOutputBox(output)),
      inputs: tx.inputs.map((input) => this.convertInputBox(input)),
      dataInputs: tx.dataInputs,
    };
  };

  /**
   * use node api to return related transactions of the specified address with limit offset
   * @param address
   * @param offset
   * @param limit
   * @returns related transactions
   */
  getAddressTransactionsWithOffsetLimit = async (
    address: string,
    offset: number,
    limit: number,
  ): Promise<{ items: Array<ExtendedTransaction>; total: number }> => {
    const txs = await this.api.getTxsByAddress(address, {
      offset,
      limit,
    });
    if (!txs.items)
      throw new Error(
        'Explorer AddressTransactions api expected to have items',
      );
    return {
      items: txs.items.map((tx) => this.convertTransaction(tx)),
      total: txs.total!,
    };
  };
}
