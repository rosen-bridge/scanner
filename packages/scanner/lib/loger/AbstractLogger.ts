abstract class AbstractLogger {
  abstract info: (message: string) => void;
  abstract warn: (message: string) => void;
  abstract error: (message: string) => void;
  abstract debug: (message: string) => void;
}

export { AbstractLogger };
