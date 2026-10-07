import { vi } from 'vitest';

import { ElectrumXSocket } from '../../lib/network/electrumXSocket';
import {
  mockedSocket,
  mockSocketError,
  mockSocketResult,
  resetSocketMock,
} from '../mocked/electrumxSocket.mock';

vi.mock('tls', () => ({
  connect: vi.fn(() => mockedSocket),
}));
vi.mock('net', () => ({
  connect: vi.fn(() => mockedSocket),
}));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ElectrumXSocket', () => {
  beforeEach(() => {
    resetSocketMock();
  });

  describe('setupSocket handshake failure', () => {
    /**
     * @target ElectrumXSocket.setupSocket should destroy the socket when the
     * server.version handshake times out
     * @dependencies
     * - mock tls.connect with a socket that never responds
     * - run setupSocket with a short request timeout
     * @expected
     * - the socket is destroyed, so its 'close' handler resets the
     *   connection status and a later setupSocket call does not throw
     */
    it('should destroy the socket when the handshake times out', async () => {
      // never answer any request: the handshake can only fail by timeout
      mockedSocket.write = () => true;
      const socket = new ElectrumXSocket('address', 50002, 5, 0.05);
      socket.setupSocket();

      await sleep(200);
      expect(mockedSocket.destroyed).toBe(true);

      // 'close' fired via destroy: the status is reset, so setting up a
      // new socket must not throw "already active"
      expect(() => socket.setupSocket()).not.toThrow();
      socket.disconnect();
    });

    /**
     * @target ElectrumXSocket.setupSocket should destroy the socket when the
     * server.version handshake is answered with an error
     * @dependencies
     * - mock server.version to return a JSON-RPC error
     * - run setupSocket
     * @expected
     * - the socket is destroyed instead of staying IN_PROGRESS forever
     */
    it('should destroy the socket when the handshake returns an error', async () => {
      mockSocketError('server.version', {
        code: -1,
        message: 'Mocked Error',
      });
      const socket = new ElectrumXSocket('address', 50002);
      socket.setupSocket();

      await sleep(50);
      expect(mockedSocket.destroyed).toBe(true);
    });

    /**
     * @target ElectrumXSocket.setupSocket should keep the socket open after
     * a successful server.version handshake
     * @dependencies
     * - mock server.version to return a result
     * - run setupSocket
     * @expected
     * - the socket is not destroyed and a second setupSocket call throws
     *   because the socket is active (CONNECTED)
     */
    it('should keep the socket open after a successful handshake', async () => {
      mockSocketResult('server.version', ['FiroElectrumXSocket', '1.4']);
      const socket = new ElectrumXSocket('address', 50002);
      socket.setupSocket();

      await sleep(50);
      expect(mockedSocket.destroyed).toBe(false);
      expect(() => socket.setupSocket()).toThrow('already active');
      socket.disconnect();
    });
  });
});
