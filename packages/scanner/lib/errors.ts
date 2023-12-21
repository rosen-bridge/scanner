export class KoiosBlockNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'KoiosNotExpectedResultError';
  }
}

export class NotExpectedTxCountError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NotExpectedTxCountError';
  }
}
