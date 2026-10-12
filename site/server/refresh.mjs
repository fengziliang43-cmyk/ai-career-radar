import {
  historyEntry,
  isRelevant,
  normalizeTitle,
} from '../public/shared/radar.js';
import { fetchText as defaultFetchText, SourceError } from './fetch.mjs';
import { extractKnowledge } from './knowledge.mjs';
import { loadSource, SOURCES } from './sources.mjs';

/**
 * Refreshes all fixed sources. Concurrent callers share one run.
 * - A source that succeeds replaces its postings; postings it no longer
 *   lists leave the current list (history keeps the daily counts).
 * - A source that fails keeps its previous postings, marked stale.
 * - A source's first success sets its baseline: postings seen then are
 *   not "new"; later ones are.
 */
export function createRefresher({
  store,
  sources = SOURCES,
  fetchText = defaultFetchText,
  now = () => new Date(),
  pageDelayMs,
}) {
  let inFlight = null;

  return {
    get running() {
      return inFlight !== null;
    },
    refresh() {
      inFlight ??= run().finally(() => {
        inFlight = null;
      });
      return inFlight;
    },
  };

  async function run() {
    const time = now();
    const at = time.toISOString();
    const previous = await store.readState();
    const previousByKey = new Map(previous.jobs.map((job) => [job.key, job]));

    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          return { source, raw: await loadSource(source, fetchText, { pause: pageDelayMs }) };
        } catch (error) {
          return {
            source,
            error: error instanceof SourceError ? error.message : '读取失败',
          };
        }
      }),
    );

    const jobs = [];
    const status = {};
    for (const { source, raw, error } of results) {
      const before = previous.sources[source.id];
      if (error) {
        const kept = previous.jobs
          .filter((job) => job.source === source.id)
          .map((job) => ({ ...job, stale: true }));
        jobs.push(...kept);
        status[source.id] = {
          status: 'error',
          error,
          checkedAt: at,
          lastOkAt: before?.lastOkAt ?? null,
          baselineAt: before?.baselineAt ?? null,
          jobCount: kept.length,
        };
        continue;
      }
      const seen = new Set();
      for (const item of raw) {
        const key = `${source.id}:${item.id}`;
        const job = { ...item, employer: source.employer };
        if (seen.has(key) || !isRelevant(job, source)) continue;
        seen.add(key);
        jobs.push({
          key,
          source: source.id,
          employer: source.employer,
          title: item.title,
          url: item.url,
          location: item.location,
          team: item.team,
          publishedAt: item.publishedAt,
          firstSeenAt: previousByKey.get(key)?.firstSeenAt ?? at,
          lastSeenAt: at,
          stale: false,
          knowledge: extractKnowledge(item.description),
        });
      }
      status[source.id] = {
        status: 'ok',
        error: null,
        checkedAt: at,
        lastOkAt: at,
        baselineAt: before?.baselineAt ?? at,
        jobCount: seen.size,
      };
    }

    const titles = { ...previous.titles };
    for (const job of jobs) {
      const title = normalizeTitle(job.title);
      if (!titles[title] || job.firstSeenAt < titles[title]) {
        titles[title] = job.firstSeenAt;
      }
    }

    const state = { version: 2, checkedAt: at, sources: status, jobs, titles };
    await store.writeState(state);
    if (jobs.length) {
      await store.appendHistory(historyEntry(jobs, time, sources.map((source) => source.id)));
    }
    return state;
  }
}

/** The JSON the page reads from `api/state`. */
export function publicState(state, history, { refreshing = false } = {}) {
  return {
    checkedAt: state.checkedAt,
    refreshing,
    sources: SOURCES.map((source) => ({
      id: source.id,
      group: source.group,
      employer: source.employer,
      label: source.label,
      pageUrl: source.pageUrl,
      status: 'pending',
      error: null,
      checkedAt: null,
      lastOkAt: null,
      baselineAt: null,
      jobCount: 0,
      ...state.sources[source.id],
    })),
    jobs: state.jobs.map((job) => ({
      ...job,
      titleFirstSeenAt: state.titles[normalizeTitle(job.title)] ?? job.firstSeenAt,
    })),
    history,
  };
}
