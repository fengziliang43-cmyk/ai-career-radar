import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const HISTORY_DAYS = 730;

export function emptyState() {
  return { version: 2, checkedAt: null, sources: {}, jobs: [], titles: {} };
}

/**
 * Persistent state lives in two JSON files under `dir`:
 * - state.json: current postings (no full JDs), per-source status, and the
 *   first time each normalized title was seen;
 * - history.json: one row per UTC day with postings per cluster.
 */
export function createStore(dir) {
  const statePath = join(dir, 'state.json');
  const historyPath = join(dir, 'history.json');

  return {
    async readState() {
      const value = await readJson(statePath);
      if (!value || value.version !== 2) return emptyState();
      return {
        version: 2,
        checkedAt: typeof value.checkedAt === 'string' ? value.checkedAt : null,
        sources: isObject(value.sources) ? value.sources : {},
        jobs: Array.isArray(value.jobs) ? value.jobs.filter(isJob) : [],
        titles: isObject(value.titles) ? value.titles : {},
      };
    },
    async writeState(state) {
      await writeJson(statePath, state);
    },
    readHistory,
    async appendHistory(entry) {
      const days = await readHistory();
      if (days.at(-1)?.date === entry.date) days[days.length - 1] = entry;
      else days.push(entry);
      await writeJson(historyPath, { version: 1, days: days.slice(-HISTORY_DAYS) });
    },
  };

  async function readHistory() {
    const value = await readJson(historyPath);
    return Array.isArray(value?.days)
      ? value.days.filter((day) => typeof day?.date === 'string' && isObject(day.clusters))
      : [];
  }

  async function writeJson(path, value) {
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const temporary = `${path}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(value)}\n`, { mode: 0o600 });
    await rename(temporary, path);
  }
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isJob(job) {
  return (
    isObject(job) &&
    typeof job.key === 'string' &&
    typeof job.source === 'string' &&
    typeof job.title === 'string' &&
    typeof job.employer === 'string' &&
    typeof job.url === 'string' &&
    job.url.startsWith('https://')
  );
}
