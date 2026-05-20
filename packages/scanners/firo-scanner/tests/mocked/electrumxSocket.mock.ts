import { EventEmitter } from 'events';
import { vi } from 'vitest';

/**
 * Creates a mock net.Socket that auto-responds to ElectrumX JSON-RPC requests.
 *
 * The socket's write() parses each JSON-RPC line, looks up a response in the
 * provided `responses` map (keyed by method name), and emits the response
 * as a 'data' event.
 */
export function createMockSocket(
  responses: Map<string, unknown>,
): EventEmitter & { written: string[]; destroyed: boolean } {
  const socket = new EventEmitter() as EventEmitter & {
    written: string[];
    destroyed: boolean;
    write: (data: string) => boolean;
    destroy: () => void;
    setEncoding: () => void;
    setNoDelay: () => void;
    setKeepAlive: () => void;
    setTimeout: () => void;
    end: () => void;
    ref: () => void;
    unref: () => void;
    connecting: boolean;
  };

  socket.written = [];
  socket.destroyed = false;
  socket.connecting = false;

  socket.write = (data: string) => {
    socket.written.push(data);

    // Parse JSON-RPC request and auto-respond
    const lines = data.split('\n').filter((l) => l.trim());
    for (const line of lines) {
      try {
        const req = JSON.parse(line);
        const responseData = responses.get(req.method);
        if (responseData !== undefined) {
          const response = JSON.stringify({
            jsonrpc: '2.0',
            id: req.id,
            result: responseData,
          });
          // Use setTimeout so the response arrives after write returns
          setTimeout(() => {
            socket.emit('data', Buffer.from(response + '\n'));
          });
        }
      } catch {
        // ignore parse errors
      }
    }
    return true;
  };

  socket.destroy = () => {
    socket.destroyed = true;
  };

  socket.setEncoding = vi.fn();
  socket.setNoDelay = vi.fn();
  socket.setKeepAlive = vi.fn();
  socket.setTimeout = vi.fn();
  socket.end = vi.fn();
  socket.ref = vi.fn();
  socket.unref = vi.fn();

  return socket;
}
