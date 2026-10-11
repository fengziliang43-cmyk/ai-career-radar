import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { SourceError } from '../server/fetch.mjs';
import { createRefresher, publicState } from '../server/refresh.mjs';
import { createStore } from '../server/store.mjs';

const dirs = [];
after(() => Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true }))));

async function setup() {
  const dir = await mkdtemp(join(tmpdir(), 'radar-test-'));
  dirs.push(dir);
  return { dir, store: createStore(dir) };
}

const greenhouse = {
  id: 'gh',
  employer: 'Anthropic',
  label: 'Anthropic',
  format: 'greenhouse',
  fetchUrl: 'https://api.greenhouse.io/v1/boards/anthropic/jobs?content=true',
  pageUrl: 'https://www.anthropic.com/careers/jobs',
  jobUrlPrefix: 'https://job-boards.greenhouse.io/anthropic/jobs/',
};
const ashby = {
  id: 'ash',
  employer: 'OpenAI',
  label: 'OpenAI',
  format: 'ashby',
  fetchUrl: 'https://api.ashbyhq.com/posting-api/job-board/openai',
  pageUrl: 'https://openai.com/careers/search/',
  jobUrlPrefix: 'https://jobs.ashbyhq.com/openai/',
};

const ghBody = (...titles) =>
  JSON.stringify({
    jobs: titles.map((title, index) => ({
      id: index + 1,
      title,
      absolute_url: `https://job-boards.greenhouse.io/anthropic/jobs/${index + 1}`,
      location: { name: 'London, UK' },
      content: '&lt;p&gt;Responsibilities: Python&lt;/p&gt;',
    })),
  });
const ashBody = (...titles) =>
  JSON.stringify({
    jobs: titles.map((title, index) => ({
      id: `a${index + 1}`,
      title,
      jobUrl: `https://jobs.ashbyhq.com/openai/a${index + 1}`,
      isListed: true,
      location: 'San Francisco',
      descriptionPlain: 'You will run evals.',
    })),
  });

function fakeFetch(bodies) {
  return async (url) => {
    const body = bodies[url];
    if (body instanceof Error) throw body;
    return body;
  };
}

test('refresh tracks first sight, removals, failures and daily history', async () => {
  const { dir, store } = await setup();
  const bodies = {
    [greenhouse.fetchUrl]: ghBody('Forward Deployed Engineer', 'Account Executive, AI Native'),
    [ashby.fetchUrl]: ashBody('Applied AI Engineer'),
  };
  let clock = new Date('2026-10-11T16:00:00Z');
  const refresher = createRefresher({
    store,
    sources: [greenhouse, ashby],
    fetchText: fakeFetch(bodies),
    now: () => clock,
  });

  const first = await refresher.refresh();
  assert.equal(first.jobs.length, 2, 'sales roles are dropped');
  assert.equal(first.sources.gh.baselineAt, '2026-10-11T16:00:00.000Z');
  assert.deepEqual(first.jobs.find((job) => job.source === 'gh').knowledge, ['Python']);

  // Same day: Anthropic adds a role, OpenAI fails.
  clock = new Date('2026-10-11T20:00:00Z');
  bodies[greenhouse.fetchUrl] = ghBody('Forward Deployed Engineer', 'Research Engineer, Code RL');
  bodies[ashby.fetchUrl] = new SourceError('HTTP 503', 503);
  const second = await refresher.refresh();
  const added = second.jobs.find((job) => job.title === 'Research Engineer, Code RL');
  assert.equal(added.firstSeenAt, '2026-10-11T20:00:00.000Z');
  assert.equal(
    second.jobs.find((job) => job.title === 'Forward Deployed Engineer').firstSeenAt,
    '2026-10-11T16:00:00.000Z',
  );
  const kept = second.jobs.find((job) => job.source === 'ash');
  assert.equal(kept.stale, true);
  assert.equal(second.sources.ash.status, 'error');
  assert.equal(second.sources.ash.lastOkAt, '2026-10-11T16:00:00.000Z');
  assert.equal(second.sources.ash.baselineAt, '2026-10-11T16:00:00.000Z');

  // Next day: FDE posting disappears, OpenAI recovers.
  clock = new Date('2026-10-12T09:00:00Z');
  bodies[greenhouse.fetchUrl] = ghBody('Research Engineer, Code RL');
  bodies[ashby.fetchUrl] = ashBody('Applied AI Engineer');
  const third = await refresher.refresh();
  assert.equal(third.jobs.some((job) => job.title === 'Forward Deployed Engineer'), false);
  assert.equal(third.jobs.find((job) => job.source === 'ash').stale, false);

  const history = JSON.parse(await readFile(join(dir, 'history.json'), 'utf8')).days;
  assert.deepEqual(history.map((day) => day.date), ['2026-10-11', '2026-10-12']);
  assert.equal(history[0].clusters['agent-post-training'].count, 1, 'same-day refresh overwrote the row');
  assert.equal(history[1].clusters['fde-ai-deployment'], undefined);

  const snapshot = publicState(await store.readState(), history, { refreshing: false });
  assert.equal(snapshot.jobs.length, 2);
  assert.ok(snapshot.jobs.every((job) => typeof job.titleFirstSeenAt === 'string'));
});

test('concurrent refresh calls share one run', async () => {
  const { store } = await setup();
  let calls = 0;
  const refresher = createRefresher({
    store,
    sources: [greenhouse],
    fetchText: async () => {
      calls++;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return ghBody('Forward Deployed Engineer');
    },
  });
  const [a, b] = await Promise.all([refresher.refresh(), refresher.refresh()]);
  assert.equal(calls, 1);
  assert.equal(a, b);
  assert.equal(refresher.running, false);
});

test('a corrupt state file starts over instead of crashing', async () => {
  const { dir, store } = await setup();
  const { writeFile } = await import('node:fs/promises');
  await writeFile(join(dir, 'state.json'), '{not json');
  const state = await store.readState();
  assert.deepEqual(state.jobs, []);
  assert.equal(state.checkedAt, null);
});
