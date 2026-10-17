import { AbstractLogger } from '@rosen-bridge/abstract-logger';

interface SharedErrorState {
  count: number;
}

/**
 * Records only that an error occurred. Message and context values are discarded
 * so RPC credentials or response content cannot become part of evidence output.
 */
export class FailClosedScannerLogger extends AbstractLogger {
  constructor(private readonly state: SharedErrorState = { count: 0 }) {
    super();
  }

  trace = (): undefined => undefined;
  debug = (): undefined => undefined;
  info = (): undefined => undefined;
  warn = (): undefined => undefined;
  error = (): undefined => {
    this.state.count += 1;
    return undefined;
  };
  critical = (): undefined => {
    this.state.count += 1;
    return undefined;
  };

  child = (): AbstractLogger => new FailClosedScannerLogger(this.state);

  hasErrors = (): boolean => this.state.count > 0;

  assertNoErrors = (): void => {
    if (this.hasErrors()) {
      throw new Error('GeneralScanner reported an update error');
    }
  };
}
