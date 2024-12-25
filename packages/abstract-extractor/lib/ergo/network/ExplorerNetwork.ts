import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { V1 } from '@rosen-clients/ergo-explorer';

import { ExtendedTransaction, OutputBox, Transaction } from '../interfaces';
import { mapValues, pick } from 'lodash-es';
import { API_LIMIT } from '../../constants';

export class ExplorerNetwork {
  private api;

  constructor(url: string) {
    this.api = ergoExplorerClientFactory(url);
  }

  /**
   * convert explorer api output boxes to OutputBox interface
   * @param box
   * @returns OutputBox
   */
  private convertOutputBox = (box: V1.OutputInfo): OutputBox => {
    return {
      boxId: box.boxId,
      creationHeight: box.creationHeight,
      ergoTree: box.ergoTree,
      index: box.index,
      transactionId: box.transactionId,
      value: box.value,
      additionalRegisters: mapValues(
        box.additionalRegisters,
        'serializedValue'
      ),
      assets: box.assets?.map((asset) => pick(asset, ['tokenId', 'amount'])),
    };
  };

  /**
   * convert explorer api input boxes to OutputBox interface
   * @param box
   * @returns OutputBox
   */
  private convertInputBox = (box: V1.InputInfo): OutputBox => {
    return {
      boxId: box.boxId,
      creationHeight: box.outputSettledAt,
      ergoTree: box.ergoTree,
      index: box.index,
      transactionId: box.outputTransactionId,
      value: box.value,
      additionalRegisters: mapValues(
        box.additionalRegisters,
        'serializedValue'
      ),
      assets: box.assets?.map((asset) => pick(asset, ['tokenId', 'amount'])),
    };
  };

  /**
   * convert explorer transaction to extractor transaction type
   * @param tx
   */
  private convertTransaction = (
    tx: V1.TransactionInfo
  ): ExtendedTransaction => {
    return {
      id: tx.id,
      inclusionHeight: tx.inclusionHeight,
      blockId: tx.blockId,
      dataInputs:
        tx.dataInputs?.map((dataInput) => ({
          boxId: dataInput.boxId,
        })) ?? [],
      inputs: tx.inputs?.map((input) => this.convertInputBox(input)) ?? [],
      outputs: tx.outputs?.map((output) => this.convertOutputBox(output)) ?? [],
    };
  };

  /**
   * convert explorer block transaction to transaction type
   * @param tx
   */
  private convertBlockTransaction = (tx: V1.TransactionInfo1): Transaction => {
    return {
      id: tx.id,
      dataInputs:
        tx.dataInputs?.map((dataInput) => ({
          boxId: dataInput.id,
        })) ?? [],
      inputs: tx.inputs?.map((input) => ({ boxId: input.id })) ?? [],
      outputs:
        tx.outputs?.map((output) => ({
          boxId: output.id,
          transactionId: output.txId,
          additionalRegisters: output.additionalRegisters,
          assets: output.assets?.map((asset) =>
            pick(asset, ['tokenId', 'amount'])
          ),
          ergoTree: output.ergoTree,
          creationHeight: output.creationHeight,
          index: output.index,
          value: output.value,
        })) ?? [],
    };
  };

  /**
   * use explorer api to return related transactions of the specified address in the height range
   * @param tokenId
   * @param offset
   * @param limit
   * @returns related transactions
   */
  getAddressTransactionsWithHeight = async (
    address: string,
    fromHeight: number,
    toHeight: number
  ): Promise<Array<ExtendedTransaction>> => {
    const txs = await this.api.v1.getApiV1AddressesP1Transactions(address, {
      fromHeight,
      toHeight,
      limit: API_LIMIT,
    });
    if (!txs.items)
      throw new Error(
        'Explorer AddressTransactions api expected to have items'
      );
    return txs.items.map((tx) => this.convertTransaction(tx));
  };

  /**
   * use explorer api to get the block id at the specified height
   * @param height
   * @returns block id
   */
  getBlockIdAtHeight = async (height: number): Promise<string> => {
    const id = await this.api.v0.getApiV0BlocksAtP1(height);
    return id[0];
  };

  /**
   * use explorer api to return all transactions in a block
   * @param blockId
   * @returns converted transactions
   */
  getBlockTxs = async (blockId: string): Promise<Array<Transaction>> => {
    const block = await this.api.v1.getApiV1BlocksP1(blockId);
    if (!block.block.blockTransactions) {
      throw new Error(
        `Expected explorer block api to include block transactions for block ${blockId}`
      );
    }
    return block.block.blockTransactions.map((tx) =>
      this.convertBlockTransaction(tx)
    );
  };
}
