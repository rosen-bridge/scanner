import AbstractRunesProtocolNetwork from '../../lib/abstractRunesProtocolNetwork';
import { TxOutputRune } from '../../lib/types';

export class MockRunesProtocolNetwork extends AbstractRunesProtocolNetwork {
  getTxOutputRunes: (
    txId: string,
  ) => Promise<{ runes: TxOutputRune[]; height: number }>;
}
