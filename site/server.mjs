// AI 新职业雷达 · 本地与服务器共用的入口。
//   node server.mjs [--host 127.0.0.1] [--port 3001] [--origin URL]...
//                   [--state-dir DIR] [--no-auto-refresh] [--refresh-once]
// 只监听回环地址；服务器上由 nginx 负责 HTTPS 和登录（见 deploy/）。
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { createHandler } from './server/app.mjs';
import { createRefresher, publicState } from './server/refresh.mjs';
import { SOURCES } from './server/sources.mjs';
import { createStore } from './server/store.mjs';

const HOUR = 3_600_000;
const AUTO_REFRESH_AFTER = 24 * HOUR;

const here = dirname(fileURLToPath(import.meta.url));
const { values } = parseArgs({
  options: {
    host: { type: 'string' },
    hostname: { type: 'string' },
    port: { type: 'string' },
    origin: { type: 'string', multiple: true },
    'state-dir': { type: 'string' },
    'no-auto-refresh': { type: 'boolean', default: false },
    'refresh-once': { type: 'boolean', default: false },
  },
});

const host = values.host ?? values.hostname ?? process.env.RADAR_HOST ?? '127.0.0.1';
const port = Number(values.port ?? process.env.RADAR_PORT ?? 3001);
if (!['127.0.0.1', '::1', 'localhost'].includes(host)) {
  console.error('Refusing to listen on a non-loopback address.');
  process.exit(1);
}
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  console.error('Invalid port.');
  process.exit(1);
}

const origins = values.origin?.length
  ? values.origin
  : process.env.RADAR_ORIGIN
    ? process.env.RADAR_ORIGIN.split(',').map((origin) => origin.trim())
    : [`http://127.0.0.1:${port}`, `http://localhost:${port}`];

const store = createStore(
  resolve(values['state-dir'] ?? process.env.RADAR_STATE_DIR ?? join(here, '.local')),
);
const refresher = createRefresher({ store });

if (values['refresh-once']) {
  const state = await refresher.refresh();
  const summary = Object.entries(state.sources).map(
    ([id, source]) => `${id}:${source.status}:${source.jobCount}`,
  );
  console.log(`refreshed ${state.jobs.length} postings · ${summary.join(' ')}`);
  process.exit(0);
}

const readSnapshot = async () =>
  publicState(await store.readState(), await store.readHistory(), {
    refreshing: refresher.running,
  });

const server = createServer(
  createHandler({ publicDir: join(here, 'public'), readSnapshot, refresher, origins }),
);
server.headersTimeout = 10_000;
server.requestTimeout = 120_000;
server.keepAliveTimeout = 5_000;
server.maxConnections = 64;

server.listen(port, host, () => {
  console.log(`AI 新职业雷达 → http://${host === '::1' ? '[::1]' : host}:${port}/`);
});

// 2026-10-11 良授权：服务运行期间，数据超过 24 小时自动刷新一次；
// 白名单里有从没读过的来源（刚加的新来源）时，也立即补读一次。
async function refreshIfStale() {
  if (refresher.running) return;
  const { checkedAt, sources } = await store.readState();
  const last = Date.parse(checkedAt ?? '');
  const unread = SOURCES.some((source) => !sources[source.id]);
  if (!unread && Number.isFinite(last) && Date.now() - last < AUTO_REFRESH_AFTER) return;
  try {
    await refresher.refresh();
  } catch (error) {
    console.error('Automatic refresh failed:', error?.message ?? error);
  }
}

if (!values['no-auto-refresh']) {
  setTimeout(refreshIfStale, 5_000).unref();
  setInterval(refreshIfStale, HOUR).unref();
}

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3_000).unref();
  });
}
