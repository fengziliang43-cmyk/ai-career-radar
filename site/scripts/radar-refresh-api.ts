import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Plugin } from 'vite';

import {
  readRadarRefreshStatus,
  refreshRadarSources,
  type RadarRefreshStatus,
} from './radar-refresh';

function isLoopback(value: string | undefined) {
  return (
    value === '127.0.0.1' ||
    value === '::1' ||
    value === '::ffff:127.0.0.1'
  );
}

function isLocalOrigin(value: string | undefined) {
  if (!value) return true;
  try {
    const hostname = new URL(value).hostname;
    return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]' || hostname === '::1';
  } catch {
    return false;
  }
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
  headOnly = false,
) {
  const body = `${JSON.stringify(payload)}\n`;
  response.statusCode = statusCode;
  response.setHeader('cache-control', 'no-store');
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('x-content-type-options', 'nosniff');
  response.end(headOnly ? undefined : body);
}

function hasRequestBody(request: IncomingMessage) {
  const length = Number(request.headers['content-length'] ?? 0);
  return length > 0 || request.headers['transfer-encoding'] !== undefined;
}

export function radarRefreshApiPlugin(): Plugin {
  let inFlight: Promise<RadarRefreshStatus> | null = null;

  return {
    name: 'local-radar-refresh-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(
        '/api/radar-refresh',
        async (request, response) => {
          const method = request.method ?? 'GET';
          const pathname = new URL(
            request.url ?? '/',
            'http://127.0.0.1',
          ).pathname;
          if (pathname !== '/' && pathname !== '') {
            sendJson(response, 404, { error: '接口不存在' });
            return;
          }
          if (!isLoopback(request.socket.remoteAddress)) {
            sendJson(response, 403, { error: '只允许本机访问' });
            return;
          }

          if (method === 'GET' || method === 'HEAD') {
            sendJson(
              response,
              200,
              { refresh: await readRadarRefreshStatus() },
              method === 'HEAD',
            );
            return;
          }

          if (method !== 'POST') {
            response.setHeader('allow', 'GET, HEAD, POST');
            sendJson(response, 405, { error: '不支持该请求方法' });
            return;
          }
          if (!isLocalOrigin(
            typeof request.headers.origin === 'string'
              ? request.headers.origin
              : undefined,
          )) {
            sendJson(response, 403, { error: '拒绝非本机来源' });
            return;
          }
          if (hasRequestBody(request)) {
            sendJson(response, 400, { error: '刷新接口不接受参数' });
            return;
          }

          try {
            inFlight ??= refreshRadarSources().finally(() => {
              inFlight = null;
            });
            sendJson(response, 200, { refresh: await inFlight });
          } catch {
            sendJson(response, 500, {
              error: '固定信源刷新失败；研究快照未被修改',
              refresh: await readRadarRefreshStatus(),
            });
          }
        },
      );
    },
  };
}
