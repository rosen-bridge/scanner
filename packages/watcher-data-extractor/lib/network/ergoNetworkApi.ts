import axios, { AxiosInstance } from 'axios';
import { AddressBoxes } from '../interfaces/types';
import { JsonBI } from './parser';

class ExplorerApi {
  api: AxiosInstance;

  constructor(explorerAddress: string) {
    this.api = axios.create({
      baseURL: explorerAddress,
      timeout: 10000,
    });
  }

  /**
   * gets unspent boxes for a specific ergotree with default limit of 100 and offset 0
   * @param tree
   * @param offset
   * @param limit
   */
  getBoxesForAddress = async (
    tree: string,
    offset = 0,
    limit = 100
  ): Promise<AddressBoxes> => {
    return this.api
      .get<AddressBoxes>(`/api/v1/boxes/unspent/byErgoTree/${tree}`, {
        params: { offset: offset, limit: limit },
        transformResponse: (data) => JsonBI.parse(data),
      })
      .then((res) => res.data);
  };
}

export { ExplorerApi };
