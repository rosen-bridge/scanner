import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import { TxOutputRune } from './types';

abstract class AbstractRunesProtocolNetwork {
  logger: AbstractLogger;

  constructor(logger?: AbstractLogger) {
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * returns the Runes transfer of a transaction
   * @param txId
   */
  abstract getTxOutputRunes(
    txId: string,
  ): Promise<{ runes: TxOutputRune[]; height: number }>;
}

export default AbstractRunesProtocolNetwork;
