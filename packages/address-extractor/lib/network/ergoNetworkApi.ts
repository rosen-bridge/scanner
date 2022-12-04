import axios, { AxiosInstance } from 'axios';
import { Boxes } from '../interfaces/types';
import { JsonBI } from './parser';

export class ExplorerApi {
  api: AxiosInstance;

  constructor(explorerAddress: string, timeout?: number) {
    this.api = axios.create({
      baseURL: explorerAddress,
      timeout: timeout ? timeout : 10000,
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
  ): Promise<Boxes> => {
    return this.api
      .get<Boxes>(`/api/v1/boxes/unspent/byErgoTree/${tree}`, {
        params: { offset: offset, limit: limit },
        transformResponse: (data) => JsonBI.parse(data),
      })
      .then((res) => res.data);
  };

  /**
   * gets boxes containing tokenId
   * @param tokenId the address ergoTree
   * @param offset
   * @param limit
   */
  getBoxesByTokenId = async (
    tokenId: string,
    offset = 0,
    limit = 100
  ): Promise<Boxes> => {
    return this.api
      .get<Boxes>(`/v1/boxes/unspent/byTokenId/${tokenId}`, {
        params: { offset: offset, limit: limit },
        transformResponse: (data) => JsonBI.parse(data),
      })
      .then((res) => res.data)
      .catch((e) => {
        console.log(
          `An error occurred while getting boxes containing token [${tokenId}] from Ergo Explorer: [${e}]`
        );
        return {
          items: [],
          total: 0,
        };
      });
  };
}
