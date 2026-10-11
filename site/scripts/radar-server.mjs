import { realpathSync } from 'node:fs';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

// Nginx supplies authentication. This process must stay on loopback.
export function createRadarServer({
  origin,
  readStatus,
  refreshSources,
  cooldownMs = 300_000,
  now = Date.now,
}) {
  const allowed = new URL(origin);
  let inFlight = null;
  let lastAttempt = 0;
  function send(res, status, payload) {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(JSON.stringify(payload));
  }
  const server = createServer(async (req, res) => {
    try {
      if (
        !['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(
          req.socket.remoteAddress,
        ) ||
        req.headers.host !== allowed.host
      )
        return send(res, 403, { error: '访问来源不允许' });
      if (req.url !== '/api/radar-refresh')
        return send(res, 404, { error: '接口不存在' });
      if (!['GET', 'HEAD', 'POST'].includes(req.method)) {
        res.setHeader('Allow', 'GET, HEAD, POST');
        return send(res, 405, { error: '请求方法不允许' });
      }
      if (
        req.headers['transfer-encoding'] !== undefined ||
        Number(req.headers['content-length'] ?? 0) !== 0
      )
        return send(res, 400, { error: '接口不接受参数' });
      if (req.method !== 'POST') {
        const refresh = await readStatus();
        if (req.method === 'HEAD') {
          res.writeHead(200, { 'Cache-Control': 'private, no-store' });
          return res.end();
        }
        return send(res, 200, { refresh });
      }
      if (
        req.headers.origin !== allowed.origin ||
        req.headers['x-radar-intent'] !== 'refresh' ||
        (req.headers['sec-fetch-site'] &&
          req.headers['sec-fetch-site'] !== 'same-origin')
      )
        return send(res, 403, { error: '拒绝跨站或非页面刷新' });
      if (inFlight)
        return send(res, 200, { refresh: await inFlight, reused: true });
      const status = await readStatus();
      const recent = Math.max(
        lastAttempt,
        Date.parse(status.checkedAt ?? '') || 0,
      );
      if (now() - recent < cooldownMs)
        return send(res, 200, { refresh: status, reused: true });
      lastAttempt = now();
      inFlight = Promise.resolve()
        .then(refreshSources)
        .finally(() => {
          inFlight = null;
        });
      return send(res, 200, { refresh: await inFlight });
    } catch {
      return send(res, 503, { error: '更新暂不可用，请稍后重试' });
    }
  });
  server.maxConnections = 32;
  server.headersTimeout = 10_000;
  server.requestTimeout = 25_000;
  server.timeout = 60_000;
  server.keepAliveTimeout = 5000;
  return server;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  const { readRadarRefreshStatus, refreshRadarSources } =
    await import('./radar-refresh.ts');
  if (process.argv.includes('--refresh-once')) {
    const status = await refreshRadarSources();
    console.log(
      JSON.stringify({
        state: status.state,
        succeeded: status.succeeded,
        checkedAt: status.checkedAt,
      }),
    );
    process.exit(0);
  }
  const server = createRadarServer({
    origin: 'https://quant.liang111.top',
    readStatus: readRadarRefreshStatus,
    refreshSources: refreshRadarSources,
  });
  server.listen(18991, '127.0.0.1', () =>
    console.log('Career radar update service listening on loopback'),
  );
  for (const signal of ['SIGTERM', 'SIGINT'])
    process.on(signal, () => server.close(() => process.exit(0)));
}
