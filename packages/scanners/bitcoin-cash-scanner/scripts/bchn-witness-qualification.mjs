import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

// Run with the scanner workspace's installed tsx loader: built ESM currently
// contains extensionless imports. All RPC traffic is isolated loopback regtest.
const [binaryArg, scannerArg, outputArg] = process.argv.slice(2);
assert.ok(
  binaryArg && scannerArg && outputArg,
  'Usage: node --import tsx bchn-witness-qualification.mjs <bitcoind> <scanner-package-dir> <new-output-dir>',
);
const binary = resolve(binaryArg);
const scanner = resolve(scannerArg);
const output = resolve(outputArg);
mkdirSync(output, { recursive: false });
const sha = (bytes) => createHash('sha256').update(bytes).digest();
const hash256 = (bytes) => sha(sha(bytes));
const pin = (path) => ({
  path,
  sha256: sha(readFileSync(path)).toString('hex'),
});
const delay = (milliseconds) =>
  new Promise((done) => setTimeout(done, milliseconds));
const miner = 'bchreg:qp63uahgrxged4z5jswyt5dn5v3lzsem6c6mz8vuwd';
const evidence = {
  bchnSource: '07576013c91ff4a3a74acd85f189c69121cdad1b',
  binary: pin(binary),
  harness: pin(fileURLToPath(import.meta.url)),
  nodes: [],
  cases: [],
  scope:
    'BCHN29.2 native regtest; built scanner header-only witness; fresh manually pruned synthetic history; default finalization settings with simulated time. Not a production-node or wall-clock latency test.',
};
evidence.scannerPins = [
  'bitcoinCashRpcNetwork',
  'bitcoinCashRpcPolicy',
  'bitcoinCashValidation',
  'bitcoinCashFinality',
  'bitcoinCashFinalityError',
].map((name) => pin(join(scanner, 'dist/network', `${name}.js`)));
const { BitcoinCashRpcNetwork } = await import(
  pathToFileURL(join(scanner, 'dist/network/bitcoinCashRpcNetwork.js')).href
);
const save = () =>
  writeFileSync(
    join(output, 'evidence.json'),
    JSON.stringify(evidence, null, 2),
  );
const pass = (name) => evidence.cases.push({ name, passed: true });

/** Starts a wallet-disabled isolated daemon and always stops only that child. */
const withNode = async (name, port, extra, action) => {
  const directory = join(output, name);
  mkdirSync(directory);
  const data = join(directory, 'node');
  mkdirSync(data);
  const stdout = openSync(join(directory, 'stdout.log'), 'wx');
  const stderr = openSync(join(directory, 'stderr.log'), 'wx');
  const args = [
    '-regtest',
    `-datadir=${data}`,
    '-server=1',
    '-listen=0',
    '-connect=0',
    '-dnsseed=0',
    '-discover=0',
    '-upnp=0',
    '-natpmp=0',
    '-disablewallet=1',
    '-txindex=0',
    '-rpcbind=127.0.0.1',
    '-rpcallowip=127.0.0.1',
    `-rpcport=${port}`,
    '-printtoconsole=0',
    ...extra,
  ];
  const child = spawn(binary, args, {
    windowsHide: true,
    stdio: ['ignore', stdout, stderr],
  });
  const state = { name, args, pid: child.pid };
  evidence.nodes.push(state);
  let cookie = '';
  const raw = async (method, params = []) => {
    const response = await fetch(`http://127.0.0.1:${port}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(cookie).toString('base64')}`,
      },
      body: JSON.stringify({
        jsonrpc: '1.0',
        id: 'witness-native-test',
        method,
        params,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    return await response.json();
  };
  const rpc = async (method, ...params) => {
    const reply = await raw(method, params);
    if (reply.error) throw Error(`${method}: ${JSON.stringify(reply.error)}`);
    return reply.result;
  };
  try {
    let available = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null)
        throw Error(`Daemon exited ${child.exitCode}`);
      try {
        cookie = readFileSync(join(data, 'regtest/.cookie'), 'utf8').trim();
        if ((await rpc('getblockchaininfo')).chain === 'regtest') {
          available = true;
          break;
        }
      } catch {}
      await delay(100);
    }
    assert.equal(available, true, 'Isolated node did not become available');
    assert.equal((await rpc('getnetworkinfo')).version, 29020000);
    assert.equal(await rpc('getconnectioncount'), 0);
    await action(rpc, raw, state);
    assert.equal(await rpc('getconnectioncount'), 0);
    state.peers = 0;
  } finally {
    try {
      await rpc('stop');
    } catch {}
    for (let attempt = 0; attempt < 150 && child.exitCode === null; attempt++)
      await delay(100);
    if (child.exitCode === null) child.kill();
    state.exitCode = child.exitCode;
    closeSync(stdout);
    closeSync(stderr);
    save();
    assert.equal(child.exitCode, 0, 'Node must stop cleanly');
  }
};

/** Serializes a small unsigned integer for a synthetic regtest block. */
const u32 = (value) => {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32LE(value);
  return bytes;
};
/** Encodes only the lengths used by this fixture. */
const compactSize = (value) =>
  value < 253
    ? Buffer.from([value])
    : Buffer.concat([Buffer.from([254]), u32(value)]);

/** Mines a valid zero-value synthetic coinbase large enough to cross a block-file boundary. */
const paddedBlock = async (rpc) => {
  const tip = await rpc('getblockheader', await rpc('getbestblockhash'));
  let remaining = tip.height + 1;
  const encodedHeight = [];
  while (remaining > 0) {
    encodedHeight.push(remaining & 255);
    remaining >>>= 8;
  }
  if (encodedHeight.at(-1) & 128) encodedHeight.push(0);
  const scriptSig = Buffer.from([encodedHeight.length, ...encodedHeight]);
  const padding = Buffer.concat([Buffer.from([0x6a]), Buffer.alloc(990_000)]);
  const transaction = Buffer.concat([
    u32(2),
    Buffer.from([1]),
    Buffer.alloc(32),
    u32(0xffffffff),
    compactSize(scriptSig.length),
    scriptSig,
    u32(0xffffffff),
    Buffer.from([2]),
    Buffer.alloc(8),
    Buffer.from([1, 0x51]),
    Buffer.alloc(8),
    compactSize(padding.length),
    padding,
    u32(0),
  ]);
  const header = Buffer.concat([
    u32(4),
    Buffer.from(tip.hash, 'hex').reverse(),
    hash256(transaction),
    u32(tip.time + 1),
    Buffer.from(tip.bits, 'hex').reverse(),
    u32(0),
  ]);
  for (let nonce = 0; ; nonce++) {
    header.writeUInt32LE(nonce, 76);
    if (
      BigInt(`0x${Buffer.from(hash256(header)).reverse().toString('hex')}`) <=
      0x7fffffn << 232n
    )
      break;
  }
  assert.equal(
    await rpc(
      'submitblock',
      Buffer.concat([header, Buffer.from([1]), transaction]).toString('hex'),
    ),
    null,
  );
};

try {
  await withNode(
    'pruned-witness',
    29959,
    ['-prune=1', '-maxreorgdepth=-1'],
    async (rpc, raw, state) => {
      const [event, finalized] = await rpc('generatetoaddress', 2, miner);
      // BCHN prunes whole 128MiB block files and retains at least 288 tip blocks.
      for (let index = 0; index < 136; index++) {
        await paddedBlock(rpc);
        if ((index + 1) % 25 === 0)
          console.log(`Prune fixture: ${index + 1}/136 padded blocks`);
      }
      await rpc(
        'generatetoaddress',
        1002 - (await rpc('getblockcount')),
        miner,
      );
      state.beforePrune = await rpc('getblockchaininfo');
      state.pruneResult = await rpc('pruneblockchain', 700);
      state.afterPrune = await rpc('getblockchaininfo');
      assert.equal(state.afterPrune.pruned, true);
      assert.ok(state.afterPrune.pruneheight > 2);
      state.event = { hash: event, height: 1 };
      state.finalized = { hash: finalized, height: 2 };
      for (const hash of [event, finalized]) {
        const unavailable = await raw('getblock', [hash, 2]);
        assert.equal(unavailable.error.code, -1);
        assert.match(unavailable.error.message, /pruned/);
      }
      pass(
        'Both observed and finalized-checkpoint block bodies are actually pruned',
      );
      assert.equal(await rpc('finalizeblock', finalized), null);
      state.finalizedHeader = await rpc('getblockheader', finalized, true);
      const allowed = new Set([
        'getnetworkinfo',
        'getblockchaininfo',
        'getblockhash',
        'getblockheader',
        'getfinalizedblockhash',
        'getchaintips',
      ]);
      const calls = [];
      const proxy = createServer(async (request, response) => {
        try {
          const chunks = [];
          for await (const chunk of request) chunks.push(Buffer.from(chunk));
          const body = JSON.parse(Buffer.concat(chunks).toString());
          calls.push({ method: body.method, params: body.params });
          assert.ok(
            allowed.has(body.method),
            `Historical-body RPC forbidden: ${body.method}`,
          );
          const reply = await raw(body.method, body.params);
          reply.id = body.id;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(reply));
        } catch {
          response.statusCode = 500;
          response.end('qualification proxy rejected request');
        }
      });
      proxy.listen(0, '127.0.0.1');
      await once(proxy, 'listening');
      try {
        const client = new BitcoinCashRpcNetwork(
          `http://127.0.0.1:${proxy.address().port}`,
          30_000,
          'regtest',
        );
        await client.assertFinalizedBlock(event, 1);
        pass(
          'Built scanner accepts the exact finalized ancestor without historical-body RPCs',
        );
        await assert.rejects(client.assertFinalizedBlock('ab'.repeat(32), 1));
        pass('Pruned witness still rejects a wrong observed block hash');
      } finally {
        await new Promise((done, reject) =>
          proxy.close((error) => (error ? reject(error) : done())),
        );
      }
      state.finalityRpcCalls = calls;
    },
  );
  console.log('Fresh pruned witness qualification passed');
  await withNode(
    'default-finalization-policy',
    29960,
    [],
    async (rpc, raw, state) => {
      const start = Math.floor(Date.now() / 1000) + 1;
      await rpc('setmocktime', start);
      const [first] = await rpc('generatetoaddress', 1, miner);
      await rpc('setmocktime', start + 7200);
      await rpc('generatetoaddress', 9, miner);
      const depth9 = await rpc('getfinalizedblockhash');
      assert.equal(await rpc('getblockcount'), 10);
      if (depth9)
        assert.ok((await rpc('getblockheader', depth9, true)).height < 1);
      pass('Header age7200 at depth9 does not finalize the event');
      await rpc('generatetoaddress', 1, miner);
      assert.equal(await rpc('getfinalizedblockhash'), first);
      pass('Header age7200 at depth10 finalizes the event');
      const [fresh] = await rpc('generatetoaddress', 1, miner);
      await rpc('generatetoaddress', 10, miner);
      await rpc('setmocktime', start + 14399);
      await rpc('generatetoaddress', 1, miner);
      const before = await rpc('getfinalizedblockhash');
      assert.ok((await rpc('getblockheader', before, true)).height < 12);
      pass('Header age7199 with11descendants still does not finalize');
      await rpc('setmocktime', start + 14400);
      await rpc('generatetoaddress', 1, miner);
      const after = await rpc('getfinalizedblockhash');
      assert.ok((await rpc('getblockheader', after, true)).height >= 12);
      state.event = { hash: fresh, height: 12 };
      state.finalizedHeader = await rpc('getblockheader', after, true);
      pass('The same header at age7200 passes when the next block connects');
    },
  );
  assert.ok(
    evidence.scannerPins.every(
      (before) => pin(before.path).sha256 === before.sha256,
    ),
    'Built scanner bytes changed during qualification',
  );
  evidence.passed = true;
} catch (error) {
  evidence.failure = String(error);
  process.exitCode = 1;
} finally {
  save();
  console.log(
    JSON.stringify({
      output,
      passed: evidence.passed ?? false,
      cases: evidence.cases.length,
      failure: evidence.failure,
    }),
  );
}
