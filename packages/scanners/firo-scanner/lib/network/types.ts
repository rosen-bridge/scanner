export interface ElectrumXResponse<Result> {
  jsonrpc: '2.0';
  id: string;
  result?: Result;
  error?: {
    code: number;
    message: string;
  };
}

export interface BlockchainHeaderSubscribeResult {
  hex: string;
  height: number;
}

export type RequestResolve<Result> = (value: Result) => void;
export type RequestReject = (reason?: unknown) => void;
export interface RequestType<Result> {
  method: string;
  params: Array<unknown>;
  resolve: RequestResolve<Result>;
  reject: RequestReject;
  timeout: NodeJS.Timeout; // eslint-disable-line no-undef
}

export enum SocketConnectionStatus {
  NO_CONNECTION,
  IN_PROGRESS,
  CONNECTED,
}

export class TimeoutError extends Error {
  constructor(id: string, method: string, params: unknown[]) {
    super(
      `TimeoutError: Request [${id}] timed out (on method [${method}] with params [${params.join(',')}])`,
    );
  }
}
