import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDiscoveries, extractKnowledge } from './radar-discovery.ts';

function job(id, title, employer = 'OpenAI') {
  return {
    id,
    title,
    employer,
    url: `https://example.com/${id}`,
    location: 'San Francisco',
    publishedAt: null,
    observedAt: '2026-10-11T15:00:00Z',
    knowledge: [],
  };
}

test('job grouping deduplicates employers, excludes generic sales and keeps novel titles', () => {
  const fde = job('1', 'Forward Deployed Engineer - SF');
  const careers = buildDiscoveries([
    fde,
    fde,
    job('2', 'Senior Forward Deployed Engineer', 'Scale AI'),
    job('3', 'Healthcare Account Executive'),
    job('4', 'Recruiter, AI Research'),
    job('5', 'AI Workflow Auditor'),
  ]);
  assert.equal(careers.length, 2);
  assert.equal(careers[0].employers.length, 2);
  assert.equal(careers[0].jobs.length, 2);
  assert.equal(careers[1].title, 'AI Workflow Auditor');
});

test('the list grows and shrinks with successful observations without resetting first-seen dates', () => {
  const initial = buildDiscoveries([job('1', 'AI Workflow Auditor')]);
  const nextJob = {
    ...job('1', 'AI Workflow Auditor'),
    observedAt: '2026-10-12T15:00:00Z',
  };
  const next = buildDiscoveries(
    [nextJob, job('2', 'AI Context Curator')],
    initial,
  );
  assert.equal(next.length, 2);
  assert.equal(
    next.find((c) => c.title === initial[0].title).firstSeenAt,
    initial[0].firstSeenAt,
  );
  assert.equal(buildDiscoveries([], next).length, 0);
});

test('knowledge terms need evidence in the source text', () => {
  assert.deepEqual(
    extractKnowledge('Python PyTorch, evaluation, tool calling'),
    ['Python', 'PyTorch', '评测集、评测指标与实验设计', '工具调用与执行工作流'],
  );
  assert.deepEqual(extractKnowledge('Financial analyst'), []);
});

test('real source false positives do not create careers or misleading task families', () => {
  const careers = buildDiscoveries([
    job('av', 'IT Audiovisual Operations Engineer'),
    job('marketing', '百度健康品牌市场实习生（J106332）', '百度'),
    job('data', 'Recruiting Analytics Data Engineer', 'Anthropic'),
    job(
      'retrieval',
      'Research Engineer, Retrieval & Search, Applied Engineering',
    ),
    job('chip', 'Software Engineer, AI for Chip Design'),
    job('multi', 'Staff Research Scientist, Multi-Agent', 'Anthropic'),
    job('security', 'Security Engineer, Agent Security'),
  ]);
  assert.deepEqual(careers.map((c) => c.id).sort(), [
    'accelerator',
    'agent-security',
    'multi-agent',
    'retrieval',
  ]);
  assert.deepEqual(
    extractKnowledge(
      'About Anthropic: interpretability researchers. About the Role: build with Python. Benefits and interpretability company research.',
    ),
    ['Python'],
  );
});

test('reviews match exact content and identity, and do not certify changed or stale jobs', async () => {
  const { reviewFor } = await import('./radar-reviews.ts');
  const reviewed = {
    ...job(
      'a5d745dd-b2e4-4eff-b10d-23d6e94d302d',
      '百度健康AI产品实习生（J106396）',
      '百度',
    ),
    url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
  };
  const { reviews } = await import('./radar-reviews.ts');
  const hash = reviews.find(
    (r) => 'id' in r && r.id === reviewed.id,
  ).contentHash;
  reviewed.contentHash = hash;
  assert.equal(reviewFor(reviewed)?.taskVerified, true);
  assert.equal(reviewFor({ ...reviewed, id: 'another-baidu-job' }), undefined);
  assert.equal(reviewFor({ ...reviewed, contentHash: 'changed' }), undefined);
  assert.equal(reviewFor({ ...reviewed, stale: true }), undefined);
});
