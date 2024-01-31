interface TransactionFee {
  gas_limit: bigint;
  gas_price: bigint;
  maxPriorityFeePerGas: bigint | null;
  maxFeePerGas: bigint | null;
}

interface RPCTransaction {
  tx_hash: string;
  block_hash: string | null;
  block_height: number | null;
  tx_block_index: number;
  value: bigint;
  fee: TransactionFee;
  nonce: number;
  type: number;
  from: string;
  to: string | null;
  input_data: string;
}

export { RPCTransaction };
