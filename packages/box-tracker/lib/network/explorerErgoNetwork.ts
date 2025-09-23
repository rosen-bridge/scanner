import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { ErgoBox, Token } from '../config';
import { AbstractErgoNetwork } from './abstract/abstractErgoNetwork';
import { mapAdditionalRegisters } from '../utils';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

export class ExplorerErgoNetwork extends AbstractErgoNetwork {
  private api;
  constructor(address: string, tokens: Token[] = [], url: string) {
    super(address, tokens);
    this.api = ergoExplorerClientFactory(url);
  }

  protected async getBoxesByAddress(address: string): Promise<ErgoBox[]> {
    const rawBoxes = (await this.api.v1.getApiV1BoxesByaddressP1(address))
      .items;

    return rawBoxes!.map((b) => ({
      boxId: b.boxId,
      value: BigInt(b.value),
      ergoTree: b.ergoTree,
      creationHeight: b.creationHeight,
      assets: b.assets!.map((a: Token) => ({
        tokenId: a.tokenId,
        amount: BigInt(a.amount),
      })),
      additionalRegisters: mapAdditionalRegisters(b.additionalRegisters ?? {}),
      transactionId: b.transactionId,
      index: b.index,
    }));
  }

  async getMempoolTxs(): Promise<Transaction[]> {
    const rawTxs = (await this.api.v0.getApiV0TransactionsUnconfirmed()).items;

    return rawTxs!.map((t) => ({
      id: t.id,
      inputs: t.inputs?.map((e) => ({ boxId: e.id })) ?? [],
      dataInputs: t.dataInputs?.map((e) => ({ boxId: e.id })) ?? [],
      outputs:
        t.outputs?.map<ErgoBox>((o) => ({
          boxId: o.id,
          value: BigInt(o.value),
          ergoTree: o.ergoTree,
          creationHeight: o.creationHeight,
          assets:
            o.assets?.map((a: Token) => ({
              tokenId: a.tokenId,
              amount: BigInt(a.amount),
            })) ?? [],
          additionalRegisters: mapAdditionalRegisters(
            o.additionalRegisters ?? {},
          ),
          transactionId: o.txId,
          index: o.index,
        })) ?? [],
    }));
  }
}
