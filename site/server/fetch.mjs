import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const MAX_BYTES = 20_000_000;
const USER_AGENT = 'AI-Career-Radar/2.0 (private research; fixed public job boards)';
const ACCEPT = 'application/json,text/html;q=0.9';

export class SourceError extends Error {
  constructor(message, httpStatus = null) {
    super(message);
    this.name = 'SourceError';
    this.httpStatus = httpStatus;
  }
}

/**
 * Fetch a fixed source URL as text. Non-2xx, redirects, timeouts and oversized
 * bodies all throw SourceError with a short message that is safe to show.
 * POST is only used for the fixed JSON list queries some career sites need.
 * The server uses curl (RADAR_FETCH_TRANSPORT=curl) because it is faster to
 * the large Ashby board from there; local runs use Node's fetch.
 */
export async function fetchText(
  url,
  {
    method = 'GET',
    body,
    contentType = 'application/json',
    timeoutMs = 15_000,
    transport = process.env.RADAR_FETCH_TRANSPORT,
  } = {},
) {
  const request = { url, method, body, contentType, timeoutMs };
  return transport === 'curl' ? curlText(request) : nativeText(request);
}

async function nativeText({ url, method, body, contentType, timeoutMs }) {
  let response;
  try {
    response = await fetch(url, {
      method,
      body,
      redirect: 'error',
      headers: {
        accept: ACCEPT,
        'user-agent': USER_AGENT,
        ...(body === undefined ? {} : { 'content-type': contentType }),
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new SourceError(isTimeout(error) ? '请求超时' : '连接失败');
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new SourceError(`HTTP ${response.status}`, response.status);
  }
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new SourceError('响应超过大小上限');
      }
      text += decoder.decode(value, { stream: true });
    }
  } catch (error) {
    if (error instanceof SourceError) throw error;
    throw new SourceError(isTimeout(error) ? '请求超时' : '读取中断');
  }
  return text + decoder.decode();
}

async function curlText({ url, method, body, contentType, timeoutMs }) {
  const seconds = Math.max(5, Math.ceil(timeoutMs / 1000));
  const payload =
    body === undefined
      ? []
      : ['--request', method, '--header', `Content-Type: ${contentType}`, '--data-binary', body];
  let stdout;
  try {
    ({ stdout } = await promisify(execFile)(
      '/usr/bin/curl',
      [
        '--disable', // must stay first: ignore any local .curlrc
        ...payload,
        '--ipv4',
        '--compressed',
        '--silent',
        '--show-error',
        '--proto',
        '=https',
        '--connect-timeout',
        '8',
        '--max-time',
        String(seconds),
        '--max-filesize',
        String(MAX_BYTES),
        '--header',
        `Accept: ${ACCEPT}`,
        '--user-agent',
        USER_AGENT,
        '--write-out',
        '\n%{http_code}',
        '--url',
        url,
      ],
      {
        encoding: 'utf8',
        maxBuffer: MAX_BYTES + 1024,
        timeout: (seconds + 2) * 1000,
      },
    ));
  } catch (error) {
    throw new SourceError(error?.killed ? '请求超时' : '连接失败');
  }
  const split = stdout.lastIndexOf('\n');
  const status = Number(stdout.slice(split + 1));
  if (!(status >= 200 && status < 300)) {
    throw new SourceError(`HTTP ${status || '未知'}`, status || null);
  }
  return stdout.slice(0, split);
}

function isTimeout(error) {
  return error?.name === 'TimeoutError' || error?.name === 'AbortError';
}
