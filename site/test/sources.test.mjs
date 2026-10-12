import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SourceError } from '../server/fetch.mjs';
import { extractKnowledge } from '../server/knowledge.mjs';
import { htmlToText, loadSource, parsePage, parseSource, SOURCES } from '../server/sources.mjs';

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

test('every source has a unique id, a group and an https job link prefix', () => {
  assert.equal(new Set(SOURCES.map((item) => item.id)).size, SOURCES.length);
  for (const item of SOURCES) {
    assert.ok(item.group && item.employer && item.label, item.id);
    assert.match(item.fetchUrl, /^https:\/\//, item.id);
    assert.match(item.jobUrlPrefix, /^https:\/\//, item.id);
  }
});

test('Lever: title, all locations, team and created date', () => {
  const body = JSON.stringify([
    {
      id: 'p1',
      text: 'Forward Deployed Software Engineer',
      hostedUrl: 'https://jobs.lever.co/palantir/p1',
      categories: { team: 'Dev', allLocations: ['London, UK', 'New York, NY'] },
      createdAt: Date.parse('2026-09-30T00:00:00Z'),
      descriptionPlain: 'A world-changing company.',
      lists: [{ text: 'Core Responsibilities', content: '<li>Ship Python services</li>' }],
    },
  ]);
  const [job] = parseSource(source('palantir'), body);
  assert.equal(job.location, 'London, UK · New York, NY');
  assert.equal(job.team, 'Dev');
  assert.equal(job.publishedAt, '2026-09-30T00:00:00.000Z');
  assert.match(job.description, /Ship Python services/);
});

test('Tencent: builds https detail links and reads Chinese dates', () => {
  const body = JSON.stringify({
    Code: 200,
    Data: {
      Count: 1,
      Posts: [
        {
          PostId: '2109127544484839424',
          RecruitPostName: '腾讯云-AI前线部署工程师',
          LocationName: '深圳',
          BGName: 'CSIG',
          CategoryName: '技术',
          LastUpdateTime: '2026年10月9日',
          Responsibility: '负责大模型应用落地',
          PostURL: 'http://careers.tencent.com/jobdesc.html?postId=2109127544484839424',
        },
      ],
    },
  });
  const { jobs, done } = parsePage(source('tencent'), body);
  assert.equal(done, true);
  assert.equal(jobs[0].url, 'https://careers.tencent.com/jobdesc.html?postId=2109127544484839424');
  assert.equal(jobs[0].publishedAt, '2026-10-09');
  assert.equal(jobs[0].team, 'CSIG · 技术');
});

test('Meituan and NetEase: cities, departments and epoch dates', () => {
  const meituan = JSON.stringify({
    data: {
      page: { totalCount: 1 },
      list: [
        {
          jobUnionId: '4095156667',
          name: 'AI应用PDE',
          cityList: [{ name: '北京市' }, { name: '上海市' }],
          department: [{ name: '核心本地商业' }],
          refreshTime: Date.parse('2026-10-10T08:00:00Z'),
          jobDuty: '负责 Agent 落地',
          jobRequirement: '熟悉 Python',
        },
      ],
    },
  });
  const [mt] = parsePage(source('meituan'), meituan).jobs;
  assert.equal(mt.url, 'https://zhaopin.meituan.com/web/position/detail?jobUnionId=4095156667&highlightType=social');
  assert.equal(mt.location, '北京市、上海市');
  assert.equal(mt.publishedAt, '2026-10-10T08:00:00.000Z');

  const netease = JSON.stringify({
    code: 200,
    data: { pages: 1, list: [{ id: 79231, name: 'AI产品经理', workPlaceNameList: ['杭州市'], firstDepName: '有道', updateTime: Date.parse('2026-10-09T00:00:00Z'), description: 'x', requirement: 'y' }] },
  });
  const [ne] = parsePage(source('netease'), netease).jobs;
  assert.equal(ne.url, 'https://hr.163.com/job-detail.html?id=79231&lang=zh');
  assert.equal(ne.location, '杭州市');
});

test('paginated sources read every page with fixed queries, then stop', async () => {
  const calls = [];
  const page = (number) =>
    JSON.stringify({
      code: 200,
      data: {
        pages: 3,
        list: Array.from({ length: number < 3 ? 2 : 1 }, (_, index) => ({ id: number * 10 + index, name: 'AI产品经理' })),
      },
    });
  const fetchText = async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    return page(calls.length);
  };
  const jobs = await loadSource(source('netease'), fetchText, { pause: 0 });
  assert.equal(jobs.length, 5);
  assert.deepEqual(calls.map((call) => call.body), [
    { currentPage: 1, pageSize: 200 },
    { currentPage: 2, pageSize: 200 },
    { currentPage: 3, pageSize: 200 },
  ]);
  assert.ok(calls.every((call) => call.url === 'https://hr.163.com/api/hr163/position/queryPage' && call.method === 'POST'));
});

test('a list longer than expected fails the source instead of truncating it', async () => {
  const endless = async () => JSON.stringify({ code: 200, data: { pages: 999, list: [{ id: 1, name: 'AI产品经理' }] } });
  await assert.rejects(loadSource(source('netease'), endless, { pause: 0 }), SourceError);
  await assert.rejects(
    loadSource(source('tencent'), async () => JSON.stringify({ Code: 403, Data: null }), { pause: 0 }),
    SourceError,
  );
});
