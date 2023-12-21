export class KoiosBlockNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'KoiosBlockNotFoundError';
  }
}
