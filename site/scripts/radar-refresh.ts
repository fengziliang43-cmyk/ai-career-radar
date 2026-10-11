import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  buildDiscoveries,
  extractKnowledge,
  type DiscoveryJob,
  type DiscoveredCareer,
} from '../lib/radar-discovery.ts';

export type RadarRefreshSource = {
  id: string;
  label: string;
  url: string;
  status: 'ok' | 'error';
  httpStatus: number | null;
  signals: string[];
  error: string | null;
  checkedUrl?: string;
  matchedJobs?: number;
  sampleJobs?: Array<{ title: string; url: string }>;
  jobs?: DiscoveryJob[];
};

export type RadarRefreshStatus = {
  state: 'idle' | 'running' | 'success' | 'partial' | 'error';
  checkedAt: string | null;
  sourceCount: number;
  succeeded: number;
  candidateSignals: string[];
  sources: RadarRefreshSource[];
  note: string;
  discoveries?: DiscoveredCareer[];
};

type FixedSource = {
  id: string;
  label: string;
  url: string;
  fetchUrl?: string;
  format?: 'ashby' | 'greenhouse' | 'baidu';
  employer?: string;
  board?: string;
  titlePatterns?: string[];
  signals: Array<{ label: string; patterns: string[] }>;
};

const STATE_PATH = resolve(process.cwd(), '.local', 'radar-refresh.json');
const FETCH_TIMEOUT_MS = 15_000;
const MAX_SOURCE_BYTES = 20_000_000;

export const fixedRadarSources: FixedSource[] = [
  {
    id: 'openai-forward-deployed',
    label: 'OpenAI｜Forward Deployed 职位',
    url: 'https://openai.com/careers/search/?q=forward+deployed',
    fetchUrl: 'https://api.ashbyhq.com/posting-api/job-board/openai',
    format: 'ashby',
    employer: 'OpenAI',
    titlePatterns: ['forward deployed', 'fde', 'deployment'],
    signals: [
      { label: 'FDE / Forward Deployed', patterns: ['forward deployed'] },
      { label: 'AI Deployment', patterns: ['deployment'] },
    ],
  },
  {
    id: 'openai-agents',
    label: 'OpenAI｜Agent 职位',
    url: 'https://openai.com/careers/search/?q=agent',
    fetchUrl: 'https://api.ashbyhq.com/posting-api/job-board/openai',
    format: 'ashby',
    employer: 'OpenAI',
    titlePatterns: ['agent'],
    signals: [
      { label: 'Agent Evals', patterns: ['evals', 'evaluation'] },
      {
        label: 'Agent Post-Training',
        patterns: ['post-training', 'post training'],
      },
      { label: 'Agentic Risk', patterns: ['agentic risk'] },
      {
        label: 'Agent Product',
        patterns: ['product manager', 'product engineer'],
      },
    ],
  },
  {
    id: 'anthropic-applied-ai',
    label: 'Anthropic｜公开职位列表',
    url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
    fetchUrl: 'https://api.greenhouse.io/v1/boards/anthropic/jobs?content=true',
    format: 'greenhouse',
    employer: 'Anthropic',
    board: 'anthropic',
    signals: [
      { label: 'Applied AI', patterns: ['applied ai'] },
      { label: 'Forward Deployed', patterns: ['forward deployed'] },
      { label: 'Frontier Evals', patterns: ['frontier evals', 'evaluations'] },
      { label: 'Safeguards', patterns: ['safeguards'] },
    ],
  },
  {
    id: 'baidu-internships',
    label: '百度｜AI 与 Agent 实习职位',
    url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    format: 'baidu',
    employer: '百度',
    signals: [
      { label: 'Agent 产品 / 策略', patterns: ['agent', '策略'] },
      { label: 'AI 产品工程', patterns: ['产品工程', 'ai coding'] },
      { label: '评测产品', patterns: ['评测', '测评'] },
    ],
  },
  {
    id: 'scale-forward-deployed',
    label: 'Scale AI｜Forward Deployed 职位',
    url: 'https://scale.com/careers#open-roles',
    fetchUrl: 'https://api.greenhouse.io/v1/boards/scaleai/jobs?content=true',
    format: 'greenhouse',
    employer: 'Scale AI',
    board: 'scaleai',
    titlePatterns: ['forward deployed', 'fde'],
    signals: [{ label: 'FDE 招聘候选', patterns: ['forward deployed', 'fde'] }],
  },
];

function emptyStatus(): RadarRefreshStatus {
  return {
    state: 'idle',
    checkedAt: null,
    sourceCount: fixedRadarSources.length,
    succeeded: 0,
    candidateSignals: [],
    sources: [],
    note: '尚未执行本机固定信源刷新。',
  };
}

async function writeStatus(status: RadarRefreshStatus) {
  await mkdir(dirname(STATE_PATH), { recursive: true });
  const temporaryPath = `${STATE_PATH}.tmp-${process.pid}`;
  await writeFile(
    temporaryPath,
    `${JSON.stringify(status, null, 2)}\n`,
    'utf8',
  );
  await rename(temporaryPath, STATE_PATH);
}

export async function readRadarRefreshStatus(): Promise<RadarRefreshStatus> {
  try {
    const value = JSON.parse(await readFile(STATE_PATH, 'utf8')) as unknown;
    if (!value || typeof value !== 'object') return emptyStatus();
    const status = value as Partial<RadarRefreshStatus>;
    if (
      !['idle', 'running', 'success', 'partial', 'error'].includes(
        status.state ?? '',
      ) ||
      typeof status.sourceCount !== 'number' ||
      typeof status.succeeded !== 'number' ||
      !Array.isArray(status.sources) ||
      !Array.isArray(status.candidateSignals)
    ) {
      return emptyStatus();
    }
    return {
      state: status.state!,
      checkedAt: typeof status.checkedAt === 'string' ? status.checkedAt : null,
      sourceCount: fixedRadarSources.length,
      succeeded: status.succeeded,
      candidateSignals: status.candidateSignals.filter(
        (item): item is string => typeof item === 'string',
      ),
      sources: status.sources as RadarRefreshSource[],
      note:
        typeof status.note === 'string' ? status.note : '固定信源状态已读取。',
      discoveries: Array.isArray(status.discoveries)
        ? status.discoveries
        : undefined,
    };
  } catch {
    return emptyStatus();
  }
}

function safeFetchError(error: unknown) {
  if (
    error instanceof Error &&
    [
      '信源响应超过大小上限',
      '职位接口未返回有效职位列表',
      '职位接口返回了无效岗位数据',
    ].includes(error.message)
  )
    return error.message;
  if (error instanceof Error && error.name === 'TimeoutError')
    return '请求超时';
  if (error instanceof Error && error.name === 'AbortError') return '请求超时';
  return '信源暂时不可达';
}

function pageText(html: string) {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt);/g, ' ')
    .replace(/\s+/g, ' ');
}

// Extract a JSON array without evaluating the surrounding site's JavaScript.
function baiduJobs(body: string): unknown[] {
  const marker = '"listDetailData":';
  const start = body.indexOf(marker);
  const offset = start < 0 ? -1 : body.indexOf('[', start + marker.length);
  if (offset < 0) throw new Error('职位接口未返回有效职位列表');
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = offset; index < body.length; index++) {
    const char = body[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '[') depth++;
    else if (char === ']' && --depth === 0) {
      const value: unknown = JSON.parse(body.slice(offset, index + 1));
      if (Array.isArray(value)) return value;
    }
  }
  throw new Error('职位接口未返回有效职位列表');
}

export function extractSourceContent(
  source: FixedSource,
  body: string,
  observedAt = new Date().toISOString(),
) {
  if (!source.format) return { text: pageText(body) };
  let payload: unknown;
  try {
    payload =
      source.format === 'baidu' ? { jobs: baiduJobs(body) } : JSON.parse(body);
  } catch {
    throw new Error('职位接口未返回有效职位列表');
  }
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('jobs' in payload) ||
    !Array.isArray(payload.jobs)
  ) {
    throw new Error('职位接口未返回有效职位列表');
  }
  const jobs: Array<{ title: string; url: string; text: string }> = [];
  const discoveryJobs: DiscoveryJob[] = [];
  for (const raw of payload.jobs) {
    const titleValue: unknown =
      source.format === 'baidu' ? raw?.name : raw?.title;
    if (!raw || typeof raw !== 'object' || typeof titleValue !== 'string') {
      throw new Error('职位接口返回了无效岗位数据');
    }
    if (source.format === 'ashby' && raw.isListed !== true) continue;
    const url: unknown =
      source.format === 'baidu'
        ? source.url
        : source.format === 'ashby'
          ? raw.jobUrl
          : raw.absolute_url;
    const expected =
      source.format === 'ashby'
        ? 'https://jobs.ashbyhq.com/openai/'
        : source.format === 'baidu'
          ? 'https://talent.baidu.com/jobs/'
          : `https://job-boards.greenhouse.io/${source.board}/jobs/`;
    if (typeof url !== 'string' || !url.startsWith(expected)) {
      throw new Error('职位接口返回了无效岗位数据');
    }
    const description: unknown =
      source.format === 'baidu'
        ? `${raw.workContent ?? ''} ${raw.serviceCondition ?? ''}`
        : source.format === 'ashby'
          ? raw.descriptionPlain
          : raw.content;
    const text = `${titleValue} ${typeof description === 'string' ? pageText(description) : ''}`;
    const location: unknown =
      source.format === 'baidu'
        ? raw.workPlace
        : source.format === 'ashby'
          ? raw.location
          : raw.location?.name;
    const publishedAt: unknown =
      source.format === 'baidu'
        ? raw.publishDate
        : source.format === 'ashby'
          ? raw.publishedAt
          : raw.first_published;
    discoveryJobs.push({
      id: source.format === 'baidu' ? String(raw.postId) : url,
      title: titleValue,
      url,
      employer: source.employer ?? '',
      location: typeof location === 'string' ? location : '来源未提供地区',
      publishedAt:
        typeof publishedAt === 'string' &&
        !Number.isNaN(Date.parse(publishedAt))
          ? publishedAt
          : null,
      observedAt,
      contentHash: createHash('sha256')
        .update(typeof description === 'string' ? description : '')
        .digest('hex'),
      knowledge: extractKnowledge(
        typeof description === 'string' ? pageText(description) : '',
      ),
    });
    if (
      source.titlePatterns &&
      !source.titlePatterns.some((pattern) =>
        titleValue.toLocaleLowerCase('en-US').includes(pattern),
      )
    )
      continue;
    jobs.push({
      title: titleValue,
      url,
      text,
    });
  }
  return {
    text: jobs.map((job) => job.text).join('\n'),
    matchedJobs: jobs.length,
    sampleJobs: jobs.slice(0, 3).map(({ title, url }) => ({ title, url })),
    jobs: buildDiscoveries(discoveryJobs).flatMap((career) => career.jobs),
  };
}

export async function fetchSource(url: string) {
  if (
    !fixedRadarSources.some((source) => (source.fetchUrl ?? source.url) === url)
  )
    throw new Error('非白名单信源');
  if (process.env.RADAR_FETCH_TRANSPORT === 'curl') {
    const timeoutSeconds = new URL(url).hostname === 'api.ashbyhq.com' ? 45 : 15;
    const { stdout } = await promisify(execFile)(
      '/usr/bin/curl',
      [
        '--disable',
        '--ipv4',
        '--compressed',
        '--silent',
        '--show-error',
        '--proto',
        '=https',
        '--connect-timeout',
        '8',
        '--max-time',
        String(timeoutSeconds),
        '--max-filesize',
        String(MAX_SOURCE_BYTES),
        '--header',
        'Accept: application/json,text/html,application/xhtml+xml',
        '--user-agent',
        'AI-Career-Radar/1.0 source-check',
        '--write-out',
        '\n%{http_code}',
        '--url',
        url,
      ],
      { encoding: 'utf8', maxBuffer: MAX_SOURCE_BYTES + 1024, timeout: (timeoutSeconds + 2) * 1000 },
    );
    const split = stdout.lastIndexOf('\n');
    const status = Number(stdout.slice(split + 1));
    if (status < 200 || status >= 300) return { status, body: '' };
    return { status, body: stdout.slice(0, split) };
  }
  const response = await fetch(url, {
    redirect: 'error',
    headers: {
      accept: 'application/json,text/html,application/xhtml+xml',
      'user-agent': 'AI-Career-Radar/1.0 local-source-check',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    await response.body?.cancel();
    return { status: response.status, body: '' };
  }
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SOURCE_BYTES) {
        await reader.cancel();
        throw new Error('信源响应超过大小上限');
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  }
  return { status: response.status, body };
}

async function inspectSource(
  source: FixedSource,
  requests: Map<string, ReturnType<typeof fetchSource>>,
): Promise<RadarRefreshSource> {
  const checkedUrl = source.fetchUrl ?? source.url;
  let httpStatus: number | null = null;
  try {
    let request = requests.get(checkedUrl);
    if (!request) {
      request = fetchSource(checkedUrl);
      requests.set(checkedUrl, request);
    }
    const response = await request;
    httpStatus = response.status;
    if (httpStatus < 200 || httpStatus >= 300) {
      return {
        id: source.id,
        label: source.label,
        url: source.url,
        status: 'error',
        httpStatus,
        checkedUrl,
        signals: [],
        error: `HTTP ${httpStatus}`,
      };
    }

    const content = extractSourceContent(source, response.body);
    const page = content.text.toLocaleLowerCase('en-US');
    const signals = source.signals
      .filter((signal) =>
        signal.patterns.some((pattern) =>
          page.includes(pattern.toLocaleLowerCase('en-US')),
        ),
      )
      .map((signal) => signal.label);

    return {
      id: source.id,
      label: source.label,
      url: source.url,
      status: 'ok',
      httpStatus,
      checkedUrl,
      matchedJobs: content.matchedJobs,
      sampleJobs: content.sampleJobs,
      jobs: content.jobs,
      signals,
      error: null,
    };
  } catch (error) {
    return {
      id: source.id,
      label: source.label,
      url: source.url,
      status: 'error',
      httpStatus,
      checkedUrl,
      signals: [],
      error: safeFetchError(error),
    };
  }
}

export async function refreshRadarSources(): Promise<RadarRefreshStatus> {
  const previous = await readRadarRefreshStatus();
  const startedAt = new Date().toISOString();
  await writeStatus({
    state: 'running',
    checkedAt: startedAt,
    sourceCount: fixedRadarSources.length,
    succeeded: 0,
    candidateSignals: [],
    sources: previous.sources,
    note: '正在读取公开职位并更新职业列表。',
    discoveries: previous.discoveries,
  });

  const requests = new Map<string, ReturnType<typeof fetchSource>>();
  const sources = await Promise.all(
    fixedRadarSources.map((source) => inspectSource(source, requests)),
  );
  const succeeded = sources.filter((source) => source.status === 'ok').length;
  for (const source of sources) {
    if (source.status === 'error') {
      const old = previous.sources.find((item) => item.id === source.id);
      source.jobs = old?.jobs?.map((job) => ({ ...job, stale: true }));
    }
  }
  const discoveries = buildDiscoveries(
    sources.flatMap((source) => source.jobs ?? []),
    previous.discoveries,
  );
  const candidateSignals = [
    ...new Set(sources.flatMap((source) => source.signals)),
  ];
  const state =
    succeeded === fixedRadarSources.length
      ? 'success'
      : succeeded > 0
        ? 'partial'
        : 'error';
  const status: RadarRefreshStatus = {
    state,
    checkedAt: new Date().toISOString(),
    sourceCount: fixedRadarSources.length,
    succeeded,
    candidateSignals,
    sources,
    discoveries,
    note:
      state === 'success'
        ? '固定信源检查完成；候选命中仍需人工核验。'
        : state === 'partial'
          ? '部分信源不可达；保留成功结果，失败项下次重试。'
          : '本次信源均不可达；未改写任何研究结论。',
  };
  await writeStatus(status);
  return status;
}
