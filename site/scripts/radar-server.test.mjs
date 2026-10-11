import { request } from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createRadarServer } from './radar-server.mjs';
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      { method: options.method ?? 'GET', headers: options.headers },
      (res) => {
        res.resume();
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: { get: (name) => res.headers[name] ?? null },
          }),
        );
      },
    );
    req.on('error', reject);
    req.end(options.body);
  });
}

test('production API rejects cross-site, body, query and host attacks and limits global refresh', async () => {
  let calls = 0;
  let stamp = 0;
  const status = { state: 'success', checkedAt: null, discoveries: [] };
  const server = createRadarServer({
    origin: 'https://quant.liang111.top',
    readStatus: async () => status,
    refreshSources: async () => {
      calls++;
      return status;
    },
    now: () => 1_000_000 + stamp,
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/api/radar-refresh`;
  const headers = {
    host: 'quant.liang111.top',
    origin: 'https://quant.liang111.top',
    'x-radar-intent': 'refresh',
  };
  try {
    assert.equal(
      (await fetch(url, { headers: { host: 'attacker.example' } })).status,
      403,
    );
    assert.equal(
      (await fetch(url + '?url=http://127.0.0.1', { headers })).status,
      404,
    );
    assert.equal(
      (await fetch(url, { method: 'OPTIONS', headers })).status,
      405,
    );
    assert.equal(
      (
        await fetch(url, {
          method: 'POST',
          headers: { ...headers, origin: 'https://attacker.example' },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(url, {
          method: 'POST',
          headers: { host: headers.host, origin: headers.origin },
        })
      ).status,
      403,
    );
    assert.equal(
      (await fetch(url, { method: 'POST', headers, body: '{}' })).status,
      400,
    );
    assert.equal(
      (
        await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'sec-fetch-site': 'cross-site' },
        })
      ).status,
      403,
    );
    const response = await fetch(url, { method: 'POST', headers });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    await Promise.all(
      Array.from({ length: 8 }, () => fetch(url, { method: 'POST', headers })),
    );
    assert.equal(calls, 1);
    stamp += 300_001;
    await fetch(url, { method: 'POST', headers });
    assert.equal(calls, 2);
    assert.equal((await fetch(url, { headers })).status, 200);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});

test('source transport rejects metadata, alternate origins and altered source URLs before any network request', async () => {
  const {fetchSource}=await import('./radar-refresh.ts');
  for(const url of ['http://169.254.169.254/latest/meta-data/','https://api.ashbyhq.com.evil.example/posting-api/job-board/openai','https://api.ashbyhq.com/posting-api/job-board/openai?url=http://127.0.0.1']) await assert.rejects(()=>fetchSource(url),/非白名单/);
});
