import { AbstractRunesProtocolNetwork } from '../lib/abstractRunesProtocolNetwork';
import { TxOutputRune } from '../lib/types';

export class TestRunesProtocolNetwork extends AbstractRunesProtocolNetwork {
  getTxOutputRunes: (txId: string, height: number) => Promise<TxOutputRune[]>;
}
