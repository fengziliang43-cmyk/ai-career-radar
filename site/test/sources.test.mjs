import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SourceError } from '../server/fetch.mjs';
import { extractKnowledge } from '../server/knowledge.mjs';
import { htmlToText, parseSource, SOURCES } from '../server/sources.mjs';

const source = (id) => SOURCES.find((item) => item.id === id);

test('Ashby: keeps listed jobs, joins locations, keeps descriptions transient', () => {
  const body = JSON.stringify({
    jobs: [
      {
        id: 'a1',
        title: '  Forward Deployed Engineer - SF ',
        jobUrl: 'https://jobs.ashbyhq.com/openai/a1',
        isListed: true,
        location: 'San Francisco',
        secondaryLocations: [{ location: 'New York City' }, { location: 'San Francisco' }],
        department: 'Forward Deployed Engineering',
        publishedAt: '2026-10-01T10:00:00.000Z',
        descriptionPlain: 'About the role\nYou will build Python services.',
      },
      { id: 'a2', title: 'Hidden', jobUrl: 'https://jobs.ashbyhq.com/openai/a2', isListed: false },
    ],
  });
  const jobs = parseSource(source('openai'), body);
  assert.equal(jobs.length, 1);
  assert.deepEqual(
    { ...jobs[0], description: undefined },
    {
      id: 'a1',
      title: 'Forward Deployed Engineer - SF',
      url: 'https://jobs.ashbyhq.com/openai/a1',
      location: 'San Francisco · New York City',
      team: 'Forward Deployed Engineering',
      publishedAt: '2026-10-01T10:00:00.000Z',
      description: undefined,
    },
  );
});

test('Greenhouse: decodes entity-escaped HTML and reads first_published', () => {
  const body = JSON.stringify({
    jobs: [
      {
        id: 42,
        title: 'Applied AI Architect',
        absolute_url: 'https://job-boards.greenhouse.io/anthropic/jobs/42',
        location: { name: 'London, UK' },
        departments: [{ name: 'Applied AI' }],
        first_published: '2026-09-01T09:00:00-04:00',
        content: '&lt;p&gt;Responsibilities&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Use SQL &amp;amp; Python&lt;/li&gt;&lt;/ul&gt;',
      },
    ],
  });
  const [job] = parseSource(source('anthropic'), body);
  assert.equal(job.id, '42');
  assert.equal(job.team, 'Applied AI');
  assert.equal(job.publishedAt, '2026-09-01T13:00:00.000Z');
  assert.equal(job.description, 'Responsibilities\nUse SQL & Python');
});

test('Baidu: extracts embedded list, builds detail URLs, keeps date-only days', () => {
  const rows = [
    {
      postId: '177e55ca-15a2-44e9-85d6-6dbe1c2928e6',
      name: 'AI产品经理实习生（J106390）',
      workPlace: '北京市,上海市',
      publishDate: '2026-10-09',
      workContent: '负责 [Agent] 产品设计',
      serviceCondition: '熟悉大模型',
    },
  ];
  const body = `<script>window.__DATA__={"x":1,"listDetailData":${JSON.stringify(rows)},"y":"]"}</script>`;
  const [job] = parseSource(source('baidu-intern'), body);
  assert.equal(job.url, 'https://talent.baidu.com/jobs/detail/INTERN/177e55ca-15a2-44e9-85d6-6dbe1c2928e6');
  assert.equal(job.publishedAt, '2026-10-09');
  assert.equal(job.location, '北京市,上海市');
  assert.match(job.description, /Agent/);
});

test('invalid payloads and foreign job URLs are rejected', () => {
  assert.throws(() => parseSource(source('openai'), '<html>blocked</html>'), SourceError);
  assert.throws(() => parseSource(source('baidu-intern'), '<html></html>'), SourceError);
  const foreign = JSON.stringify({
    jobs: [{ id: 1, title: 'X', absolute_url: 'https://evil.example/jobs/1' }],
  });
  assert.throws(() => parseSource(source('anthropic'), foreign), SourceError);
});

test('htmlToText strips scripts and numeric entities', () => {
  assert.equal(htmlToText('<script>alert(1)</script><b>A&#38;B</b>'), 'A&B');
});

test('knowledge words come from the role section, not company boilerplate', () => {
  const text =
    'We build safe AI with Kubernetes.\nResponsibilities\nWrite Python evals for agents.\nAbout Anthropic\nWe use CUDA everywhere.';
  assert.deepEqual(extractKnowledge(text), ['Python', 'Agent 与工作流编排', '评测设计与指标']);
  assert.deepEqual(extractKnowledge(''), []);
});
