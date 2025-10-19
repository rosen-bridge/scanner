import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from './abstract/abstractErgoNetwork';
import {
  AdditionalRegisters,
  Block,
  Transaction,
} from '@rosen-bridge/scanner-interfaces';

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

  public async getBlockInfo(hash: string): Promise<Block> {
    const rawBlock = await this.api.getBlockHeaderById(hash);
    if (rawBlock) {
      return {
        hash: rawBlock.id,
        parentHash: rawBlock.parentId,
        height: rawBlock.height,
        timestamp: Number(rawBlock.timestamp),
      };
    }
    throw new Error(`Block not found: ${hash}`);
  }
  /**
   * Retrieves all unspent boxes associated with a given Ergo address.
   *
   */
  protected async getBoxesByAddress(address: string): Promise<ErgoBox[]> {
    const rawBoxes = (await this.api.getBoxesByAddress(address)).items;
    if (rawBoxes) {
      return rawBoxes.map((b) => ({
        boxId: b.boxId ?? '',
        value: BigInt(b.value),
        ergoTree: b.ergoTree,
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
      }));
    }
    return [];
  }
  /**
   * Fetches all unconfirmed transactions currently in the mempool.
   *
   */
  async getMempoolTxs(): Promise<Transaction[]> {
    const rawTxs = await this.api.getUnconfirmedTransactions();
    return rawTxs.map((t) => ({
      id: t.id,
      inputs: t.inputs.map((i) => ({ boxId: i.boxId })),
      dataInputs: t.dataInputs?.map((d) => ({ boxId: d.boxId })) ?? [],
      outputs: t.outputs.map<ErgoBox>((o) => ({
        boxId: o.boxId!,
        value: BigInt(o.value),
        ergoTree: o.ergoTree,
        creationHeight: o.creationHeight,
        assets: (o.assets || []).map((a) => ({
          tokenId: a.tokenId,
          amount: BigInt(a.amount),
        })),
        additionalRegisters: Object.fromEntries(
          Object.entries(o.additionalRegisters || {}).map(([k, v]) => [k, v]),
        ) as AdditionalRegisters,
        transactionId: o.transactionId ?? t.id,
        index: o.index!,
      })),
    }));
  }
}
