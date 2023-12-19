export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  AssetFingerprint: { input: any; output: any };
  BigInt: { input: any; output: any };
  DateTime: { input: any; output: any };
  Hash28Hex: { input: any; output: any };
  Hash32Hex: { input: any; output: any };
  Hex: { input: any; output: any };
  IPv4: { input: any; output: any };
  IPv6: { input: any; output: any };
  JSON: { input: any; output: any };
  JSONObject: { input: any; output: any };
  Lovelace: { input: any; output: any };
  Percentage: { input: any; output: any };
  StakeAddress: { input: any; output: any };
  StakePoolID: { input: any; output: any };
  Timestamp: { input: any; output: any };
  VRFVerificationKey: { input: any; output: any };
};

export type ActiveStake = {
  __typename?: 'ActiveStake';
  address: Scalars['StakeAddress']['output'];
  amount: Scalars['Lovelace']['output'];
  epoch?: Maybe<Epoch>;
  epochNo: Scalars['Int']['output'];
  registeredWith: StakePool;
  stakePoolHash: Scalars['Hash28Hex']['output'];
  stakePoolId: Scalars['StakePoolID']['output'];
};

export type ActiveStake_Aggregate = {
  __typename?: 'ActiveStake_aggregate';
  aggregate?: Maybe<ActiveStake_Aggregate_Fields>;
};

export type ActiveStake_Aggregate_Fields = {
  __typename?: 'ActiveStake_aggregate_fields';
  count: Scalars['String']['output'];
  max: ActiveStake_Max_Fields;
  min: ActiveStake_Min_Fields;
  sum: ActiveStake_Sum_Fields;
};

export type ActiveStake_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<ActiveStake_Bool_Exp>>>;
  _not?: InputMaybe<ActiveStake_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<ActiveStake_Bool_Exp>>>;
  address?: InputMaybe<StakeAddress_Comparison_Exp>;
  amount?: InputMaybe<Text_Comparison_Exp>;
  epoch?: InputMaybe<Epoch_Bool_Exp>;
  epochNo?: InputMaybe<Int_Comparison_Exp>;
  registeredWith?: InputMaybe<StakePool_Bool_Exp>;
  stakePoolHash?: InputMaybe<Hash28Hex_Comparison_Exp>;
  stakePoolId?: InputMaybe<StakePoolId_Comparison_Exp>;
};

export type ActiveStake_Max_Fields = {
  __typename?: 'ActiveStake_max_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type ActiveStake_Min_Fields = {
  __typename?: 'ActiveStake_min_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type ActiveStake_Order_By = {
  address?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  epoch?: InputMaybe<Epoch_Order_By>;
  epochNo?: InputMaybe<Order_By>;
  registeredWith?: InputMaybe<StakePool_Order_By>;
  stakePoolHash?: InputMaybe<Order_By>;
  stakePoolId?: InputMaybe<Order_By>;
};

export type ActiveStake_Sum_Fields = {
  __typename?: 'ActiveStake_sum_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type Ada = {
  __typename?: 'Ada';
  supply: AssetSupply;
};

export type AdaPots = {
  __typename?: 'AdaPots';
  deposits: Scalars['Lovelace']['output'];
  fees: Scalars['Lovelace']['output'];
  reserves: Scalars['Lovelace']['output'];
  rewards: Scalars['Lovelace']['output'];
  slotNo: Scalars['String']['output'];
  treasury: Scalars['Lovelace']['output'];
  utxo: Scalars['Lovelace']['output'];
};

export type AlonzoGenesis = {
  __typename?: 'AlonzoGenesis';
  collateralPercentage: Scalars['Int']['output'];
  executionPrices: ExecutionPrices;
  lovelacePerUTxOWord: Scalars['Lovelace']['output'];
  maxBlockExUnits: ExecutionUnits;
  maxCollateralInputs: Scalars['Int']['output'];
  maxTxExUnits: ExecutionUnits;
  maxValueSize: Scalars['Lovelace']['output'];
};

export type Asset = {
  __typename?: 'Asset';
  assetId: Scalars['Hex']['output'];
  assetName?: Maybe<Scalars['Hex']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fingerprint?: Maybe<Scalars['AssetFingerprint']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  metadataHash?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  policyId: Scalars['Hash28Hex']['output'];
  ticker?: Maybe<Scalars['String']['output']>;
  tokenMints: Array<Maybe<TokenMint>>;
  tokenMints_aggregate: TokenMint_Aggregate;
  url?: Maybe<Scalars['String']['output']>;
};

export type AssetTokenMintsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TokenMint_Order_By>>;
  where?: InputMaybe<TokenMint_Bool_Exp>;
};

export type AssetTokenMints_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TokenMint_Order_By>>;
  where?: InputMaybe<TokenMint_Bool_Exp>;
};

export type AssetBalance = {
  __typename?: 'AssetBalance';
  asset: Asset;
  quantity: Scalars['String']['output'];
};

export type AssetFingerprint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type AssetSupply = {
  __typename?: 'AssetSupply';
  circulating: Scalars['String']['output'];
  max: Scalars['String']['output'];
  total?: Maybe<Scalars['String']['output']>;
};

export type AssetSupply_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<AssetSupply_Bool_Exp>>>;
  _not?: InputMaybe<AssetSupply_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<AssetSupply_Bool_Exp>>>;
  circulating?: InputMaybe<Text_Comparison_Exp>;
  max?: InputMaybe<Text_Comparison_Exp>;
  total?: InputMaybe<Text_Comparison_Exp>;
};

export type AssetSupply_Order_By = {
  circulating?: InputMaybe<Order_By>;
  max?: InputMaybe<Order_By>;
  total?: InputMaybe<Order_By>;
};

export type Asset_Aggregate = {
  __typename?: 'Asset_aggregate';
  aggregate?: Maybe<Asset_Aggregate_Fields>;
};

export type Asset_Aggregate_Fields = {
  __typename?: 'Asset_aggregate_fields';
  count: Scalars['String']['output'];
};

export type Asset_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Asset_Bool_Exp>>>;
  _not?: InputMaybe<Asset_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Asset_Bool_Exp>>>;
  assetId?: InputMaybe<Hex_Comparison_Exp>;
  assetName?: InputMaybe<Hex_Comparison_Exp>;
  decimals?: InputMaybe<Int_Comparison_Exp>;
  description?: InputMaybe<Text_Comparison_Exp>;
  fingerprint?: InputMaybe<AssetFingerprint_Comparison_Exp>;
  logo?: InputMaybe<Text_Comparison_Exp>;
  name?: InputMaybe<Text_Comparison_Exp>;
  policyId?: InputMaybe<Hash28Hex_Comparison_Exp>;
  ticker?: InputMaybe<Text_Comparison_Exp>;
  tokenMints?: InputMaybe<TokenMint_Bool_Exp>;
  url?: InputMaybe<Text_Comparison_Exp>;
};

export type Asset_Order_By = {
  assetId?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  fingerprint?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
};

export type Block = {
  __typename?: 'Block';
  epoch?: Maybe<Epoch>;
  epochNo?: Maybe<Scalars['Int']['output']>;
  fees: Scalars['Lovelace']['output'];
  forgedAt: Scalars['DateTime']['output'];
  hash: Scalars['Hash32Hex']['output'];
  nextBlock?: Maybe<Block>;
  number?: Maybe<Scalars['Int']['output']>;
  opCert?: Maybe<Scalars['Hash32Hex']['output']>;
  previousBlock?: Maybe<Block>;
  protocolVersion?: Maybe<Scalars['JSONObject']['output']>;
  size: Scalars['Int']['output'];
  slotInEpoch?: Maybe<Scalars['String']['output']>;
  slotLeader: SlotLeader;
  slotNo?: Maybe<Scalars['String']['output']>;
  transactions: Array<Maybe<Transaction>>;
  transactionsCount: Scalars['String']['output'];
  transactions_aggregate: Transaction_Aggregate;
  vrfKey?: Maybe<Scalars['VRFVerificationKey']['output']>;
};

export type BlockTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transaction_Order_By>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};

export type BlockTransactions_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transaction_Order_By>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};

export type Block_Aggregate = {
  __typename?: 'Block_aggregate';
  aggregate?: Maybe<Block_Aggregate_Fields>;
};

export type Block_Aggregate_Fields = {
  __typename?: 'Block_aggregate_fields';
  count: Scalars['String']['output'];
  max: Block_Max_Fields;
  min: Block_Min_Fields;
  sum: Block_Sum_Fields;
};

export type Block_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Block_Bool_Exp>>>;
  _not?: InputMaybe<Block_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Block_Bool_Exp>>>;
  epoch?: InputMaybe<Epoch_Bool_Exp>;
  fees?: InputMaybe<Text_Comparison_Exp>;
  forgedAt?: InputMaybe<Date_Comparison_Exp>;
  hash?: InputMaybe<Hash32Hex_Comparison_Exp>;
  nextBlock?: InputMaybe<Block_Bool_Exp>;
  number?: InputMaybe<Int_Comparison_Exp>;
  previousBlock?: InputMaybe<Block_Bool_Exp>;
  size?: InputMaybe<Int_Comparison_Exp>;
  slotInEpoch?: InputMaybe<Int_Comparison_Exp>;
  slotLeader?: InputMaybe<SlotLeader_Bool_Exp>;
  slotNo?: InputMaybe<Text_Comparison_Exp>;
  transactions?: InputMaybe<Transaction_Bool_Exp>;
  transactionsCount?: InputMaybe<Text_Comparison_Exp>;
  vrfKey?: InputMaybe<VrfVerificationKey_Comparison_Exp>;
};

export type Block_Max_Fields = {
  __typename?: 'Block_max_fields';
  fees?: Maybe<Scalars['Lovelace']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
};

export type Block_Min_Fields = {
  __typename?: 'Block_min_fields';
  fees?: Maybe<Scalars['Lovelace']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
};

export type Block_Order_By = {
  epoch?: InputMaybe<Epoch_Order_By>;
  fees?: InputMaybe<Order_By>;
  forgedAt?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By_With_Nulls>;
  size?: InputMaybe<Order_By>;
  slotLeader?: InputMaybe<SlotLeader_Order_By>;
  slotNo?: InputMaybe<Order_By_With_Nulls>;
  transactionsCount?: InputMaybe<Order_By>;
  vrfKey?: InputMaybe<Order_By_With_Nulls>;
};

export type Block_Sum_Fields = {
  __typename?: 'Block_sum_fields';
  fees?: Maybe<Scalars['Lovelace']['output']>;
  size?: Maybe<Scalars['BigInt']['output']>;
};

export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export type ByronBlockVersionData = {
  __typename?: 'ByronBlockVersionData';
  heavyDelThd: Scalars['String']['output'];
  maxBlockSize: Scalars['Int']['output'];
  maxHeaderSize: Scalars['Int']['output'];
  maxProposalSize: Scalars['Int']['output'];
  maxTxSize: Scalars['Int']['output'];
  mpcThd: Scalars['String']['output'];
  scriptVersion: Scalars['Int']['output'];
  slotDuration: Scalars['Int']['output'];
  softforkRule: ByronSoftForkRule;
  txFeePolicy: ByronTxFeePolicy;
  unlockStakeEpoch: Scalars['String']['output'];
  updateImplicit: Scalars['String']['output'];
  updateProposalThd: Scalars['String']['output'];
  updateVoteThd: Scalars['String']['output'];
};

export type ByronGenesis = {
  __typename?: 'ByronGenesis';
  avvmDistr: Scalars['JSONObject']['output'];
  blockVersionData: ByronBlockVersionData;
  bootStakeholders: Scalars['JSONObject']['output'];
  heavyDelegation: Scalars['JSONObject']['output'];
  nonAvvmBalances: Scalars['JSONObject']['output'];
  protocolConsts: ByronProtocolConsts;
  startTime: Scalars['Timestamp']['output'];
};

export type ByronProtocolConsts = {
  __typename?: 'ByronProtocolConsts';
  k: Scalars['Int']['output'];
  protocolMagic?: Maybe<Scalars['Int']['output']>;
};

export type ByronSoftForkRule = {
  __typename?: 'ByronSoftForkRule';
  initThd: Scalars['String']['output'];
  minThd: Scalars['String']['output'];
  thdDecrement: Scalars['String']['output'];
};

export type ByronTxFeePolicy = {
  __typename?: 'ByronTxFeePolicy';
  multiplier: Scalars['String']['output'];
  summand: Scalars['String']['output'];
};

export type Cardano = {
  __typename?: 'Cardano';
  currentEpoch: Epoch;
  tip: Block;
};

export type CardanoDbMeta = {
  __typename?: 'CardanoDbMeta';
  initialized: Scalars['Boolean']['output'];
  syncPercentage: Scalars['Percentage']['output'];
};

export type CollateralInput = {
  __typename?: 'CollateralInput';
  address: Scalars['String']['output'];
  sourceTransaction: Transaction;
  sourceTxHash: Scalars['Hash32Hex']['output'];
  sourceTxIndex: Scalars['Int']['output'];
  tokens: Array<Maybe<Token>>;
  tokens_aggregate: Token_Aggregate;
  transaction: Transaction;
  txHash: Scalars['Hash32Hex']['output'];
  value: Scalars['Lovelace']['output'];
};

export type CollateralInput_Aggregate = {
  __typename?: 'CollateralInput_aggregate';
  aggregate?: Maybe<TransactionInput_Aggregate_Fields>;
};

export type CollateralInput_Aggregate_Fields = {
  __typename?: 'CollateralInput_aggregate_fields';
  count: Scalars['String']['output'];
  max: CollateralInput_Max_Fields;
  min: CollateralInput_Min_Fields;
  sum: CollateralInput_Sum_Fields;
};

export type CollateralInput_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<CollateralInput_Bool_Exp>>>;
  _not?: InputMaybe<CollateralInput_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<CollateralInput_Bool_Exp>>>;
  address?: InputMaybe<Text_Comparison_Exp>;
  sourceTransaction?: InputMaybe<Transaction_Bool_Exp>;
  tokens?: InputMaybe<Token_Bool_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  value?: InputMaybe<Text_Comparison_Exp>;
};

export type CollateralInput_Max_Fields = {
  __typename?: 'CollateralInput_max_fields';
  tokens?: Maybe<Token_Max_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type CollateralInput_Min_Fields = {
  __typename?: 'CollateralInput_min_fields';
  tokens?: Maybe<Token_Min_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type CollateralInput_Order_By = {
  address?: InputMaybe<Order_By>;
  sourceTxHash?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  txHash?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

export type CollateralInput_Sum_Fields = {
  __typename?: 'CollateralInput_sum_fields';
  tokens?: Maybe<Token_Sum_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type CollateralOutput = {
  __typename?: 'CollateralOutput';
  address: Scalars['String']['output'];
  addressHasScript: Scalars['Boolean']['output'];
  datum?: Maybe<Datum>;
  index: Scalars['Int']['output'];
  paymentCredential?: Maybe<Scalars['Hash28Hex']['output']>;
  script?: Maybe<Script>;
  transaction: Transaction;
  txHash: Scalars['Hash32Hex']['output'];
  value: Scalars['Lovelace']['output'];
};

export type CollateralOutput_Aggregate = {
  __typename?: 'CollateralOutput_aggregate';
  aggregate?: Maybe<CollateralOutput_Aggregate_Fields>;
};

export type CollateralOutput_Aggregate_Fields = {
  __typename?: 'CollateralOutput_aggregate_fields';
  count: Scalars['String']['output'];
  max: CollateralOutput_Max_Fields;
  min: CollateralOutput_Min_Fields;
  sum: CollateralOutput_Sum_Fields;
};

export type CollateralOutput_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<CollateralOutput_Bool_Exp>>>;
  _not?: InputMaybe<CollateralOutput_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<CollateralOutput_Bool_Exp>>>;
  address?: InputMaybe<Text_Comparison_Exp>;
  addressHasScript?: InputMaybe<Boolean_Comparison_Exp>;
  datum?: InputMaybe<Datum_Bool_Exp>;
  index?: InputMaybe<Int_Comparison_Exp>;
  script?: InputMaybe<Script_Bool_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  value?: InputMaybe<Text_Comparison_Exp>;
};

export enum CollateralOutput_Distinct_On {
  Address = 'address',
}

export type CollateralOutput_Max_Fields = {
  __typename?: 'CollateralOutput_max_fields';
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type CollateralOutput_Min_Fields = {
  __typename?: 'CollateralOutput_min_fields';
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type CollateralOutput_Order_By = {
  address?: InputMaybe<Order_By>;
  addressHasScript?: InputMaybe<Order_By>;
  datum?: InputMaybe<Transaction_Order_By>;
  index?: InputMaybe<Order_By>;
  txHash?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

export type CollateralOutput_Sum_Fields = {
  __typename?: 'CollateralOutput_sum_fields';
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type Date_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['DateTime']['input']>;
  _gt?: InputMaybe<Scalars['DateTime']['input']>;
  _gte?: InputMaybe<Scalars['DateTime']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  _lt?: InputMaybe<Scalars['DateTime']['input']>;
  _lte?: InputMaybe<Scalars['DateTime']['input']>;
  _neq?: InputMaybe<Scalars['DateTime']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
};

export type Datum = {
  __typename?: 'Datum';
  bytes: Scalars['Hex']['output'];
  firstIncludedIn: Transaction;
  hash: Scalars['Hash32Hex']['output'];
  value: Scalars['JSONObject']['output'];
};

export type Datum_Bool_Exp = {
  firstIncludedIn?: InputMaybe<Transaction_Bool_Exp>;
  hash?: InputMaybe<Hex_Comparison_Exp>;
};

export type Delegation = {
  __typename?: 'Delegation';
  address: Scalars['StakeAddress']['output'];
  redeemer?: Maybe<Redeemer>;
  stakePool: StakePool;
  stakePoolHash: Scalars['Hash28Hex']['output'];
  stakePoolId: Scalars['StakePoolID']['output'];
  transaction?: Maybe<Transaction>;
};

export type Delegation_Aggregate = {
  __typename?: 'Delegation_aggregate';
  aggregate?: Maybe<Delegation_Aggregate_Fields>;
};

export type Delegation_Aggregate_Fields = {
  __typename?: 'Delegation_aggregate_fields';
  count?: Maybe<Scalars['String']['output']>;
};

export type Delegation_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Delegation_Bool_Exp>>>;
  _not?: InputMaybe<Delegation_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Delegation_Bool_Exp>>>;
  address?: InputMaybe<StakeAddress_Comparison_Exp>;
  stakePool?: InputMaybe<StakePool_Bool_Exp>;
  stakePoolHash?: InputMaybe<Hash28Hex_Comparison_Exp>;
  stakePoolId?: InputMaybe<StakePoolId_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
};

export type Delegation_Order_By = {
  address?: InputMaybe<Order_By>;
  stakePool?: InputMaybe<StakePool_Order_By>;
  stakePoolHash?: InputMaybe<Order_By>;
  stakePoolId?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
};

export type Epoch = {
  __typename?: 'Epoch';
  activeStake?: Maybe<Array<Maybe<ActiveStake>>>;
  activeStake_aggregate?: Maybe<ActiveStake_Aggregate>;
  adaPots?: Maybe<AdaPots>;
  blocks: Array<Block>;
  blocksCount: Scalars['String']['output'];
  blocks_aggregate: Block_Aggregate;
  fees: Scalars['Lovelace']['output'];
  lastBlockTime: Scalars['DateTime']['output'];
  nonce?: Maybe<Scalars['Hash32Hex']['output']>;
  number: Scalars['Int']['output'];
  output: Scalars['Lovelace']['output'];
  protocolParams?: Maybe<ProtocolParams>;
  startedAt: Scalars['DateTime']['output'];
  transactionsCount: Scalars['String']['output'];
};

export type EpochBlocksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};

export type EpochBlocks_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};

export type Epoch_Aggregate = {
  __typename?: 'Epoch_aggregate';
  aggregate: Epoch_Aggregate_Fields;
};

export type Epoch_Aggregate_Fields = {
  __typename?: 'Epoch_aggregate_fields';
  count: Scalars['String']['output'];
  max: Epoch_Max_Fields;
  min: Epoch_Min_Fields;
  sum: Epoch_Sum_Fields;
};

export type Epoch_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Epoch_Bool_Exp>>>;
  _not?: InputMaybe<Epoch_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Epoch_Bool_Exp>>>;
  blocks?: InputMaybe<Block_Bool_Exp>;
  blocksCount?: InputMaybe<Text_Comparison_Exp>;
  fees?: InputMaybe<Text_Comparison_Exp>;
  number?: InputMaybe<Int_Comparison_Exp>;
  output?: InputMaybe<Text_Comparison_Exp>;
  startedAt?: InputMaybe<Date_Comparison_Exp>;
  transactionsCount?: InputMaybe<Text_Comparison_Exp>;
};

export type Epoch_Max_Fields = {
  __typename?: 'Epoch_max_fields';
  blocksCount: Scalars['Int']['output'];
  fees: Scalars['Lovelace']['output'];
  number: Scalars['Int']['output'];
  output: Scalars['Lovelace']['output'];
  transactionsCount: Scalars['String']['output'];
};

export type Epoch_Min_Fields = {
  __typename?: 'Epoch_min_fields';
  blocksCount: Scalars['String']['output'];
  fees: Scalars['Lovelace']['output'];
  output: Scalars['Lovelace']['output'];
  transactionsCount: Scalars['String']['output'];
};

export type Epoch_Order_By = {
  blocksCount?: InputMaybe<Order_By>;
  fees?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By>;
  output?: InputMaybe<Order_By>;
  transactionsCount?: InputMaybe<Order_By>;
};

export type Epoch_Sum_Fields = {
  __typename?: 'Epoch_sum_fields';
  blocksCount: Scalars['String']['output'];
  fees: Scalars['Lovelace']['output'];
  output: Scalars['Lovelace']['output'];
  transactionsCount: Scalars['String']['output'];
};

export type ExecutionPrice = {
  __typename?: 'ExecutionPrice';
  denominator: Scalars['Int']['output'];
  numerator: Scalars['Int']['output'];
};

export type ExecutionPrices = {
  __typename?: 'ExecutionPrices';
  prMem: ExecutionPrice;
  prSteps: ExecutionPrice;
};

export type ExecutionUnits = {
  __typename?: 'ExecutionUnits';
  exUnitsMem: Scalars['String']['output'];
  exUnitsSteps: Scalars['String']['output'];
};

export type Float_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Float']['input']>;
  _gt?: InputMaybe<Scalars['Float']['input']>;
  _gte?: InputMaybe<Scalars['Float']['input']>;
  _in?: InputMaybe<Array<Scalars['Float']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Float']['input']>;
  _lte?: InputMaybe<Scalars['Float']['input']>;
  _neq?: InputMaybe<Scalars['Float']['input']>;
  _nin?: InputMaybe<Array<Scalars['Float']['input']>>;
};

export type Genesis = {
  __typename?: 'Genesis';
  alonzo?: Maybe<AlonzoGenesis>;
  byron?: Maybe<ByronGenesis>;
  shelley?: Maybe<ShelleyGenesis>;
};

export type Hash28Hex_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Hash28Hex']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['Hash28Hex']['input']>>>;
  _neq?: InputMaybe<Scalars['Hash28Hex']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['Hash28Hex']['input']>>>;
};

export type Hash32Hex_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Hash32Hex']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['Hash32Hex']['input']>>>;
  _neq?: InputMaybe<Scalars['Hash32Hex']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['Hash32Hex']['input']>>>;
};

export type Hex_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Hex']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['Hex']['input']>>>;
  _neq?: InputMaybe<Scalars['Hex']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['Hex']['input']>>>;
};

export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  submitTransaction: TransactionSubmitResponse;
};

export type MutationSubmitTransactionArgs = {
  transaction: Scalars['String']['input'];
};

export type PaymentAddress = {
  __typename?: 'PaymentAddress';
  address: Scalars['String']['output'];
  summary?: Maybe<PaymentAddressSummary>;
};

export type PaymentAddressSummaryArgs = {
  atBlock?: InputMaybe<Scalars['Int']['input']>;
};

export type PaymentAddressSummary = {
  __typename?: 'PaymentAddressSummary';
  assetBalances: Array<Maybe<AssetBalance>>;
  utxosCount: Scalars['Int']['output'];
};

export type Percentage_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Percentage']['input']>;
  _gt?: InputMaybe<Scalars['Percentage']['input']>;
  _gte?: InputMaybe<Scalars['Percentage']['input']>;
  _lt?: InputMaybe<Scalars['Percentage']['input']>;
  _lte?: InputMaybe<Scalars['Percentage']['input']>;
  _neq?: InputMaybe<Scalars['Percentage']['input']>;
};

export type ProtocolParams = {
  __typename?: 'ProtocolParams';
  a0: Scalars['Float']['output'];
  coinsPerUtxoByte?: Maybe<Scalars['Lovelace']['output']>;
  collateralPercent?: Maybe<Scalars['Int']['output']>;
  costModels?: Maybe<Scalars['JSONObject']['output']>;
  decentralisationParam: Scalars['Float']['output'];
  eMax: Scalars['Int']['output'];
  extraEntropy?: Maybe<Scalars['JSONObject']['output']>;
  keyDeposit: Scalars['Lovelace']['output'];
  maxBlockBodySize: Scalars['Int']['output'];
  maxBlockExMem?: Maybe<Scalars['String']['output']>;
  maxBlockExSteps?: Maybe<Scalars['String']['output']>;
  maxBlockHeaderSize: Scalars['Int']['output'];
  maxCollateralInputs?: Maybe<Scalars['Int']['output']>;
  maxTxExMem?: Maybe<Scalars['String']['output']>;
  maxTxExSteps?: Maybe<Scalars['String']['output']>;
  maxTxSize: Scalars['Int']['output'];
  maxValSize?: Maybe<Scalars['String']['output']>;
  minFeeA: Scalars['Int']['output'];
  minFeeB: Scalars['Int']['output'];
  minPoolCost: Scalars['Lovelace']['output'];
  minUTxOValue: Scalars['Lovelace']['output'];
  nOpt: Scalars['Int']['output'];
  poolDeposit: Scalars['Lovelace']['output'];
  priceMem?: Maybe<Scalars['Float']['output']>;
  priceStep?: Maybe<Scalars['Float']['output']>;
  protocolVersion: Scalars['JSONObject']['output'];
  rho: Scalars['Float']['output'];
  tau: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  activeStake: Array<Maybe<ActiveStake>>;
  activeStake_aggregate: ActiveStake_Aggregate;
  ada: Ada;
  assets: Array<Maybe<Asset>>;
  assets_aggregate: Asset_Aggregate;
  blocks: Array<Maybe<Block>>;
  blocks_aggregate: Block_Aggregate;
  cardano: Cardano;
  cardanoDbMeta: CardanoDbMeta;
  collateralInputs: Array<Maybe<CollateralInput>>;
  collateralInputs_aggregate: CollateralInput_Aggregate;
  collateralOutputs: Array<Maybe<CollateralOutput>>;
  collateralOutputs_aggregate: CollateralOutput_Aggregate;
  delegations?: Maybe<Array<Maybe<Delegation>>>;
  delegations_aggregate?: Maybe<Delegation_Aggregate>;
  epochs: Array<Maybe<Epoch>>;
  epochs_aggregate: Epoch_Aggregate;
  genesis: Genesis;
  paymentAddresses?: Maybe<Array<Maybe<PaymentAddress>>>;
  redeemers: Array<Maybe<Redeemer>>;
  redeemers_aggregate: Redeemer_Aggregate;
  rewards: Array<Maybe<Reward>>;
  rewards_aggregate: Reward_Aggregate;
  scripts: Array<Maybe<Script>>;
  scripts_aggregate: Script_Aggregate;
  stakeDeregistrations?: Maybe<Array<Maybe<StakeDeregistration>>>;
  stakeDeregistrations_aggregate?: Maybe<StakeDeregistration_Aggregate>;
  stakePools?: Maybe<Array<Maybe<StakePool>>>;
  stakePools_aggregate?: Maybe<StakePool_Aggregate>;
  stakeRegistrations?: Maybe<Array<Maybe<StakeRegistration>>>;
  stakeRegistrations_aggregate?: Maybe<StakeRegistration_Aggregate>;
  tokenMints: Array<Maybe<TokenMint>>;
  tokenMints_aggregate: TokenMint_Aggregate;
  transactions: Array<Maybe<Transaction>>;
  transactions_aggregate: Transaction_Aggregate;
  utxos: Array<Maybe<TransactionOutput>>;
  utxos_aggregate: TransactionOutput_Aggregate;
  withdrawals: Array<Maybe<Withdrawal>>;
  withdrawals_aggregate?: Maybe<Withdrawal_Aggregate>;
};

export type QueryActiveStakeArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ActiveStake_Order_By>>;
  where?: InputMaybe<ActiveStake_Bool_Exp>;
};

export type QueryActiveStake_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ActiveStake_Order_By>>;
  where?: InputMaybe<ActiveStake_Bool_Exp>;
};

export type QueryAssetsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Asset_Order_By>>;
  where?: InputMaybe<Asset_Bool_Exp>;
};

export type QueryAssets_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Asset_Order_By>>;
  where?: InputMaybe<Asset_Bool_Exp>;
};

export type QueryBlocksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};

export type QueryBlocks_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};

export type QueryCollateralInputsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<CollateralInput_Order_By>>;
  where?: InputMaybe<CollateralInput_Bool_Exp>;
};

export type QueryCollateralInputs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<CollateralInput_Order_By>>;
  where?: InputMaybe<CollateralInput_Bool_Exp>;
};

export type QueryCollateralOutputsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<CollateralOutput_Order_By>>;
  where?: InputMaybe<CollateralOutput_Bool_Exp>;
};

export type QueryCollateralOutputs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<CollateralOutput_Order_By>>;
  where?: InputMaybe<CollateralOutput_Bool_Exp>;
};

export type QueryDelegationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delegation_Order_By>>;
  where?: InputMaybe<Delegation_Bool_Exp>;
};

export type QueryDelegations_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delegation_Order_By>>;
  where?: InputMaybe<Delegation_Bool_Exp>;
};

export type QueryEpochsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Epoch_Order_By>>;
  where?: InputMaybe<Epoch_Bool_Exp>;
};

export type QueryEpochs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Epoch_Order_By>>;
  where?: InputMaybe<Epoch_Bool_Exp>;
};

export type QueryPaymentAddressesArgs = {
  addresses: Array<InputMaybe<Scalars['String']['input']>>;
};

export type QueryRedeemersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Redeemer_Order_By>>;
  where?: InputMaybe<Redeemer_Bool_Exp>;
};

export type QueryRedeemers_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Redeemer_Order_By>>;
  where?: InputMaybe<Redeemer_Bool_Exp>;
};

export type QueryRewardsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reward_Order_By>>;
  where?: InputMaybe<Reward_Bool_Exp>;
};

export type QueryRewards_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reward_Order_By>>;
  where?: InputMaybe<Reward_Bool_Exp>;
};

export type QueryScriptsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Script_Order_By>>;
  where?: InputMaybe<Script_Bool_Exp>;
};

export type QueryScripts_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Script_Order_By>>;
  where?: InputMaybe<Script_Bool_Exp>;
};

export type QueryStakeDeregistrationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<StakeDeregistration_Order_By>>;
  where?: InputMaybe<StakeDeregistration_Bool_Exp>;
};

export type QueryStakeDeregistrations_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<StakeDeregistration_Order_By>>;
  where?: InputMaybe<StakeDeregistration_Bool_Exp>;
};

export type QueryStakePoolsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<StakePool_Order_By>>;
  where?: InputMaybe<StakePool_Bool_Exp>;
};

export type QueryStakePools_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<StakePool_Order_By>>;
  where?: InputMaybe<StakePool_Bool_Exp>;
};

export type QueryStakeRegistrationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<StakeRegistration_Order_By>>;
  where?: InputMaybe<StakeRegistration_Bool_Exp>;
};

export type QueryStakeRegistrations_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<StakeRegistration_Order_By>>;
  where?: InputMaybe<StakeRegistration_Bool_Exp>;
};

export type QueryTokenMintsArgs = {
  distinct_on?: InputMaybe<Array<TokenMint_Aggregate_Distinct_On>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TokenMint_Order_By>>;
  where?: InputMaybe<TokenMint_Bool_Exp>;
};

export type QueryTokenMints_AggregateArgs = {
  distinct_on?: InputMaybe<Array<TokenMint_Aggregate_Distinct_On>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TokenMint_Order_By>>;
  where?: InputMaybe<TokenMint_Bool_Exp>;
};

export type QueryTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transaction_Order_By>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};

export type QueryTransactions_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transaction_Order_By>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};

export type QueryUtxosArgs = {
  distinct_on?: InputMaybe<Array<TransactionOutput_Distinct_On>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TransactionOutput_Order_By>>;
  where?: InputMaybe<TransactionOutput_Bool_Exp>;
};

export type QueryUtxos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<TransactionOutput_Distinct_On>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TransactionOutput_Order_By>>;
  where?: InputMaybe<TransactionOutput_Bool_Exp>;
};

export type QueryWithdrawalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Withdrawal_Order_By>>;
  where?: InputMaybe<Withdrawal_Bool_Exp>;
};

export type QueryWithdrawals_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Withdrawal_Order_By>>;
  where?: InputMaybe<Withdrawal_Bool_Exp>;
};

export type Redeemer = {
  __typename?: 'Redeemer';
  datum?: Maybe<Datum>;
  fee?: Maybe<Scalars['Lovelace']['output']>;
  index: Scalars['Int']['output'];
  purpose: Scalars['String']['output'];
  scriptHash: Scalars['Hash28Hex']['output'];
  transaction: Transaction;
  unitMem: Scalars['String']['output'];
  unitSteps: Scalars['String']['output'];
};

export type Redeemer_Aggregate = {
  __typename?: 'Redeemer_aggregate';
  aggregate?: Maybe<Redeemer_Aggregate_Fields>;
};

export type Redeemer_Aggregate_Fields = {
  __typename?: 'Redeemer_aggregate_fields';
  count: Scalars['String']['output'];
  max: Redeemer_Max_Fields;
  min: Redeemer_Min_Fields;
  sum: Redeemer_Sum_Fields;
};

export type Redeemer_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Redeemer_Bool_Exp>>>;
  _not?: InputMaybe<Redeemer_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Redeemer_Bool_Exp>>>;
  datum?: InputMaybe<Datum_Bool_Exp>;
  fee?: InputMaybe<Text_Comparison_Exp>;
  index?: InputMaybe<Int_Comparison_Exp>;
  purpose?: InputMaybe<Text_Comparison_Exp>;
  scriptHash?: InputMaybe<Text_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  unitMem?: InputMaybe<Text_Comparison_Exp>;
  unitSteps?: InputMaybe<Text_Comparison_Exp>;
};

export type Redeemer_Max_Fields = {
  __typename?: 'Redeemer_max_fields';
  fee?: Maybe<Scalars['String']['output']>;
  unitMem?: Maybe<Scalars['String']['output']>;
  unitSteps?: Maybe<Scalars['String']['output']>;
};

export type Redeemer_Min_Fields = {
  __typename?: 'Redeemer_min_fields';
  fee?: Maybe<Scalars['String']['output']>;
  unitMem?: Maybe<Scalars['String']['output']>;
  unitSteps?: Maybe<Scalars['String']['output']>;
};

export type Redeemer_Order_By = {
  purpose?: InputMaybe<Order_By>;
  scriptHash?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  unitMem?: InputMaybe<Order_By>;
  unitSteps?: InputMaybe<Order_By>;
};

export type Redeemer_Sum_Fields = {
  __typename?: 'Redeemer_sum_fields';
  fee?: Maybe<Scalars['String']['output']>;
  unitMem?: Maybe<Scalars['String']['output']>;
  unitSteps?: Maybe<Scalars['String']['output']>;
};

export type Relay = {
  __typename?: 'Relay';
  dnsName?: Maybe<Scalars['String']['output']>;
  dnsSrvName?: Maybe<Scalars['String']['output']>;
  ipv4?: Maybe<Scalars['IPv4']['output']>;
  ipv6?: Maybe<Scalars['IPv6']['output']>;
  port?: Maybe<Scalars['Int']['output']>;
};

export type Relay_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Relay_Bool_Exp>>>;
  _not?: InputMaybe<Relay_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Relay_Bool_Exp>>>;
  dnsName?: InputMaybe<Text_Comparison_Exp>;
  dnsSrvName?: InputMaybe<Text_Comparison_Exp>;
  ipv4?: InputMaybe<Text_Comparison_Exp>;
  ipv6?: InputMaybe<Text_Comparison_Exp>;
  port?: InputMaybe<Int_Comparison_Exp>;
};

export type Reward = {
  __typename?: 'Reward';
  address: Scalars['StakeAddress']['output'];
  amount: Scalars['Lovelace']['output'];
  earnedIn: Epoch;
  receivedIn?: Maybe<Epoch>;
  stakePool?: Maybe<StakePool>;
  type: Scalars['String']['output'];
};

export type Reward_Aggregate = {
  __typename?: 'Reward_aggregate';
  aggregate?: Maybe<Reward_Aggregate_Fields>;
};

export type Reward_Aggregate_Fields = {
  __typename?: 'Reward_aggregate_fields';
  count: Scalars['String']['output'];
  max: Reward_Max_Fields;
  min: Reward_Min_Fields;
  sum: Reward_Sum_Fields;
};

export type Reward_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Reward_Bool_Exp>>>;
  _not?: InputMaybe<Reward_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Reward_Bool_Exp>>>;
  address?: InputMaybe<StakeAddress_Comparison_Exp>;
  amount?: InputMaybe<Text_Comparison_Exp>;
  earnedIn?: InputMaybe<Epoch_Bool_Exp>;
  receivedIn?: InputMaybe<Epoch_Bool_Exp>;
  stakePool?: InputMaybe<StakePool_Bool_Exp>;
  type?: InputMaybe<Text_Comparison_Exp>;
};

export type Reward_Max_Fields = {
  __typename?: 'Reward_max_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type Reward_Min_Fields = {
  __typename?: 'Reward_min_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type Reward_Order_By = {
  address?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  earnedIn?: InputMaybe<Epoch_Order_By>;
  receivedIn?: InputMaybe<Epoch_Order_By>;
  stakePool?: InputMaybe<StakePool_Order_By>;
  type?: InputMaybe<Order_By>;
};

export type Reward_Sum_Fields = {
  __typename?: 'Reward_sum_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type Script = {
  __typename?: 'Script';
  hash: Scalars['Hash28Hex']['output'];
  serialisedSize?: Maybe<Scalars['Int']['output']>;
  transaction: Transaction;
  type: Scalars['String']['output'];
};

export type Script_Aggregate = {
  __typename?: 'Script_aggregate';
  aggregate?: Maybe<Script_Aggregate_Fields>;
};

export type Script_Aggregate_Fields = {
  __typename?: 'Script_aggregate_fields';
  count: Scalars['String']['output'];
  max: Script_Max_Fields;
  min: Script_Min_Fields;
  sum: Script_Sum_Fields;
};

export type Script_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Script_Bool_Exp>>>;
  _not?: InputMaybe<Script_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Script_Bool_Exp>>>;
  serialisedSize?: InputMaybe<Int_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  type?: InputMaybe<Text_Comparison_Exp>;
};

export type Script_Max_Fields = {
  __typename?: 'Script_max_fields';
  serialisedSize?: Maybe<Scalars['Int']['output']>;
};

export type Script_Min_Fields = {
  __typename?: 'Script_min_fields';
  serialisedSize?: Maybe<Scalars['Int']['output']>;
};

export type Script_Order_By = {
  serialisedSize?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  type?: InputMaybe<Order_By>;
};

export type Script_Sum_Fields = {
  __typename?: 'Script_sum_fields';
  serialisedSize?: Maybe<Scalars['BigInt']['output']>;
};

export type ShelleyGenesis = {
  __typename?: 'ShelleyGenesis';
  activeSlotsCoeff: Scalars['Float']['output'];
  epochLength: Scalars['Int']['output'];
  genDelegs?: Maybe<Scalars['JSONObject']['output']>;
  initialFunds: Scalars['JSONObject']['output'];
  maxKESEvolutions: Scalars['Int']['output'];
  maxLovelaceSupply: Scalars['Lovelace']['output'];
  networkId: Scalars['String']['output'];
  networkMagic: Scalars['Int']['output'];
  protocolParams: ShelleyProtocolParams;
  securityParam: Scalars['Int']['output'];
  slotLength: Scalars['Int']['output'];
  slotsPerKESPeriod: Scalars['Int']['output'];
  staking?: Maybe<ShelleyGenesisStaking>;
  systemStart: Scalars['String']['output'];
  updateQuorum: Scalars['Int']['output'];
};

export type ShelleyGenesisStaking = {
  __typename?: 'ShelleyGenesisStaking';
  pools: Scalars['JSONObject']['output'];
  stake: Scalars['JSONObject']['output'];
};

export type ShelleyProtocolParams = {
  __typename?: 'ShelleyProtocolParams';
  a0: Scalars['Float']['output'];
  decentralisationParam: Scalars['Float']['output'];
  eMax: Scalars['Int']['output'];
  extraEntropy?: Maybe<Scalars['JSONObject']['output']>;
  keyDeposit: Scalars['Lovelace']['output'];
  maxBlockBodySize: Scalars['Int']['output'];
  maxBlockHeaderSize: Scalars['Int']['output'];
  maxTxSize: Scalars['Int']['output'];
  minFeeA: Scalars['Int']['output'];
  minFeeB: Scalars['Int']['output'];
  minPoolCost: Scalars['Lovelace']['output'];
  minUTxOValue: Scalars['Lovelace']['output'];
  nOpt: Scalars['Int']['output'];
  poolDeposit: Scalars['Lovelace']['output'];
  protocolVersion: Scalars['JSONObject']['output'];
  rho: Scalars['Float']['output'];
  tau: Scalars['Float']['output'];
};

export type SlotLeader = {
  __typename?: 'SlotLeader';
  description: Scalars['String']['output'];
  hash: Scalars['Hash28Hex']['output'];
  stakePool?: Maybe<StakePool>;
};

export type SlotLeader_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<SlotLeader_Bool_Exp>>>;
  _not?: InputMaybe<SlotLeader_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<SlotLeader_Bool_Exp>>>;
  description?: InputMaybe<Text_Comparison_Exp>;
  hash?: InputMaybe<Hash28Hex_Comparison_Exp>;
  stakePool?: InputMaybe<StakePool_Bool_Exp>;
};

export type SlotLeader_Order_By = {
  hash?: InputMaybe<Order_By>;
  stakePool?: InputMaybe<StakePool_Order_By>;
};

export type StakeAddress_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['StakeAddress']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['StakeAddress']['input']>>>;
  _neq?: InputMaybe<Scalars['StakeAddress']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['StakeAddress']['input']>>>;
};

export type StakeDeregistration = {
  __typename?: 'StakeDeregistration';
  address: Scalars['StakeAddress']['output'];
  redeemer?: Maybe<Redeemer>;
  transaction: Transaction;
};

export type StakeDeregistration_Aggregate = {
  __typename?: 'StakeDeregistration_aggregate';
  aggregate?: Maybe<StakeDeregistration_Aggregate_Fields>;
};

export type StakeDeregistration_Aggregate_Fields = {
  __typename?: 'StakeDeregistration_aggregate_fields';
  count?: Maybe<Scalars['String']['output']>;
};

export type StakeDeregistration_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<StakeDeregistration_Bool_Exp>>>;
  _not?: InputMaybe<StakeDeregistration_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<StakeDeregistration_Bool_Exp>>>;
  address?: InputMaybe<StakeAddress_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
};

export type StakeDeregistration_Order_By = {
  address?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
};

export type StakePool = {
  __typename?: 'StakePool';
  activeStake: Array<Maybe<ActiveStake>>;
  activeStake_aggregate: ActiveStake_Aggregate;
  blocks: Array<Block>;
  blocks_aggregate: Block_Aggregate;
  delegators: Array<Maybe<Delegation>>;
  delegators_aggregate: Delegation_Aggregate;
  fixedCost: Scalars['Lovelace']['output'];
  hash: Scalars['Hash28Hex']['output'];
  id: Scalars['StakePoolID']['output'];
  margin: Scalars['Float']['output'];
  metadataHash?: Maybe<Scalars['Hash32Hex']['output']>;
  owners: Array<StakePoolOwner>;
  pledge: Scalars['Lovelace']['output'];
  relays?: Maybe<Array<Maybe<Relay>>>;
  retirements?: Maybe<Array<Maybe<StakePoolRetirement>>>;
  rewardAddress: Scalars['StakeAddress']['output'];
  rewards: Array<Maybe<Reward>>;
  rewards_aggregate: Reward_Aggregate;
  updatedIn: Transaction;
  url?: Maybe<Scalars['String']['output']>;
};

export type StakePoolActiveStakeArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ActiveStake_Order_By>>;
  where?: InputMaybe<ActiveStake_Bool_Exp>;
};

export type StakePoolActiveStake_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ActiveStake_Order_By>>;
  where?: InputMaybe<ActiveStake_Bool_Exp>;
};

export type StakePoolBlocksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};

export type StakePoolBlocks_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};

export type StakePoolDelegatorsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delegation_Order_By>>;
  where?: InputMaybe<Delegation_Bool_Exp>;
};

export type StakePoolDelegators_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delegation_Order_By>>;
  where?: InputMaybe<Delegation_Bool_Exp>;
};

export type StakePoolRewards_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reward_Order_By>>;
  where?: InputMaybe<Reward_Bool_Exp>;
};

export type StakePoolId_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['StakePoolID']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['StakePoolID']['input']>>>;
  _neq?: InputMaybe<Scalars['StakePoolID']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['StakePoolID']['input']>>>;
};

export type StakePoolOwner = {
  __typename?: 'StakePoolOwner';
  hash: Scalars['Hash28Hex']['output'];
};

export type StakePoolOwner_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<StakePoolOwner_Bool_Exp>>>;
  _not?: InputMaybe<StakePoolOwner_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<StakePoolOwner_Bool_Exp>>>;
  hash?: InputMaybe<Hash28Hex_Comparison_Exp>;
};

export type StakePoolRetirement = {
  __typename?: 'StakePoolRetirement';
  announcedIn?: Maybe<Transaction>;
  inEffectFrom: Scalars['Int']['output'];
  retiredInEpoch?: Maybe<Epoch>;
};

export type StakePoolRetirement_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<StakePoolRetirement_Bool_Exp>>>;
  _not?: InputMaybe<StakePoolRetirement_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<StakePoolRetirement_Bool_Exp>>>;
  announcedIn?: InputMaybe<Transaction_Bool_Exp>;
  inEffectFrom?: InputMaybe<Int_Comparison_Exp>;
};

export type StakePool_Aggregate = {
  __typename?: 'StakePool_aggregate';
  aggregate?: Maybe<StakePool_Aggregate_Fields>;
};

export type StakePool_Aggregate_Fields = {
  __typename?: 'StakePool_aggregate_fields';
  count: Scalars['String']['output'];
  max: StakePool_Max_Fields;
  min: StakePool_Min_Fields;
  sum: StakePool_Sum_Fields;
};

export type StakePool_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<StakePool_Bool_Exp>>>;
  _not?: InputMaybe<StakePool_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<StakePool_Bool_Exp>>>;
  hash?: InputMaybe<Hash28Hex_Comparison_Exp>;
  id?: InputMaybe<StakePoolId_Comparison_Exp>;
  margin?: InputMaybe<Float_Comparison_Exp>;
  metadataHash?: InputMaybe<Hash32Hex_Comparison_Exp>;
  owners?: InputMaybe<StakePoolOwner_Bool_Exp>;
  pledge?: InputMaybe<Text_Comparison_Exp>;
  registrationTransaction?: InputMaybe<Transaction_Bool_Exp>;
  relays?: InputMaybe<Relay_Bool_Exp>;
  retirements?: InputMaybe<StakePoolRetirement_Bool_Exp>;
  rewardAddress?: InputMaybe<Text_Comparison_Exp>;
  rewards?: InputMaybe<Reward_Bool_Exp>;
  url?: InputMaybe<Text_Comparison_Exp>;
};

export type StakePool_Max_Fields = {
  __typename?: 'StakePool_max_fields';
  fixedCost?: Maybe<Scalars['Lovelace']['output']>;
  margin?: Maybe<Scalars['Float']['output']>;
  pledge?: Maybe<Scalars['Lovelace']['output']>;
};

export type StakePool_Min_Fields = {
  __typename?: 'StakePool_min_fields';
  fixedCost?: Maybe<Scalars['Lovelace']['output']>;
  margin?: Maybe<Scalars['Float']['output']>;
  pledge?: Maybe<Scalars['Lovelace']['output']>;
};

export type StakePool_Order_By = {
  fixedCost?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  margin?: InputMaybe<Order_By>;
  pledge?: InputMaybe<Order_By>;
  updatedIn?: InputMaybe<Transaction_Order_By>;
  url?: InputMaybe<Order_By>;
};

export type StakePool_Sum_Fields = {
  __typename?: 'StakePool_sum_fields';
  fixedCost?: Maybe<Scalars['Lovelace']['output']>;
  margin?: Maybe<Scalars['Float']['output']>;
  pledge?: Maybe<Scalars['Lovelace']['output']>;
};

export type StakeRegistration = {
  __typename?: 'StakeRegistration';
  address: Scalars['StakeAddress']['output'];
  transaction: Transaction;
};

export type StakeRegistration_Aggregate = {
  __typename?: 'StakeRegistration_aggregate';
  aggregate?: Maybe<StakeRegistration_Aggregate_Fields>;
};

export type StakeRegistration_Aggregate_Fields = {
  __typename?: 'StakeRegistration_aggregate_fields';
  count?: Maybe<Scalars['String']['output']>;
};

export type StakeRegistration_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<StakeRegistration_Bool_Exp>>>;
  _not?: InputMaybe<StakeRegistration_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<StakeRegistration_Bool_Exp>>>;
  address?: InputMaybe<StakeAddress_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
};

export type StakeRegistration_Order_By = {
  address?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
};

export type Token = {
  __typename?: 'Token';
  asset: Asset;
  quantity: Scalars['String']['output'];
  transactionOutput: TransactionOutput;
};

export type TokenMint = {
  __typename?: 'TokenMint';
  asset: Asset;
  quantity: Scalars['String']['output'];
  transaction: Transaction;
};

export type TokenMint_Aggregate = {
  __typename?: 'TokenMint_aggregate';
  aggregate?: Maybe<TokenMint_Aggregate_Fields>;
  nodes: Array<TokenMint>;
};

export enum TokenMint_Aggregate_Distinct_On {
  AssetId = 'assetId',
  PolicyId = 'policyId',
}

export type TokenMint_Aggregate_Fields = {
  __typename?: 'TokenMint_aggregate_fields';
  count: Scalars['String']['output'];
  max: TokenMint_Max_Fields;
  min: TokenMint_Min_Fields;
  sum: TokenMint_Sum_Fields;
};

export type TokenMint_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<TokenMint_Bool_Exp>>>;
  _not?: InputMaybe<TokenMint_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<TokenMint_Bool_Exp>>>;
  asset?: InputMaybe<Asset_Bool_Exp>;
  quantity?: InputMaybe<Text_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
};

export type TokenMint_Max_Fields = {
  __typename?: 'TokenMint_max_fields';
  quantity?: Maybe<Scalars['String']['output']>;
};

export type TokenMint_Min_Fields = {
  __typename?: 'TokenMint_min_fields';
  quantity?: Maybe<Scalars['String']['output']>;
};

export type TokenMint_Order_By = {
  asset?: InputMaybe<Asset_Order_By>;
  quantity?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
};

export type TokenMint_Sum_Fields = {
  __typename?: 'TokenMint_sum_fields';
  quantity?: Maybe<Scalars['String']['output']>;
};

export type Token_Aggregate = {
  __typename?: 'Token_aggregate';
  aggregate?: Maybe<Token_Aggregate_Fields>;
  nodes: Array<Token>;
};

export type Token_Aggregate_Fields = {
  __typename?: 'Token_aggregate_fields';
  count: Scalars['String']['output'];
  max: Token_Max_Fields;
  min: Token_Min_Fields;
  sum: Token_Sum_Fields;
};

export type Token_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Token_Bool_Exp>>>;
  _not?: InputMaybe<Token_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Token_Bool_Exp>>>;
  asset?: InputMaybe<Asset_Bool_Exp>;
  quantity?: InputMaybe<Text_Comparison_Exp>;
  transactionOutput?: InputMaybe<TransactionOutput_Bool_Exp>;
};

export type Token_Max_Fields = {
  __typename?: 'Token_max_fields';
  quantity?: Maybe<Scalars['String']['output']>;
};

export type Token_Min_Fields = {
  __typename?: 'Token_min_fields';
  quantity?: Maybe<Scalars['String']['output']>;
};

export type Token_Order_By = {
  asset?: InputMaybe<Asset_Order_By>;
  quantity?: InputMaybe<Order_By>;
};

export type Token_Sum_Fields = {
  __typename?: 'Token_sum_fields';
  quantity?: Maybe<Scalars['String']['output']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  block?: Maybe<Block>;
  blockIndex: Scalars['Int']['output'];
  collateralInputs?: Maybe<Array<Maybe<CollateralInput>>>;
  collateralInputs_aggregate: CollateralInput_Aggregate;
  collateralOutputs?: Maybe<Array<Maybe<CollateralOutput>>>;
  collateralOutputs_aggregate: CollateralOutput_Aggregate;
  deposit: Scalars['Lovelace']['output'];
  fee: Scalars['Lovelace']['output'];
  hash: Scalars['Hash32Hex']['output'];
  includedAt: Scalars['DateTime']['output'];
  inputs: Array<TransactionInput>;
  inputs_aggregate: TransactionInput_Aggregate;
  invalidBefore?: Maybe<Scalars['String']['output']>;
  invalidHereafter?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Array<Maybe<TransactionMetadata>>>;
  mint: Array<Token>;
  mint_aggregate: Token_Aggregate;
  outputs: Array<Maybe<TransactionOutput>>;
  outputs_aggregate: TransactionOutput_Aggregate;
  redeemers?: Maybe<Array<Maybe<Redeemer>>>;
  referenceInputs: Array<TransactionInput>;
  referenceInputs_aggregate: TransactionInput_Aggregate;
  scriptSize: Scalars['Int']['output'];
  scripts?: Maybe<Array<Maybe<Script>>>;
  size: Scalars['Int']['output'];
  totalOutput: Scalars['Lovelace']['output'];
  validContract: Scalars['Boolean']['output'];
  withdrawals: Array<Maybe<Withdrawal>>;
  withdrawals_aggregate: Withdrawal_Aggregate;
};

export type TransactionCollateralInputsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<CollateralInput_Order_By>>>;
  where?: InputMaybe<CollateralInput_Bool_Exp>;
};

export type TransactionCollateralInputs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<CollateralInput_Order_By>>>;
  where?: InputMaybe<CollateralInput_Bool_Exp>;
};

export type TransactionCollateralOutputsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<CollateralOutput_Order_By>>>;
  where?: InputMaybe<CollateralOutput_Bool_Exp>;
};

export type TransactionCollateralOutputs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<CollateralOutput_Order_By>>>;
  where?: InputMaybe<CollateralOutput_Bool_Exp>;
};

export type TransactionInputsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<TransactionInput_Order_By>>>;
  where?: InputMaybe<TransactionInput_Bool_Exp>;
};

export type TransactionInputs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<TransactionInput_Order_By>>>;
  where?: InputMaybe<TransactionInput_Bool_Exp>;
};

export type TransactionMintArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<Token_Order_By>>>;
  where?: InputMaybe<Token_Bool_Exp>;
};

export type TransactionMint_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<Token_Order_By>>>;
  where?: InputMaybe<Token_Bool_Exp>;
};

export type TransactionOutputsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<TransactionOutput_Order_By>>>;
  where?: InputMaybe<TransactionOutput_Bool_Exp>;
};

export type TransactionOutputs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<TransactionOutput_Order_By>>>;
  where?: InputMaybe<TransactionOutput_Bool_Exp>;
};

export type TransactionReferenceInputsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<TransactionInput_Order_By>>>;
  where?: InputMaybe<TransactionInput_Bool_Exp>;
};

export type TransactionReferenceInputs_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<TransactionInput_Order_By>>>;
  where?: InputMaybe<TransactionInput_Bool_Exp>;
};

export type TransactionWithdrawals_AggregateArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<InputMaybe<Withdrawal_Order_By>>>;
  where?: InputMaybe<Withdrawal_Bool_Exp>;
};

export type TransactionInput = {
  __typename?: 'TransactionInput';
  address: Scalars['String']['output'];
  redeemer?: Maybe<Redeemer>;
  sourceTransaction: Transaction;
  sourceTxHash: Scalars['Hash32Hex']['output'];
  sourceTxIndex: Scalars['Int']['output'];
  tokens: Array<Maybe<Token>>;
  tokens_aggregate: Token_Aggregate;
  transaction: Transaction;
  txHash: Scalars['Hash32Hex']['output'];
  value: Scalars['Lovelace']['output'];
};

export type TransactionInput_Aggregate = {
  __typename?: 'TransactionInput_aggregate';
  aggregate?: Maybe<TransactionInput_Aggregate_Fields>;
};

export type TransactionInput_Aggregate_Fields = {
  __typename?: 'TransactionInput_aggregate_fields';
  count: Scalars['String']['output'];
  max: TransactionInput_Max_Fields;
  min: TransactionInput_Min_Fields;
  sum: TransactionInput_Sum_Fields;
};

export type TransactionInput_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<TransactionInput_Bool_Exp>>>;
  _not?: InputMaybe<TransactionInput_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<TransactionInput_Bool_Exp>>>;
  address?: InputMaybe<Text_Comparison_Exp>;
  sourceTransaction?: InputMaybe<Transaction_Bool_Exp>;
  tokens?: InputMaybe<Token_Bool_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  value?: InputMaybe<Text_Comparison_Exp>;
};

export type TransactionInput_Max_Fields = {
  __typename?: 'TransactionInput_max_fields';
  tokens?: Maybe<Token_Max_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type TransactionInput_Min_Fields = {
  __typename?: 'TransactionInput_min_fields';
  tokens?: Maybe<Token_Min_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type TransactionInput_Order_By = {
  address?: InputMaybe<Order_By>;
  sourceTxHash?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  txHash?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

export type TransactionInput_Sum_Fields = {
  __typename?: 'TransactionInput_sum_fields';
  tokens?: Maybe<Token_Sum_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type TransactionMetadata = {
  __typename?: 'TransactionMetadata';
  key: Scalars['String']['output'];
  value: Scalars['JSON']['output'];
};

export type TransactionMetadata_Bool_Exp = {
  key?: InputMaybe<Text_Comparison_Exp>;
};

export type TransactionOutput = {
  __typename?: 'TransactionOutput';
  address: Scalars['String']['output'];
  addressHasScript: Scalars['Boolean']['output'];
  datum?: Maybe<Datum>;
  index: Scalars['Int']['output'];
  paymentCredential?: Maybe<Scalars['Hash28Hex']['output']>;
  script?: Maybe<Script>;
  tokens: Array<Token>;
  tokens_aggregate: Token_Aggregate;
  transaction: Transaction;
  txHash: Scalars['Hash32Hex']['output'];
  value: Scalars['Lovelace']['output'];
};

export type TransactionOutput_Aggregate = {
  __typename?: 'TransactionOutput_aggregate';
  aggregate?: Maybe<TransactionOutput_Aggregate_Fields>;
};

export type TransactionOutput_Aggregate_Fields = {
  __typename?: 'TransactionOutput_aggregate_fields';
  count: Scalars['String']['output'];
  max: TransactionOutput_Max_Fields;
  min: TransactionOutput_Min_Fields;
  sum: TransactionOutput_Sum_Fields;
};

export type TransactionOutput_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<TransactionOutput_Bool_Exp>>>;
  _not?: InputMaybe<TransactionOutput_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<TransactionOutput_Bool_Exp>>>;
  address?: InputMaybe<Text_Comparison_Exp>;
  addressHasScript?: InputMaybe<Boolean_Comparison_Exp>;
  datum?: InputMaybe<Datum_Bool_Exp>;
  index?: InputMaybe<Int_Comparison_Exp>;
  script?: InputMaybe<Script_Bool_Exp>;
  tokens?: InputMaybe<Token_Bool_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  value?: InputMaybe<Text_Comparison_Exp>;
};

export enum TransactionOutput_Distinct_On {
  Address = 'address',
}

export type TransactionOutput_Max_Fields = {
  __typename?: 'TransactionOutput_max_fields';
  tokens?: Maybe<Token_Max_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type TransactionOutput_Min_Fields = {
  __typename?: 'TransactionOutput_min_fields';
  tokens?: Maybe<Token_Min_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type TransactionOutput_Order_By = {
  address?: InputMaybe<Order_By>;
  addressHasScript?: InputMaybe<Order_By>;
  datum?: InputMaybe<Transaction_Order_By>;
  index?: InputMaybe<Order_By>;
  txHash?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

export type TransactionOutput_Sum_Fields = {
  __typename?: 'TransactionOutput_sum_fields';
  tokens?: Maybe<Token_Sum_Fields>;
  value?: Maybe<Scalars['Lovelace']['output']>;
};

export type TransactionSubmitResponse = {
  __typename?: 'TransactionSubmitResponse';
  hash: Scalars['String']['output'];
};

export type Transaction_Aggregate = {
  __typename?: 'Transaction_aggregate';
  aggregate?: Maybe<Transaction_Aggregate_Fields>;
};

export type Transaction_Aggregate_Fields = {
  __typename?: 'Transaction_aggregate_fields';
  count: Scalars['String']['output'];
  max: Transaction_Max_Fields;
  min: Transaction_Min_Fields;
  sum: Transaction_Sum_Fields;
};

export type Transaction_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Transaction_Bool_Exp>>>;
  _not?: InputMaybe<Transaction_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Transaction_Bool_Exp>>>;
  block?: InputMaybe<Block_Bool_Exp>;
  blockIndex?: InputMaybe<Int_Comparison_Exp>;
  collateral?: InputMaybe<TransactionInput_Bool_Exp>;
  deposit?: InputMaybe<Text_Comparison_Exp>;
  fee?: InputMaybe<Text_Comparison_Exp>;
  hash?: InputMaybe<Hash32Hex_Comparison_Exp>;
  includedAt?: InputMaybe<Date_Comparison_Exp>;
  inputs?: InputMaybe<TransactionInput_Bool_Exp>;
  invalidBefore?: InputMaybe<Text_Comparison_Exp>;
  invalidHereafter?: InputMaybe<Text_Comparison_Exp>;
  metadata?: InputMaybe<TransactionMetadata_Bool_Exp>;
  mint?: InputMaybe<Token_Bool_Exp>;
  outputs?: InputMaybe<TransactionOutput_Bool_Exp>;
  scriptSize?: InputMaybe<Int_Comparison_Exp>;
  size?: InputMaybe<Int_Comparison_Exp>;
  totalOutput?: InputMaybe<Text_Comparison_Exp>;
  validContract?: InputMaybe<Boolean_Comparison_Exp>;
  withdrawals?: InputMaybe<Withdrawal_Bool_Exp>;
};

export type Transaction_Max_Fields = {
  __typename?: 'Transaction_max_fields';
  deposit?: Maybe<Scalars['Lovelace']['output']>;
  fee?: Maybe<Scalars['Lovelace']['output']>;
  invalidBefore?: Maybe<Scalars['String']['output']>;
  invalidHereafter?: Maybe<Scalars['String']['output']>;
  mint?: Maybe<Token_Max_Fields>;
  scriptSize?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  totalOutput?: Maybe<Scalars['Lovelace']['output']>;
  withdrawals?: Maybe<Withdrawal_Max_Fields>;
};

export type Transaction_Min_Fields = {
  __typename?: 'Transaction_min_fields';
  deposit?: Maybe<Scalars['Lovelace']['output']>;
  fee?: Maybe<Scalars['Lovelace']['output']>;
  invalidBefore?: Maybe<Scalars['String']['output']>;
  invalidHereafter?: Maybe<Scalars['String']['output']>;
  mint?: Maybe<Token_Min_Fields>;
  scriptSize?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  totalOutput?: Maybe<Scalars['Lovelace']['output']>;
  withdrawals?: Maybe<Withdrawal_Min_Fields>;
};

export type Transaction_Order_By = {
  block?: InputMaybe<Block_Order_By>;
  blockIndex?: InputMaybe<Order_By>;
  deposit?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  includedAt?: InputMaybe<Order_By>;
  invalidBefore?: InputMaybe<Order_By_With_Nulls>;
  invalidHereafter?: InputMaybe<Order_By_With_Nulls>;
  scriptSize?: InputMaybe<Order_By_With_Nulls>;
  size?: InputMaybe<Order_By>;
  totalOutput?: InputMaybe<Order_By>;
  validContract?: InputMaybe<Order_By>;
  withdrawals?: InputMaybe<Order_By>;
};

export type Transaction_Sum_Fields = {
  __typename?: 'Transaction_sum_fields';
  deposit?: Maybe<Scalars['Lovelace']['output']>;
  fee?: Maybe<Scalars['Lovelace']['output']>;
  mint?: Maybe<Token_Sum_Fields>;
  scriptSize?: Maybe<Scalars['BigInt']['output']>;
  size?: Maybe<Scalars['BigInt']['output']>;
  totalOutput?: Maybe<Scalars['Lovelace']['output']>;
  withdrawals?: Maybe<Withdrawal_Sum_Fields>;
};

export type VrfVerificationKey_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['VRFVerificationKey']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['VRFVerificationKey']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['VRFVerificationKey']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['VRFVerificationKey']['input']>>>;
};

export type Withdrawal = {
  __typename?: 'Withdrawal';
  address: Scalars['StakeAddress']['output'];
  amount: Scalars['Lovelace']['output'];
  redeemer?: Maybe<Redeemer>;
  transaction: Transaction;
};

export type Withdrawal_Aggregate = {
  __typename?: 'Withdrawal_aggregate';
  aggregate: Withdrawal_Aggregate_Fields;
};

export type Withdrawal_Aggregate_Fields = {
  __typename?: 'Withdrawal_aggregate_fields';
  count: Scalars['String']['output'];
  max: Withdrawal_Max_Fields;
  min: Withdrawal_Min_Fields;
  sum: Withdrawal_Sum_Fields;
};

export type Withdrawal_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Withdrawal_Bool_Exp>>>;
  _not?: InputMaybe<Withdrawal_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Withdrawal_Bool_Exp>>>;
  address?: InputMaybe<StakeAddress_Comparison_Exp>;
  amount?: InputMaybe<Text_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
};

export type Withdrawal_Max_Fields = {
  __typename?: 'Withdrawal_max_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type Withdrawal_Min_Fields = {
  __typename?: 'Withdrawal_min_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export type Withdrawal_Order_By = {
  address?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
};

export type Withdrawal_Sum_Fields = {
  __typename?: 'Withdrawal_sum_fields';
  amount?: Maybe<Scalars['Lovelace']['output']>;
};

export enum Order_By {
  Asc = 'asc',
  Desc = 'desc',
}

export enum Order_By_With_Nulls {
  Asc = 'asc',
  AscNullsFirst = 'asc_nulls_first',
  AscNullsLast = 'asc_nulls_last',
  Desc = 'desc',
  DescNullsFirst = 'desc_nulls_first',
  DescNullsLast = 'desc_nulls_last',
}

export type Text_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _nlike?: InputMaybe<Scalars['String']['input']>;
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  _similar?: InputMaybe<Scalars['String']['input']>;
};

export type CurrentHeightQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentHeightQuery = {
  __typename?: 'Query';
  cardano: {
    __typename?: 'Cardano';
    tip: { __typename?: 'Block'; number?: number | null };
  };
};

export type BlockInfoQueryVariables = Exact<{
  where?: InputMaybe<Block_Bool_Exp>;
}>;

export type BlockInfoQuery = {
  __typename?: 'Query';
  blocks: Array<{
    __typename?: 'Block';
    hash: any;
    number?: number | null;
    forgedAt: any;
    previousBlock?: { __typename?: 'Block'; hash: any } | null;
  } | null>;
};

export type BlockTxsQueryVariables = Exact<{
  where?: InputMaybe<Block_Bool_Exp>;
}>;

export type BlockTxsQuery = {
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
