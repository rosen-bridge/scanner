import { createServer, type Server } from 'node:http';

export interface RpcRequest {
  jsonrpc: unknown;
  id: unknown;
  method: string;
  params: unknown[];
}

export type RpcReply = Record<string, unknown> & {
  omitDefaultResult?: boolean;
  httpStatus?: number;
  headers?: Record<string, string>;
};

export interface RpcHarness {
  url: string;
  requests: RpcRequest[];
  close: () => Promise<void>;
}

export const startRpcHarness = async (
  responder: (request: RpcRequest) => RpcReply | Promise<RpcReply>,
): Promise<RpcHarness> => {
  const requests: RpcRequest[] = [];
  const server: Server = createServer(async (request, response) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const body = JSON.parse(
        Buffer.concat(chunks).toString('utf8'),
      ) as RpcRequest;
      requests.push(body);
      const supplied = await responder(body);
      const { omitDefaultResult, httpStatus, headers, ...reply } = supplied;
      const envelope: Record<string, unknown> = {
        jsonrpc: '2.0',
        id: body.id,
        error: null,
        ...reply,
      };
      if (
        !omitDefaultResult &&
        !Object.prototype.hasOwnProperty.call(envelope, 'result')
      ) {
        envelope.result = null;
      }
      response.writeHead(httpStatus ?? 200, {
        'content-type': 'application/json',
        ...headers,
      });
      response.end(JSON.stringify(envelope));
    } catch (error) {
      response.writeHead(500, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: String(error) }));
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('RPC harness did not obtain a TCP address');
  }

  return {
    url: `http://127.0.0.1:${address.port}/`,
    requests,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};
