import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';

import {
  ConnectorSelectionStrategy,
  FailoverStrategy,
} from './connectorSelectionStrategies';

/**
 * Network connector manager that can handle multiple connectors
 * for a single network with pluggable selection strategy
 */
export class NetworkConnectorManager<TransactionType>
  implements AbstractNetworkConnector<TransactionType>
{
  private connectors: Array<AbstractNetworkConnector<TransactionType>>;
  private currentConnectorIndex: number;

  constructor(
    private strategy: ConnectorSelectionStrategy<TransactionType> = new FailoverStrategy<TransactionType>(),
    private logger: AbstractLogger = new DummyLogger(),
  ) {
    this.connectors = [];
    this.currentConnectorIndex = 0;
    this.strategy = strategy;
    this.logger.debug('NetworkConnectorManager initialized');
  }

  /**
   * Add a new connector to the manager
   * @param connector The network connector instance
   */
  public addConnector(
    connector: AbstractNetworkConnector<TransactionType>,
  ): void {
    this.connectors.push(connector);
    this.logger.info(
      `Added new connector. Total connectors: ${this.connectors.length}`,
    );
  }

  /**
   * Get the current active connector
   * @returns The current network connector instance
   * @throws Error if no connectors are available
   */
  getCurrentConnector(): AbstractNetworkConnector<TransactionType> {
    if (this.connectors.length === 0) {
      throw new Error('No connectors available');
    }
    this.logger.debug(`Using connector at index ${this.currentConnectorIndex}`);
    return this.connectors[this.currentConnectorIndex];
  }

  /**
   * Execute an operation using the configured strategy
   * @param operation The operation to execute
   * @returns The result of the operation
   */
  private async executeWithStrategy<T>(
    operation: (
      connector: AbstractNetworkConnector<TransactionType>,
    ) => Promise<T>,
  ): Promise<T> {
    if (this.connectors.length === 0) {
      throw new Error('No connectors available for operation');
    }

    let lastError: Error | undefined;
    let attempts = 0;
    const maxAttempts = this.connectors.length;

    while (attempts < maxAttempts) {
      try {
        const connector = this.connectors[this.currentConnectorIndex];
        this.logger.debug(
          `Attempt ${attempts + 1}/${maxAttempts} with connector at index ${
            this.currentConnectorIndex
          }`,
        );
        const result = await operation(connector);
        this.currentConnectorIndex = this.strategy.selectNextConnector(
          this.connectors,
          this.currentConnectorIndex,
        );
        this.logger.debug(
          `Operation successful, next connector index: ${this.currentConnectorIndex}`,
        );
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Operation failed with connector at index ${this.currentConnectorIndex}: ${lastError.message}`,
        );
        this.currentConnectorIndex = this.strategy.selectNextConnector(
          this.connectors,
          this.currentConnectorIndex,
          lastError,
        );
        attempts++;
      }
    }
    throw lastError || new Error('All connectors failed');
  }

  /**
   * Set the strategy to use for connector selection
   * @param strategy The strategy to use
   */
  public setStrategy(
    strategy: ConnectorSelectionStrategy<TransactionType>,
  ): void {
    this.logger.info('Setting new connector selection strategy');
    this.strategy = strategy;
  }

  /**
   * Get a block at a specific height
   * @param height The height of the block to get
   * @returns The block at the specified height
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    return this.executeWithStrategy((connector) =>
      connector.getBlockAtHeight(height),
    );
  };

  /**
   * Get the current height of the blockchain
   * @returns The current height
   */
  getCurrentHeight = async (): Promise<number> => {
    return this.executeWithStrategy((connector) =>
      connector.getCurrentHeight(),
    );
  };

  /**
   * Get all transactions in a block
   * @param blockHash The hash of the block to get transactions from
   * @returns Array of transactions in the block
   */
  getBlockTxs = async (blockHash: string): Promise<Array<TransactionType>> => {
    return this.executeWithStrategy((connector) =>
      connector.getBlockTxs(blockHash),
    );
  };

  /**
   * Get the number of available connectors
   * @returns The number of connectors
   */
  public getConnectorCount(): number {
    const count = this.connectors.length;
    this.logger.debug(`Current connector count: ${count}`);
    return count;
  }

  /**
   * Remove a connector at the specified index
   * @param index The index of the connector to remove
   */
  public removeConnector(index: number): void {
    if (index < 0 || index >= this.connectors.length) {
      throw new Error('Invalid connector index');
    }
    this.logger.info(`Removing connector at index ${index}`);
    this.connectors.splice(index, 1);
    if (this.currentConnectorIndex >= this.connectors.length) {
      this.currentConnectorIndex = 0;
    }
  }
}
