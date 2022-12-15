import { AbstractLogger } from './AbstractLogger';

class DummyLogger extends AbstractLogger {
  debug = (message: string): void => {
    return;
  };

  error = (message: string): void => {
    return;
  };

  info = (message: string): void => {
    return;
  };

  warn = (message: string): void => {
    return;
  };
}

export { DummyLogger };
