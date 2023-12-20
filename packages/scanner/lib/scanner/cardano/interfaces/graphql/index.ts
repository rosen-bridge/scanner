import { BlockTxsQuery } from './graphQLTypes';

export type GraphQLTransaction = NonNullable<
  NonNullable<BlockTxsQuery['blocks'][0]>['transactions'][0]
>;

export class GraphQLNullValueError extends Error {
  constructor(msg: string) {
    super('GraphQLNullValueError: ' + msg);
  }
}
