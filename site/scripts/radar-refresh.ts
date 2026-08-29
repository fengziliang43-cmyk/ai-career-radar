import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export type RadarRefreshSource = {
  id: string;
  label: string;
  url: string;
  status: 'ok' | 'error';
  httpStatus: number | null;
  signals: string[];
  error: string | null;
};

export type RadarRefreshStatus = {
  state: 'idle' | 'running' | 'success' | 'partial' | 'error';
  checkedAt: string | null;
  sourceCount: number;
  succeeded: number;
  candidateSignals: string[];
  sources: RadarRefreshSource[];
  note: string;
};

type FixedSource = {
  id: string;
  label: string;
  url: string;
  signals: Array<{ label: string; patterns: string[] }>;
};

const STATE_PATH = resolve(process.cwd(), '.local', 'radar-refresh.json');
const FETCH_TIMEOUT_MS = 15_000;
const MAX_SOURCE_BYTES = 1_500_000;

export const fixedRadarSources: FixedSource[] = [
  {
    id: 'openai-forward-deployed',
    label: 'OpenAI｜Forward Deployed 职位',
    url: 'https://openai.com/careers/search/?q=forward+deployed',
    signals: [
      { label: 'FDE / Forward Deployed', patterns: ['forward deployed'] },
      { label: 'AI Deployment', patterns: ['deployment'] },
    ],
  },
  {
    id: 'openai-agents',
    label: 'OpenAI｜Agent 职位',
    url: 'https://openai.com/careers/search/?q=agent',
    signals: [
      { label: 'Agent Evals', patterns: ['evals', 'evaluation'] },
      { label: 'Agent Post-Training', patterns: ['post-training', 'post training'] },
      { label: 'Agentic Risk', patterns: ['agentic risk'] },
      { label: 'Agent Product', patterns: ['product manager', 'product engineer'] },
    ],
  },
  {
    id: 'anthropic-applied-ai',
    label: 'Anthropic｜Applied AI 职位',
    url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
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
    signals: [
      { label: 'Agent 产品 / 策略', patterns: ['agent', '策略'] },
      { label: 'AI 产品工程', patterns: ['产品工程', 'ai coding'] },
      { label: '评测产品', patterns: ['评测', '测评'] },
    ],
  },
  {
    id: 'scale-forward-deployed',
    label: 'Scale AI｜Forward Deployed 职位',
    url: 'https://scale.com/careers/4690504005',
    signals: [
      { label: 'FDE 团队扩张', patterns: ['forward deployed', 'fde'] },
    ],
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
  await writeFile(temporaryPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
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
        typeof status.note === 'string'
          ? status.note
          : '固定信源状态已读取。',
    };
  } catch {
    return emptyStatus();
  }
}

function safeFetchError(error: unknown) {
  if (error instanceof Error && error.name === 'TimeoutError') return '请求超时';
  if (error instanceof Error && error.name === 'AbortError') return '请求超时';
  return '信源暂时不可达';
}

async function inspectSource(source: FixedSource): Promise<RadarRefreshSource> {
  try {
    const response = await fetch(source.url, {
      redirect: 'follow',
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'AI-Career-Radar/1.0 local-source-check',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return {
        id: source.id,
        label: source.label,
        url: source.url,
        status: 'error',
        httpStatus: response.status,
        signals: [],
        error: `HTTP ${response.status}`,
      };
    }

    const page = (await response.text())
      .slice(0, MAX_SOURCE_BYTES)
      .toLocaleLowerCase('en-US');
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
      httpStatus: response.status,
      signals,
      error: null,
    };
  } catch (error) {
    return {
      id: source.id,
      label: source.label,
      url: source.url,
      status: 'error',
      httpStatus: null,
      signals: [],
      error: safeFetchError(error),
    };
  }
}

export async function refreshRadarSources(): Promise<RadarRefreshStatus> {
  const startedAt = new Date().toISOString();
  await writeStatus({
    state: 'running',
    checkedAt: startedAt,
    sourceCount: fixedRadarSources.length,
    succeeded: 0,
    candidateSignals: [],
    sources: [],
    note: '正在检查固定一手信源。',
  });

  const sources = await Promise.all(fixedRadarSources.map(inspectSource));
  const succeeded = sources.filter((source) => source.status === 'ok').length;
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
