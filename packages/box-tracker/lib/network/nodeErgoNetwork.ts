import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from './abstract/abstractErgoNetwork';
import {
  AdditionalRegisters,
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
        assets:
          b.assets?.map((a) => ({
            tokenId: a.tokenId,
            amount: BigInt(a.amount),
          })) ?? [],
        additionalRegisters: (() => {
          const r: AdditionalRegisters = {};
          const registers = ['R4', 'R5', 'R6', 'R7', 'R8', 'R9'] as const;
          registers.forEach(
            (k) =>
              b.additionalRegisters[k] && (r[k] = b.additionalRegisters[k]),
          );
          return r;
        })(),
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
        assets:
          o.assets?.map((a) => ({
            tokenId: a.tokenId,
            amount: BigInt(a.amount),
          })) ?? [],
        additionalRegisters: (() => {
          const r: AdditionalRegisters = {};
          const registers = ['R4', 'R5', 'R6', 'R7', 'R8', 'R9'] as const;
          registers.forEach(
            (k) =>
              o.additionalRegisters[k] && (r[k] = o.additionalRegisters[k]),
          );
          return r;
        })(),
        transactionId: o.transactionId ?? t.id,
        index: o.index!,
      })),
    }));
  }
  /**
   * Retrieves a single Ergo box from the address that contains
   * all required tokens specified in the instance.
   *
   */
  async getBox(): Promise<ErgoBox | undefined> {
    const boxes = await this.getBoxesByAddress(this.address);
    return boxes.find((box) =>
      this.tokens.every((t) =>
        box.assets.some((a) => a.tokenId === t.tokenId && a.amount >= t.amount),
      ),
    );
  }
}
