export interface Block{
    parent_hash: string,
    hash: string,
    block_height: number,
}

export interface BlockData{
    hash: string,
    parent_hash: string,
}
