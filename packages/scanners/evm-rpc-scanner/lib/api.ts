import { JsonRpcProvider } from 'ethers';

const rpcClientFactory = {
  generate: (url: string, authToken?: string) => {
    return authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);
  },
};
export { rpcClientFactory };
