export class BlockNotFound extends Error {
  constructor(msg: string) {
    super('BlockNotFound: ' + msg);
  }
}
