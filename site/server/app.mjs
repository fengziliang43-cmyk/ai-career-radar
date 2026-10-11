import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

// Same headers nginx adds in production (see deploy/security-headers.conf).
const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'no-store',
};

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
export const COOLDOWN_MS = 5 * 60_000;

/**
 * Request handler for the page and its two endpoints:
 * - GET  api/state    current postings, source status and history
 * - POST api/refresh  re-read the fixed sources (same origin, header
 *   `x-radar-intent: refresh`, no body; results reused for 5 minutes)
 * Only loopback peers and the configured Host/Origin values are served.
 */
export function createHandler({
  publicDir,
  readSnapshot,
  refresher,
  origins,
  now = Date.now,
}) {
  const root = resolve(publicDir);
  const allowedOrigins = new Set(origins);
  const allowedHosts = new Set(origins.map((origin) => new URL(origin).host));

  return async function handle(req, res) {
    try {
      if (!LOOPBACK.has(req.socket.remoteAddress)) {
        return sendJson(res, 403, { error: '只允许本机访问' });
      }
      if (!allowedHosts.has(req.headers.host)) {
        return sendJson(res, 403, { error: '访问地址不允许' });
      }
      const url = new URL(req.url ?? '/', 'http://radar.invalid');
      if (url.pathname.startsWith('/api/')) return await api(req, res, url);
      return await serveStatic(req, res, url.pathname);
    } catch {
      if (!res.headersSent) sendJson(res, 500, { error: '服务暂时出错，请稍后再试' });
      else res.end();
    }
  };

  async function api(req, res, url) {
    if (url.search) return sendJson(res, 400, { error: '接口不接受参数' });
    if (url.pathname === '/api/state') {
      if (req.method !== 'GET' && req.method !== 'HEAD') return notAllowed(res, 'GET, HEAD');
      return sendJson(res, 200, await readSnapshot(), { req, headOnly: req.method === 'HEAD' });
    }
    if (url.pathname !== '/api/refresh') return sendJson(res, 404, { error: '接口不存在' });
    if (req.method !== 'POST') return notAllowed(res, 'POST');
    const fetchSite = req.headers['sec-fetch-site'];
    if (
      !allowedOrigins.has(req.headers.origin) ||
      req.headers['x-radar-intent'] !== 'refresh' ||
      (fetchSite !== undefined && fetchSite !== 'same-origin')
    ) {
      return sendJson(res, 403, { error: '只接受本页面发起的刷新' });
    }
    if (
      req.headers['transfer-encoding'] !== undefined ||
      Number(req.headers['content-length'] ?? 0) !== 0
    ) {
      return sendJson(res, 400, { error: '刷新接口不接受参数' });
    }
    if (!refresher.running) {
      const current = await readSnapshot();
      const last = Date.parse(current.checkedAt ?? '');
      if (Number.isFinite(last) && now() - last < COOLDOWN_MS) {
        return sendJson(res, 200, { ...current, reused: true }, { req });
      }
    }
    await refresher.refresh();
    return sendJson(res, 200, await readSnapshot(), { req });
  }

  async function serveStatic(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return notAllowed(res, 'GET, HEAD');
    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      return sendText(res, 400, 'Bad request');
    }
    const segments = decoded.split('/').filter(Boolean);
    if (decoded.includes('\0') || segments.some((part) => part.startsWith('.') || part.includes('\\'))) {
      return sendText(res, 404, 'Not found');
    }
    const relative = segments.length ? segments.join('/') : 'index.html';
    const file = resolve(join(root, relative));
    const type = TYPES[extname(file)];
    if (!type || !file.startsWith(root + sep)) return sendText(res, 404, 'Not found');
    try {
      const info = await stat(file);
      if (!info.isFile()) return sendText(res, 404, 'Not found');
      const body = await readFile(file);
      res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': type, 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      sendText(res, 404, 'Not found');
    }
  }
}

// The state payload is several hundred KB, so compress it when the client can.
function sendJson(res, status, payload, { req, headOnly = false } = {}) {
  let body = Buffer.from(JSON.stringify(payload));
  const headers = {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Accept-Encoding',
  };
  if (body.length > 1024 && /\bgzip\b/.test(req?.headers['accept-encoding'] ?? '')) {
    body = gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
  }
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(headOnly ? undefined : body);
}

function sendText(res, status, text) {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function notAllowed(res, allow) {
  res.setHeader('Allow', allow);
  sendJson(res, 405, { error: '请求方法不允许' });
}
