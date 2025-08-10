import { AbstractNetworkConnector } from '@rosen-bridge/scanner-interfaces';

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
