import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

test('public feeds reject invalid content, scope jobs and share the OpenAI request', async () => {
  const originalCwd = process.cwd();
  const originalFetch = globalThis.fetch;
  const temporary = await mkdtemp(join(originalCwd, '.local', 'refresh-test-'));
  process.chdir(temporary);
  try {
    const { extractSourceContent, fixedRadarSources, refreshRadarSources } =
      await import('./radar-refresh.ts');
    const [fde, agent, anthropic, baidu, scale] = fixedRadarSources;
    const ashby = {
      jobs: [
        {
          title: 'Forward Deployed Engineer',
          isListed: true,
          jobUrl: 'https://jobs.ashbyhq.com/openai/fde',
          descriptionPlain: 'deployment',
        },
        {
          title: 'Agent Evaluation Engineer',
          isListed: true,
          jobUrl: 'https://jobs.ashbyhq.com/openai/agent',
          descriptionPlain: 'evaluation',
        },
        {
          title: 'Finance Analyst',
          isListed: true,
          jobUrl: 'https://jobs.ashbyhq.com/openai/finance',
          descriptionPlain: 'agentic risk',
        },
        {
          title: 'Agent Private Posting',
          isListed: false,
          jobUrl: 'https://jobs.ashbyhq.com/openai/private',
          descriptionPlain: 'post-training',
        },
      ],
    };
    const greenhouse = {
      jobs: [
        {
          title: 'Forward Deployed Engineer',
          absolute_url: 'https://job-boards.greenhouse.io/scaleai/jobs/123',
          content: '<p>FDE</p>',
        },
      ],
    };
    assert.equal(
      extractSourceContent(fde, JSON.stringify(ashby)).matchedJobs,
      1,
    );
    const agents = extractSourceContent(agent, JSON.stringify(ashby));
    assert.equal(agents.matchedJobs, 1);
    assert.doesNotMatch(agents.text, /agentic risk|post-training/);
    assert.throws(() =>
      extractSourceContent(agent, '<html>HTTP 200 shell</html>'),
    );
    assert.throws(() =>
      extractSourceContent(scale, '{"jobs":[{"title":"FDE"}]}'),
    );
    assert.equal(extractSourceContent(agent, '{"jobs":[]}').matchedJobs, 0);
    assert.doesNotMatch(
      extractSourceContent(
        { ...anthropic, format: undefined },
        '<script>"forward deployed"</script><p>Actual roles</p>',
      ).text,
      /forward deployed/,
    );

    const calls = [];
    const baiduBody = `<script>window.__INITIAL_DATA__={"listDetailData":${JSON.stringify([{ name: 'AI产品工程实习生（J123）', postId: '123', workPlace: '北京市', publishDate: '2026-10-10', workContent: 'Python 工具调用', serviceCondition: 'RAG' }])}};throw new Error('must never execute')</script>`;
    assert.equal(extractSourceContent(baidu, baiduBody).jobs.length, 1);
    assert.throws(() => extractSourceContent(baidu, '<html>login page</html>'));
    function fixture(url) {
      return url === fde.fetchUrl
        ? JSON.stringify(ashby)
        : url === scale.fetchUrl
          ? JSON.stringify(greenhouse)
          : url === anthropic.fetchUrl
            ? '{"jobs":[]}'
            : baiduBody;
    }
    globalThis.fetch = async (url) => {
      calls.push(url);
      return new Response(fixture(url));
    };
    const initial = await refreshRadarSources();
    assert.equal(initial.succeeded, 5);
    assert.equal(initial.discoveries.flatMap((c) => c.jobs).length, 4);
    assert.equal(calls.filter((url) => url === fde.fetchUrl).length, 1);

    globalThis.fetch = async (url) =>
      new Response(
        url === fde.fetchUrl ? '<html>not a job feed</html>' : fixture(url),
      );
    const failed = await refreshRadarSources();
    assert.equal(failed.state, 'partial');
    assert.equal(failed.succeeded, 3);
    assert.equal(failed.sources[0].httpStatus, 200);
    assert.equal(failed.sources[0].status, 'error');
    assert.deepEqual(failed.sources[0].signals, []);
    assert.equal(
      failed.discoveries
        .flatMap((c) => c.jobs)
        .filter((j) => j.employer === 'OpenAI').length,
      2,
    );
    assert.ok(
      failed.discoveries
        .flatMap((c) => c.jobs)
        .filter((j) => j.employer === 'OpenAI')
        .every((j) => j.stale),
    );

    globalThis.fetch = async (url) =>
      new Response(url === fde.fetchUrl ? '{"jobs":[]}' : fixture(url));
    const removed = await refreshRadarSources();
    assert.equal(
      removed.discoveries
        .flatMap((c) => c.jobs)
        .filter((j) => j.employer === 'OpenAI').length,
      0,
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.chdir(originalCwd);
    await rm(temporary, { recursive: true, force: true });
  }
});
