import { randomBytes } from 'node:crypto';
import * as tls from 'node:tls';

import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import {
  ElectrumXResponse,
  RequestType,
  RequestResolve,
  RequestReject,
  TimeoutError,
  SocketConnectionStatus,
} from './types';

export class ElectrumXSocket {
  private socket: tls.TLSSocket | null = null;
  private host: string;
  private port: number;
  private timeout: number; // in seconds
  private reconnectDelay: number; // in seconds
  private reconnectSocket = false;
  private connectionStatus = SocketConnectionStatus.NO_CONNECTION;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private activeRequests: Map<string, RequestType<any>> = new Map();
  private dataBuffer: string = '';
  protected logger: AbstractLogger;

  constructor(
    host: string,
    port: number,
    reconnectDelay = 5,
    timeout = 10,
    logger: AbstractLogger = new DummyLogger(),
  ) {
    this.host = host;
    this.port = port;
    this.reconnectDelay = reconnectDelay;
    this.timeout = timeout;
    this.logger = logger;
  }

  /**
   * Opens a TLS connection to the ElectrumX server, wires up data/error/close
   * lifecycle handlers, sends an initial `server.version` handshake and then
   * resends any requests that were queued before the connection became ready.
   * On `close`, reconnection is automatically scheduled unless `disconnect`
   * was called.
   */
  setupSocket = (): void => {
    if (this.connectionStatus > SocketConnectionStatus.NO_CONNECTION)
      throw new Error(
        `Socket is already active (status: ${this.connectionStatus})`,
      );
    this.connectionStatus = SocketConnectionStatus.IN_PROGRESS;
    this.socket = tls.connect({
      host: this.host,
      port: this.port,
    });
    this.logger.debug(`Socket connection initiated`);
    this.reconnectSocket = true;
    this.dataBuffer = '';

    // add handler on 'secureConnect' signal
    this.socket.on('secureConnect', () => {
      this.logger.info(`Socket connection established`);
    });

    // add handler on 'data' signal
    this.socket.on('data', async (newData: Buffer) => {
      this.logger.trace(`Data received (hex): ${newData.toString('hex')}`);
      const data = this.dataBuffer + newData.toString();

      const responses = data.split('\n');
      this.dataBuffer = responses.at(-1)!;
      responses
        .slice(0, -1)
        .forEach((response) => this.processResponse(response));
    });

    // add handler on 'error' signal
    this.socket.on('error', async (error: Error) => {
      // Only log in this case. The 'close' event is emitted directly after this.
      this.logger.error(`Received error signal: ${error}`);
      if (error.stack) this.logger.error(error.stack);
    });

    // add handler on 'close' signal
    this.socket.on('close', () => {
      this.logger.info(`Socket closed`);
      this.connectionStatus = SocketConnectionStatus.NO_CONNECTION;
      if (!this.reconnectSocket) {
        this.logger.info(`Socket reconnect is off`);
        return;
      }
      setTimeout(() => {
        this.logger.debug(`Reconnecting socket`);
        this.socket = tls.connect({
          host: this.host,
          port: this.port,
        });
        this.setupSocket();
      }, this.reconnectDelay * 1000);
      this.logger.info(`Scheduled reconnect for ${this.reconnectDelay}s`);
    });

    // add handler on 'end' signal
    this.socket.on('end', () => {
      // Only log in this case. When socket is fully closed, the 'close' event is emitted.
      this.logger.warn(`Socket connection is ended`);
    });

    // send version
    this.sendRequest<string[]>(
      'server.version',
      ['FiroElectrumXSocket', '1.4'],
      true,
    ).then((result) => {
      this.logger.info(
        `Connected to Firo ElectrumX. Received parameters: [${result.join(',')}]`,
      );
      this.connectionStatus = SocketConnectionStatus.CONNECTED;
      this.resendAllRequests();
    });
  };

  /**
   * Disables auto-reconnect and gracefully closes the underlying TLS socket.
   * @throws if the socket has not been initialized via `setupSocket`
   */
  disconnect = (): void => {
    if (!this.socket)
      throw new Error(
        `Socket is not initialized. Make sure "setupSocket" is called.`,
      );
    this.reconnectSocket = false;
    this.socket.end();
    this.logger.info(`Socket disconnected`);
    this.connectionStatus = SocketConnectionStatus.NO_CONNECTION;
  };

  /**
   * Sends a JSON-RPC request over the socket and returns a Promise that
   * resolves with the server's `result`. If the socket is not yet connected,
   * the request is queued and will be flushed when the connection is ready
   * (see {@link resendAllRequests}). A per-request timeout is started immediately
   * regardless of connection state.
   * @param method JSON-RPC method name
   * @param params JSON-RPC parameters
   * @param ignoreConnection if true, write to the socket even when the
   *   connection is not yet in the `CONNECTED` state (used by the initial
   *   `server.version` handshake)
   * @returns the JSON-RPC `result` field
   */
  sendRequest = async <Result>(
    method: string,
    params: unknown[],
    ignoreConnection = false,
  ): Promise<Result> => {
    const id = this.generateRandomId();
    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: id,
      method: method,
      params: params,
    });

    return new Promise<Result>((resolve, reject) => {
      this.storeRequest<Result>(id, method, params, resolve, reject);

      if (!this.socket) {
        reject(`Socket is not initialized. Make sure "setupSocket" is called.`);
        return;
      }
      if (
        ignoreConnection ||
        this.connectionStatus === SocketConnectionStatus.CONNECTED
      ) {
        try {
          this.socket.write(request + '\n');
        } catch (err) {
          this.clearRequest(id);
          reject(
            `An error occurred while sending request [${id}] (on method [${method}] with params [${params.join(',')}]): ${err}`,
          );
        }
      }
    });
  };

  private generateRandomId = () => randomBytes(32).toString('hex');

  /**
   * Parses a single newline-delimited JSON-RPC response, resolves the
   * matching pending request and removes it from the active set. Malformed
   * payloads and responses with no matching request id are logged and
   * dropped.
   * @param data raw JSON-RPC response string (without trailing newline)
   */
  private processResponse = (data: string): void => {
    this.logger.debug(`Trying to parse response: ${data}`);
    let response: ElectrumXResponse<unknown>;
    try {
      response = JSON.parse(data.toString());
    } catch (e: unknown) {
      this.logger.error(`Failed to parse response to JSON. Reason: ${e}`);
      return;
    }

    if (typeof response.id !== 'string') {
      this.logger.warn(
        `Ignored response with unexpected id [${response.id}]: ${JSON.stringify(response)}`,
      );
      return;
    }

    const request = this.activeRequests.get(response.id);
    if (!request) {
      this.logger.warn(
        `Parsed response with id [${response.id}] but no request is found for it. Data: ${data}`,
      );
    } else {
      this.activeRequests.delete(response.id);
      if (response.result) request.resolve(response.result);
      else request.reject(response.error);
    }
  };

  /**
   * Tracks a pending request so its response can be matched by id, and arms
   * a timeout that rejects with `TimeoutError` if no response arrives within
   * `this.timeout` seconds.
   * @param id JSON-RPC request id
   * @param method JSON-RPC method name (kept for resend and error reporting)
   * @param params JSON-RPC parameters (kept for resend and error reporting)
   * @param resolve resolver of the request's Promise
   * @param reject rejecter of the request's Promise
   */
  private storeRequest = <Result>(
    id: string,
    method: string,
    params: unknown[],
    resolve: RequestResolve<Result>,
    reject: RequestReject,
  ): void => {
    const timeout = setTimeout(() => {
      this.activeRequests.delete(id);
      reject(new TimeoutError(id, method, params));
    }, this.timeout * 1000);
    this.activeRequests.set(id, {
      method: method,
      params: params,
      resolve,
      reject,
      timeout,
    });
  };

  /**
   * Cancels the timeout for a stored request and removes it from the active
   * set. No-op (with a debug log) when no matching request is found.
   * @param id JSON-RPC request id
   */
  private clearRequest = (id: string): void => {
    const request = this.activeRequests.get(id);
    if (!request) {
      this.logger.debug(`No request is found with id [${id}]`);
      return;
    }
    clearTimeout(request.timeout);
    this.activeRequests.delete(id);
  };

  /**
   * Re-writes every currently active request to the socket. Used after a
   * (re)connect to flush requests that were queued while disconnected.
   *
   * Note: this does NOT renew the per-request timeout — each request's
   * original timer (armed in `storeRequest`) continues to run, so requests
   * that have been pending for close to `this.timeout` seconds may still
   * reject with `TimeoutError` shortly after being resent.
   */
  private resendAllRequests = (): void => {
    for (const [id, requestObject] of this.activeRequests.entries()) {
      const request = JSON.stringify({
        jsonrpc: '2.0',
        id: id,
        method: requestObject.method,
        params: requestObject.params,
      });
      try {
        if (!this.socket)
          throw new Error(`ImpossibleBehavior: Socket is not initialized`);
        this.socket.write(request + '\n');
      } catch (err) {
        this.clearRequest(id);
        requestObject.reject(
          `An error occurred while resending request [${id}] (on method [${requestObject.method}] with params [${requestObject.params.join(',')}]): ${err}`,
        );
      }
    }
  };
}
