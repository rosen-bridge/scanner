import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import { HttpLink } from '@apollo/client/link/http';
import fetch from 'cross-fetch';
import { AbstractNetworkConnector, Block } from '../../../interfaces';
import {
  GraphQLNullValueError,
  GraphQLTransaction,
} from '../interfaces/graphql';
import * as GraphQLTypes from '../interfaces/graphql/graphQLTypes';
import * as Queries from '../interfaces/graphql/queries';
import * as Variables from '../interfaces/graphql/variables';

export class GraphQLNetwork extends AbstractNetworkConnector<GraphQLTransaction> {
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(graphqlUri: string) {
    super();
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({ uri: graphqlUri, fetch }),
    });
  }

  /**
   * get block header from height
   * @param height
   */
  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.client
      .query<GraphQLTypes.BlockInfoQuery>({
        query: Queries.blockInfo,
        variables: Variables.blockInfoVariables(height),
      })
      .then((res) => {
        const blocks = res.data.blocks;
        if (!blocks.length) throw new Error(`Block not found`);
        if (!blocks[0] || !blocks[0].previousBlock?.hash || !blocks[0].number)
          throw new GraphQLNullValueError(`Invalid block data`);
        return {
          hash: blocks[0].hash,
          blockHeight: blocks[0].number,
          parentHash: blocks[0].previousBlock.hash,
          timestamp: Math.floor(new Date(blocks[0].forgedAt).getTime() / 1000),
        };
      });
  };

  /**
   * get current height for blockchain
   */
  getCurrentHeight = (): Promise<number> => {
    return this.client
      .query<GraphQLTypes.CurrentHeightQuery>({
        query: Queries.currentHeight,
      })
      .then((res) => {
        const height = res.data.cardano.tip.number;
        if (height) return height;
        throw new GraphQLNullValueError('Height of last block is invalid');
      });
  };

  /**
   * fetch list of transaction of specific block
   * @param blockId
   */
  getBlockTxs = (blockId: string): Promise<Array<GraphQLTransaction>> => {
    return this.client
      .query<GraphQLTypes.BlockTxsQuery>({
        query: Queries.blockTxs,
        variables: Variables.blockTxsVariables(blockId),
      })
      .then((res) => {
        const blocks = res.data.blocks;
        if (!blocks.length) throw new Error(`Block not found`);
        if (!blocks[0] || !blocks[0].transactions)
          throw new GraphQLNullValueError(`Invalid block data`);
        return blocks[0].transactions.map((tx) => {
          if (!tx)
            throw new GraphQLNullValueError(`Invalid block transaction data`);
          return tx;
        });
      });
  };
}
