interface ResponseEntry {
  result?: unknown;
  error?: { code: number; message: string };
}

/**
 * Minimal TLS-socket stand-in used by ElectrumXSocket tests. Holds registered
 * event handlers and a FIFO queue of JSON-RPC responses per method name.
 */
export class ElectrumXSocketMock {
  private handlers = new Map<string, (...args: unknown[]) => void>();
  responses = new Map<string, ResponseEntry[]>();

  /**
   * Registers a handler for the given socket event (e.g. `'data'`).
   */
  on = (event: string, fn: (...args: unknown[]) => void): void => {
    this.handlers.set(event, fn);
  };

  /**
   * Parses each newline-delimited JSON-RPC request, pops the next queued
   * response for that method and delivers it to the `'data'` handler.
   * Throws if no response is queued for the method or no `'data'` handler
   * has been registered.
   */
  write = (data: string): boolean => {
    const lines = data.split('\n').filter((l) => l.trim().length > 0);
    for (const line of lines) {
      const req = JSON.parse(line);
      const queue = this.responses.get(req.method);
      if (!queue || queue.length === 0) {
        throw new Error(`Method [${req.method}] is not mocked`);
      }
      const entry = queue.shift()!;
      const response = JSON.stringify({
        jsonrpc: '2.0',
        id: req.id,
        ...entry,
      });
      const dataHandler = this.handlers.get('data');
      if (dataHandler)
        setTimeout(() => dataHandler(Buffer.from(response + '\n'))); // used setTimeout to simulate async behavior
      else throw new Error(`The "data" event is not registered!`);
    }
    return true;
  };
}

export let mockedSocket = new ElectrumXSocketMock();

/**
 * Queues a successful JSON-RPC `result` to be returned for the next call to
 * `method`.
 */
export const mockSocketResult = (method: string, result: unknown): void => {
  const queue = mockedSocket.responses.get(method) ?? [];
  queue.push({ result });
  mockedSocket.responses.set(method, queue);
};

/**
 * Queues a JSON-RPC `error` to be returned for the next call to `method`.
 */
export const mockSocketError = (
  method: string,
  error: { code: number; message: string },
): void => {
  const queue = mockedSocket.responses.get(method) ?? [];
  queue.push({ error });
  mockedSocket.responses.set(method, queue);
};

/**
 * Replaces the shared `mockedSocket` with a fresh instance, clearing all
 * registered handlers and queued responses.
 */
export const resetSocketMock = () => (mockedSocket = new ElectrumXSocketMock());
