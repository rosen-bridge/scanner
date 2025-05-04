import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Block } from '@rosen-bridge/scanner-interfaces';
import { GeneralScanner } from '../../abstract/generalScanner';
import { BlockDbAction } from '../../action';
import { NetworkConnectorManager } from '../../network/NetworkConnectorManager';
import { DataSource } from 'typeorm';

/**
 * Abstract base class for all Cardano scanners
 * Provides common functionality for network management and block processing
 */
export abstract class AbstractCardanoScanner<
  TransactionType
> extends GeneralScanner<TransactionType> {
  readonly initialHeight: number;
  readonly network: NetworkConnectorManager<TransactionType>;
  readonly logger: AbstractLogger;

  constructor(
    dataSource: DataSource,
    initialHeight: number,
    network: NetworkConnectorManager<TransactionType>,
    scannerName: string,
    logger?: AbstractLogger,
    blockRetrieveGap = 0
  ) {
    super(blockRetrieveGap, logger);
    /**
     * In order to keep the scanners functionalities consistent, we add config
     * `initialHeight` by one so that it matches how other scanners work.
     */
    this.initialHeight = initialHeight + 1;
    this.network = network;
    this.logger = logger ?? new DummyLogger();
    this.action = new BlockDbAction(dataSource, scannerName, this.logger);
  }

  /**
   * Get the first block to process
   * @returns The first block at the configured initial height
   */
  protected getFirstBlock = (): Promise<Block> => {
    return this.network.getBlockAtHeight(this.initialHeight);
  };

  /**
   * Get the name of the scanner
   * @returns The scanner name
   */
  abstract name: () => string;
}
