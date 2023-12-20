type BlockTxsQuery = {
  __typename?: 'Query';
  blocks: Array<{
    __typename?: 'Block';
    transactions: Array<{
      __typename?: 'Transaction';
      hash: any;
      fee: any;
      inputs: Array<{
        __typename?: 'TransactionInput';
        sourceTxIndex: number;
        sourceTxHash: any;
        value: any;
        tokens: Array<{
          __typename?: 'Token';
          quantity: string;
          asset: {
            __typename?: 'Asset';
            assetName?: any | null;
            policyId: any;
          };
        } | null>;
      }>;
      outputs: Array<{
        __typename?: 'TransactionOutput';
        address: string;
        value: any;
        tokens: Array<{
          __typename?: 'Token';
          quantity: string;
          asset: {
            __typename?: 'Asset';
            assetName?: any | null;
            policyId: any;
          };
        }>;
      } | null>;
      metadata?: Array<{
        __typename?: 'TransactionMetadata';
        key: string;
        value: any;
      } | null> | null;
    } | null>;
  } | null>;
};
export type GraphQLTransaction = NonNullable<
  NonNullable<BlockTxsQuery['blocks'][0]>['transactions'][0]
>;
