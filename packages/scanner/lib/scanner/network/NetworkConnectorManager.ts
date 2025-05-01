import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';

/**
 * Interface for connector selection strategies
 */
export interface ConnectorSelectionStrategy<TransactionType> {
  /**
   * Select the next connector to use
   * @param connectors Array of available connectors
   * @param currentIndex Current connector index
   * @param lastError Error from the last operation, if any
   * @returns The index of the next connector to use
   */
  selectNextConnector(
    connectors: Array<AbstractNetworkConnector<TransactionType>>,
    currentIndex: number,
    lastError?: Error
  ): number;
}

/**
 * Failover strategy - switches to next connector only on failure
 */
export class FailoverStrategy<TransactionType>
  implements ConnectorSelectionStrategy<TransactionType>
{
  selectNextConnector(
    connectors: Array<AbstractNetworkConnector<TransactionType>>,
    currentIndex: number,
    lastError?: Error
  ): number {
    // If there was an error, try the next connector
    if (lastError) {
      return (currentIndex + 1) % connectors.length;
    }
    // Otherwise stay with current connector
    return currentIndex;
  }
}

/**
 * Round-robin strategy - switches to next connector after each operation
 */
export class RoundRobinStrategy<TransactionType>
  implements ConnectorSelectionStrategy<TransactionType>
{
  selectNextConnector(
    connectors: Array<AbstractNetworkConnector<TransactionType>>,
    currentIndex: number
  ): number {
    return (currentIndex + 1) % connectors.length;
  }
}

/**
 * Network connector manager that handles multiple connectors for the same network type
 * with pluggable selection strategy
 */
export class NetworkConnectorManager<
  TransactionType
> extends AbstractNetworkConnector<TransactionType> {
  private connectors: Array<AbstractNetworkConnector<TransactionType>>;
  private currentConnectorIndex: number;
  private strategy: ConnectorSelectionStrategy<TransactionType>;

  constructor(
    strategy: ConnectorSelectionStrategy<TransactionType> = new FailoverStrategy<TransactionType>()
  ) {
    super();
    this.connectors = [];
    this.currentConnectorIndex = 0;
    this.strategy = strategy;
  }

  /**
   * Add a network connector to the pool
   * @param connector The network connector instance
   */
  public addConnector(
    connector: AbstractNetworkConnector<TransactionType>
  ): void {
    this.connectors.push(connector);
  }

  /**
   * Get the current active connector
   * @returns The current network connector instance
   * @throws Error if no connectors are available
   */
  private getCurrentConnector(): AbstractNetworkConnector<TransactionType> {
    if (this.connectors.length === 0) {
      throw new Error('No connectors available');
    }
    return this.connectors[this.currentConnectorIndex];
  }

  /**
   * Execute an operation using the configured strategy
   * @param operation The operation to execute
   * @returns The result of the operation
   */
  private async executeWithStrategy<T>(
    operation: (
      connector: AbstractNetworkConnector<TransactionType>
    ) => Promise<T>
  ): Promise<T> {
    if (this.connectors.length === 0) {
      throw new Error('No connectors available');
    }

    const initialIndex = this.currentConnectorIndex;
    let lastError: Error | undefined;

    do {
      try {
        const connector = this.getCurrentConnector();
        const result = await operation(connector);
        // Update connector index based on strategy
        this.currentConnectorIndex = this.strategy.selectNextConnector(
          this.connectors,
          this.currentConnectorIndex
        );
        return result;
      } catch (error) {
        lastError = error as Error;
        // Update connector index based on strategy and error
        this.currentConnectorIndex = this.strategy.selectNextConnector(
          this.connectors,
          this.currentConnectorIndex,
          lastError
        );
      }
    } while (this.currentConnectorIndex !== initialIndex);

    throw lastError || new Error('All connectors failed');
  }

  /**
   * Set the connector selection strategy
   * @param strategy The strategy to use
   */
  public setStrategy(
    strategy: ConnectorSelectionStrategy<TransactionType>
  ): void {
    this.strategy = strategy;
  }

  /**
   * Get the current selection strategy
   * @returns The current strategy
   */
  public getStrategy(): ConnectorSelectionStrategy<TransactionType> {
    return this.strategy;
  }

  /**
   * Get block at height
   * @param height The block height
   * @returns The block at the specified height
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    return this.executeWithStrategy((connector) =>
      connector.getBlockAtHeight(height)
    );
  };

  /**
   * Get current height
   * @returns The current block height
   */
  getCurrentHeight = async (): Promise<number> => {
    return this.executeWithStrategy((connector) =>
      connector.getCurrentHeight()
    );
  };

  /**
   * Get block transactions
   * @param blockHash The block hash
   * @returns Array of transactions in the block
   */
  getBlockTxs = async (blockHash: string): Promise<Array<TransactionType>> => {
    return this.executeWithStrategy((connector) =>
      connector.getBlockTxs(blockHash)
    );
  };

  /**
   * Get the number of available connectors
   * @returns The number of connectors
   */
  public getConnectorCount(): number {
    return this.connectors.length;
  }

  /**
   * Remove a connector at the specified index
   * @param index The index of the connector to remove
   */
  public removeConnector(index: number): void {
    if (index < 0 || index >= this.connectors.length) {
      throw new Error('Invalid connector index');
    }
    this.connectors.splice(index, 1);
    if (this.currentConnectorIndex >= this.connectors.length) {
      this.currentConnectorIndex = 0;
    }
  }
}
