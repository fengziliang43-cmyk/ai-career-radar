import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createHandler } from '../server/app.mjs';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
let server;
let port;
let origin;
let snapshot;
let refreshCalls;
let clock;

const refresher = {
  running: false,
  async refresh() {
    refreshCalls++;
    snapshot = { ...snapshot, checkedAt: new Date(clock).toISOString() };
    return snapshot;
  },
};

before(async () => {
  server = createServer((req, res) =>
    handler(req, res),
  );
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
  origin = `http://127.0.0.1:${port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

let handler = () => {};
function reset() {
  clock = Date.parse('2026-10-11T12:00:00Z');
  refreshCalls = 0;
  snapshot = { checkedAt: '2026-10-10T12:00:00.000Z', jobs: [], sources: [], history: [] };
  handler = createHandler({
    publicDir,
    readSnapshot: async () => snapshot,
    refresher,
    origins: [origin],
    now: () => clock,
  });
}

function call(path, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: '127.0.0.1', port, path, method, headers: { host: `127.0.0.1:${port}`, ...headers } },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (text += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text }));
      },
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const refreshHeaders = () => ({ origin, 'x-radar-intent': 'refresh', 'sec-fetch-site': 'same-origin' });

test('serves the page and assets with security headers', async () => {
  reset();
  const page = await call('/');
  assert.equal(page.status, 200);
  assert.match(page.text, /AI 新职业雷达/);
  assert.match(page.headers['content-security-policy'], /script-src 'self'/);
  assert.equal(page.headers['x-content-type-options'], 'nosniff');
  assert.equal((await call('/styles.css')).headers['content-type'], 'text/css; charset=utf-8');
  assert.equal((await call('/shared/radar.js')).status, 200);
});

test('never serves files outside public/ or dotfiles', async () => {
  reset();
  for (const path of ['/../server.mjs', '/%2e%2e/server.mjs', '/.local/state.json', '/data/../../package.json', '/missing.js', '/index.txt']) {
    assert.equal((await call(path)).status, 404, path);
  }
  assert.equal((await call('/%E0%A4%A')).status, 400);
  assert.equal((await call('/', { method: 'PUT' })).status, 405);
});

test('rejects unexpected Host headers', async () => {
  reset();
  assert.equal((await call('/', { headers: { host: 'evil.example' } })).status, 403);
});

test('state endpoint is read-only and takes no parameters', async () => {
  reset();
  const state = await call('/api/state');
  assert.equal(state.status, 200);
  assert.equal(JSON.parse(state.text).checkedAt, snapshot.checkedAt);
  assert.equal((await call('/api/state?url=https://x')).status, 400);
  assert.equal((await call('/api/state', { method: 'POST' })).status, 405);
  assert.equal((await call('/api/other')).status, 404);
});

test('refresh requires same origin, intent header and no body', async () => {
  reset();
  assert.equal((await call('/api/refresh')).status, 405);
  assert.equal((await call('/api/refresh', { method: 'POST' })).status, 403);
  assert.equal(
    (await call('/api/refresh', { method: 'POST', headers: { ...refreshHeaders(), origin: 'https://evil.example' } })).status,
    403,
  );
  assert.equal(
    (await call('/api/refresh', { method: 'POST', headers: { origin, 'x-radar-intent': 'refresh', 'sec-fetch-site': 'cross-site' } })).status,
    403,
  );
  assert.equal(
    (await call('/api/refresh', { method: 'POST', headers: { origin } })).status,
    403,
  );
  assert.equal(
    (await call('/api/refresh', { method: 'POST', headers: { ...refreshHeaders(), 'content-length': '7' }, body: 'url=xyz' })).status,
    400,
  );
  assert.equal(refreshCalls, 0);
});

test('refresh runs once, then reuses results for five minutes', async () => {
  reset();
  const first = await call('/api/refresh', { method: 'POST', headers: refreshHeaders() });
  assert.equal(first.status, 200);
  assert.equal(refreshCalls, 1);
  assert.equal(JSON.parse(first.text).checkedAt, '2026-10-11T12:00:00.000Z');

  clock += 60_000;
  const second = await call('/api/refresh', { method: 'POST', headers: refreshHeaders() });
  assert.equal(JSON.parse(second.text).reused, true);
  assert.equal(refreshCalls, 1);

  clock += 5 * 60_000;
  await call('/api/refresh', { method: 'POST', headers: refreshHeaders() });
  assert.equal(refreshCalls, 2);
});
