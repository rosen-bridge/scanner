import { AbstractNetworkConnector, Block } from '../../../interfaces';
import axios, { AxiosInstance } from 'axios';
import { NodeBlock, Transaction } from './types';
import { JsonBI } from './parser';

export class ErgoNetworkApi extends AbstractNetworkConnector<Transaction> {
  private readonly url: string;
  private readonly timeout: number;
  private node: AxiosInstance;

  constructor(url: string, timeout: number) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.node = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
    });
  }

  getBlockAtHeight = (height: number): Promise<Block> => {
    return this.node
      .get<Array<{ id: string }>>(`/blocks/chainSlice`, {
        params: { fromHeight: height - 2, toHeight: height },
      })
      .then((res) => {
        return {
          hash: res.data[1].id,
          blockHeight: height,
          parentHash: res.data[0].id,
        };
      });
  };

  getCurrentHeight = (): Promise<number> => {
    return this.node.get<{ fullHeight: number }>(`/info`).then((res) => {
      return res.data.fullHeight;
    });
  };

  getBlockTxs = (blockHash: string): Promise<Array<Transaction>> => {
    return this.node
      .get<NodeBlock>(`/blocks/${blockHash}/transactions`, {
        transformResponse: (data) => JsonBI.parse(data),
      })
      .then((res) => res.data.transactions);
  };
}
