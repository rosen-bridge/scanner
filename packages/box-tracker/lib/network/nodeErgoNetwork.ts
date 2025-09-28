import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox, Token } from '../interfaces';
import { AbstractErgoNetwork } from './abstract/abstractErgoNetwork';
import { Transaction } from '@rosen-bridge/scanner-interfaces';
import { mapAdditionalRegisters } from '../utils';

export class NodeErgoNetwork extends AbstractErgoNetwork {
  private api;
  constructor(address: string, tokens: Token[] = [], url: string) {
    super(address, tokens);
    this.api = ergoNodeClientFactory(url);
  }

  protected async getBoxesByAddress(address: string): Promise<ErgoBox[]> {
    const rawBoxes = (await this.api.getBoxesByAddress(address)).items ?? [];

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
      additionalRegisters: mapAdditionalRegisters(b.additionalRegisters ?? {}),
      transactionId: b.transactionId ?? '',
      index: b.index ?? 0,
    }));
  }

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
        additionalRegisters: mapAdditionalRegisters(
          o.additionalRegisters ?? {},
        ),
        transactionId: o.transactionId ?? t.id,
        index: o.index!,
      })),
    }));
  }
  async getBox(): Promise<ErgoBox | undefined> {
    const boxes = await this.getBoxesByAddress(this.address);
    return boxes.find((box) =>
      this.tokens.every((t) =>
        box.assets.some((a) => a.tokenId === t.tokenId && a.amount >= t.amount),
      ),
    );
  }
}
