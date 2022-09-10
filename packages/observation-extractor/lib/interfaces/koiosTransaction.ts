
interface PaymentAddr {
    bech32: string;
    cred: string;
}

interface Asset {
    policy_id: string;
    asset_name: string;
    quantity: string;
}

interface UTXO {
    payment_addr: PaymentAddr;
    stake_addr?: string | null;
    tx_hash: string;
    tx_index: number;
    value: string;
    asset_list: Array<Asset>
}

interface MetaData {
    key: string;
    json: JSON;
}

interface KoiosTransaction {
    tx_hash: string;
    block_hash: string;
    inputs: Array<UTXO>;
    outputs: Array<UTXO>;
    metadata?: Array<MetaData>;
}

export {
    KoiosTransaction,
    MetaData
}
