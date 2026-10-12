import assert from 'node:assert/strict';
import { test } from 'node:test';

import { clusters } from '../public/data/clusters.js';
import { clusterRules } from '../public/data/rules.js';
import {
  buildView,
  displayTitle,
  groupOf,
  historyEntry,
  isChina,
  isRelevant,
  matchClusters,
  normalizeTitle,
} from '../public/shared/radar.js';

const DAY = 86_400_000;
const NOW = Date.parse('2026-10-20T12:00:00Z');
const BASELINE = '2026-10-11T16:00:00.000Z';

function job(title, extra = {}) {
  return {
    key: `${extra.source ?? 'openai'}:${title}:${extra.location ?? ''}`,
    source: 'openai',
    employer: 'OpenAI',
    title,
    url: 'https://jobs.ashbyhq.com/openai/x',
    location: 'San Francisco',
    team: '',
    publishedAt: null,
    firstSeenAt: BASELINE,
    titleFirstSeenAt: BASELINE,
    stale: false,
    knowledge: [],
    ...extra,
  };
}

const sources = [
  { id: 'openai', label: 'OpenAI 全部公开职位', status: 'ok', baselineAt: BASELINE },
  { id: 'baidu-intern', label: '百度实习职位', status: 'ok', baselineAt: BASELINE },
];

test('every research cluster has a rule and every rule has a cluster', () => {
  assert.deepEqual(
    Object.keys(clusterRules).sort(),
    clusters.map((cluster) => cluster.id).sort(),
  );
});

test('business functions and non-AI internships are not relevant', () => {
  assert.equal(isRelevant({ title: 'Account Director, Healthcare', team: 'Go To Market' }), false);
  assert.equal(isRelevant({ title: 'Software Engineer', team: 'Finance' }), false);
  assert.equal(isRelevant({ title: 'Customer Success Manager, Ads Solutions', team: '' }), false);
  assert.equal(isRelevant({ title: 'Forward Deployed Engineer (FDE), Legal-NYC', team: '' }), true);
  assert.equal(isRelevant({ title: 'SQC业务运营实习生', team: '' }, { requireAiTitle: true }), false);
  assert.equal(isRelevant({ title: '百度健康AI产品实习生', team: '' }, { requireAiTitle: true }), true);
});

test('non-AI employers only count titles that carry an AI signal', () => {
  const ai = (title) => isRelevant({ title, team: '' }, { requireAiTitle: true });
  assert.equal(ai('Sr. Forward Deployed Engineer (FDE)'), true);
  assert.equal(ai('腾讯云-AI前线部署工程师'), true);
  assert.equal(ai('混元大语言模型后训练算法工程师'), true);
  assert.equal(ai('Solutions Architect'), false);
  assert.equal(ai('腾讯健康-医疗行业解决方案云架构师'), false);
  assert.equal(ai('医药-B2C-采购专家'), false);
  assert.equal(ai('高级数据分析师'), false);
  assert.equal(ai('财务科技—AI产品经理'), true);
  assert.equal(ai('AI营销创意策划'), false, 'marketing is excluded even with AI');
  assert.equal(ai('背景アーティスト｜Environment Artist'), false, 'game art never reaches the eval-environment rule');
});

test('China means a mainland location, not the employer', () => {
  assert.equal(isChina({ employer: '腾讯', location: '深圳' }), true);
  assert.equal(isChina({ employer: '美团', location: '北京市、上海市' }), true);
  assert.equal(isChina({ employer: '腾讯', location: '新加坡' }), false);
  assert.equal(isChina({ employer: '腾讯', location: '中国香港' }), false);
  assert.equal(isChina({ employer: 'OpenAI', location: 'Singapore' }), false);
});

test('titles map to research clusters', () => {
  const cases = [
    ['Forward Deployed Engineer (FDE), Healthcare - SF', ['fde-ai-deployment', 'medical-ai-evaluation']],
    ['Capacity Deployment Lead - Data Center Operations', []],
    ['Deployment Strategist', ['fde-ai-deployment']],
    ['Product Engineer, Full Stack - Agents', ['ai-product-engineer']],
    ['Product Engineer - Manufacturing Operations', []],
    ['Research Engineer, Frontier Evals & Environments', ['agent-evaluation-engineer']],
    ['Agent Post-Training, Context Research', ['agent-post-training']],
    ['Applied AI Architect, Healthcare & Life Sciences', ['applied-ai-architect', 'medical-ai-evaluation']],
    ['AI Support Engineer, Biosciences - San Francisco', ['ai-success-engineer', 'medical-ai-evaluation']],
    ['IT Support Engineer', []],
    ['Safeguards Enforcement Analyst, Child Safety', ['agentic-risk-safeguards']],
    ['Product Manager, API Agents', ['agent-product-manager']],
    ['AI产品经理实习生（J106390）', []],
    ['Senior AI Product Manager', []],
    ['企业微信-AI产品经理-智能助理Agent', ['agent-product-manager']],
    ['资深 Agent 产品研发工程师', []],
    ['Senior Agent Product Manager, Healthcare', ['agent-product-manager', 'medical-ai-evaluation']],
    ['Agent 评测产品经理', ['agent-evals-product', 'agent-product-manager']],
    ['DuMate产品运营实习生（J106391）', ['ai-ops-rag-baseline']],
    ['Medical Fellow - Human Frontier Collective (US)', ['medical-ai-evaluation']],
    ['Clinical AI Manager', ['medical-ai-evaluation']],
    ['Member of Product Staff, Nursing', ['medical-ai-evaluation']],
    ['Software Engineer, Hardware Health', []],
    ['Prompt Engineer', ['prompt-training-digital-human-cooling']],
    ['腾讯云-AI前线部署工程师', ['fde-ai-deployment']],
    ['大模型应用开发工程师', ['applied-ai-architect']],
    ['大模型风险防控技术专家', ['agentic-risk-safeguards']],
    ['腾讯游戏-大模型评测专家', ['agent-evaluation-engineer']],
    ['腾讯会议-评测产品经理', ['agent-evals-product']],
    ['Administrative Business Partner', []],
  ];
  for (const [title, expected] of cases) {
    assert.deepEqual(matchClusters(title).sort(), [...expected].sort(), title);
  }
});

test('unmatched agent roles and generic AI product roles get their own groups', () => {
  assert.equal(groupOf('Agent Strategy Manager'), 'agent-roles');
  assert.equal(groupOf('Conversation Designer'), 'agent-roles');
  assert.equal(groupOf('AI产品经理实习生'), 'ai-product');
  assert.equal(groupOf('腾讯云-AgentRuntime高级技术专家'), 'agent-roles');
  assert.equal(groupOf('魔方工作室-AI技术美术'), 'ai-content');
  assert.equal(groupOf('Research Engineer, Pretraining'), 'research');
});

test('location and seniority variants collapse to one role', () => {
  assert.equal(normalizeTitle('Staff+ Software Engineer, Safeguards'), 'software engineer safeguards');
  assert.equal(
    normalizeTitle('Forward Deployed Engineer (FDE), Legal-NYC'),
    normalizeTitle('Forward Deployed Engineer (FDE), Legal-SF'),
  );
  assert.equal(normalizeTitle('AI产品经理实习生（J106390）'), 'ai产品经理实习生');
  assert.equal(displayTitle('Applied AI Engineer, Codex | Tokyo'), 'Applied AI Engineer, Codex');
  assert.equal(displayTitle('Backend Software Engineer - Codex for Finance'), 'Backend Software Engineer - Codex for Finance');
});

test('history rows count postings and employers per cluster', () => {
  const entry = historyEntry(
    [
      job('Forward Deployed Engineer - SF'),
      job('Forward Deployed Engineer', { employer: 'Anthropic' }),
      job('Research Engineer, Pretraining'),
    ],
    new Date('2026-10-11T23:30:00Z'),
  );
  assert.equal(entry.date, '2026-10-11');
  assert.equal(entry.total, 3);
  assert.equal(entry.other, 1);
  assert.deepEqual(entry.clusters['fde-ai-deployment'], { count: 2, employers: ['OpenAI', 'Anthropic'] });
});

test('baseline postings are not new; later ones are, with new employers and titles', () => {
  const later = new Date(NOW - 2 * DAY).toISOString();
  const data = {
    checkedAt: new Date(NOW).toISOString(),
    sources,
    jobs: [
      job('Forward Deployed Engineer - SF'),
      job('Forward Deployed Engineer - NYC', { firstSeenAt: later }),
      job('Agent产品经理实习生', {
        source: 'baidu-intern',
        employer: '百度',
        location: '北京市',
        firstSeenAt: later,
        titleFirstSeenAt: later,
      }),
      job('Quantum Agent Gardener', { firstSeenAt: later, titleFirstSeenAt: later }),
      job('Research Engineer, Pretraining'),
    ],
    history: [
      { date: '2026-10-11', clusters: { 'agent-evaluation-engineer': { count: 2 } } },
      { date: '2026-10-20', clusters: { 'fde-ai-deployment': { count: 2 } } },
    ],
  };
  const view = buildView({ clusters, data, now: NOW });
  const fde = view.clusters.find((cluster) => cluster.id === 'fde-ai-deployment');
  assert.equal(fde.jobCount, 2);
  assert.equal(fde.newJobs.length, 1);
  assert.deepEqual(fde.newEmployers, []);
  assert.equal(fde.roles.length, 1, 'SF and NYC postings merge into one role');
  assert.equal(fde.roles[0].count, 2);
  assert.equal(fde.roles[0].title, 'Forward Deployed Engineer');
  assert.deepEqual(fde.series.map((point) => point.count), [0, 2]);

  const agentPm = view.clusters.find((cluster) => cluster.id === 'agent-product-manager');
  assert.deepEqual(agentPm.newEmployers, ['百度']);
  assert.equal(agentPm.chinaCount, 1);

  assert.equal(view.otherCount, 2);
  assert.deepEqual(view.newTitles.map((role) => role.title), ['Quantum Agent Gardener']);

  const kinds = view.changes.map((change) => `${change.kind}:${change.clusterId ?? ''}`);
  assert.ok(kinds.includes('jobs:fde-ai-deployment'));
  assert.ok(kinds.includes('employer:agent-product-manager'));
  assert.ok(kinds.includes('gone:agent-evaluation-engineer'));
  assert.ok(kinds.includes('titles:'));
});

test('trends only compare days built from the same sources', () => {
  const data = {
    sources,
    jobs: [job('Forward Deployed Engineer')],
    history: [
      { date: '2026-10-10', clusters: { 'fde-ai-deployment': { count: 9 } } },
      { date: '2026-10-11', sources: ['baidu-intern', 'openai'], clusters: { 'fde-ai-deployment': { count: 1 } } },
      { date: '2026-10-12', sources: ['baidu-intern', 'openai'], clusters: { 'fde-ai-deployment': { count: 2 } } },
    ],
  };
  const fde = buildView({ clusters, data, now: NOW }).clusters.find((cluster) => cluster.id === 'fde-ai-deployment');
  assert.deepEqual(fde.series.map((point) => point.date), ['2026-10-11', '2026-10-12']);
  const entry = historyEntry([job('Forward Deployed Engineer')], new Date(NOW), ['openai', 'baidu-intern']);
  assert.deepEqual(entry.sources, ['baidu-intern', 'openai']);
});

test('a failed source is reported in changes and its postings stay visible', () => {
  const data = {
    sources: [{ ...sources[0], status: 'error', error: 'HTTP 503', lastOkAt: BASELINE }],
    jobs: [job('Forward Deployed Engineer', { stale: true })],
    history: [],
  };
  const view = buildView({ clusters, data, now: NOW });
  assert.equal(view.changes[0].kind, 'source');
  assert.match(view.changes[0].text, /HTTP 503/);
  assert.equal(view.clusters.find((cluster) => cluster.id === 'fde-ai-deployment').staleCount, 1);
});

test('research still renders without live data', () => {
  const view = buildView({ clusters, data: null, now: NOW });
  assert.equal(view.clusters.length, 13);
  assert.equal(view.jobCount, 0);
  assert.deepEqual(view.changes, []);
});
