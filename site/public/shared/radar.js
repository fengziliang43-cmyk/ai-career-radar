// Pure functions shared by the browser and the server: classify jobs into
// research clusters and build the page view. No DOM or Node APIs here.
import {
  aiTitle,
  clusterRules,
  excludedTeams,
  excludedTitle,
  otherGroups,
} from '../data/rules.js';

const DAY = 86_400_000;
export const NEW_JOB_DAYS = 7;
export const NEW_TITLE_DAYS = 14;
const TREND_DAYS = 90;

const PLACES =
  'sf|san francisco|nyc|new york(?: city)?|seattle|london|tokyo|singapore|paris|dublin|munich|zurich|madrid|uae|toronto|sydney|seoul|washington(?:,? d\\.?c\\.?)?|emea|apac|mena|japan|korea|france|nordics|india|remote|us|uk|anz|latam|hawaii';
const PLACE_SUFFIX = new RegExp(`\\s*(?:[-–—|]\\s*)+(?:${PLACES})\\b.*$`, 'i');
const SENIORITY =
  /\b(?:senior|sr\.?|staff\+?|principal|junior|mid[- ]level|entry[- ]level)(?=\W|$)/gi;

/**
 * Business functions never enter the radar. For employers whose lists are
 * mostly not about AI (requireAiTitle), the title itself must carry an AI
 * signal; matching a cluster rule alone is not enough there, because words
 * like 医药 or 解决方案 also describe ordinary jobs.
 */
export function isRelevant(job, { requireAiTitle = false } = {}) {
  if (excludedTeams.has(job.team) || excludedTitle.test(job.title)) return false;
  return !requireAiTitle || aiTitle.test(job.title);
}

export function matchClusters(title) {
  const ids = [];
  for (const [id, rule] of Object.entries(clusterRules)) {
    if (
      rule.include.some((pattern) => pattern.test(title)) &&
      !(rule.exclude ?? []).some((pattern) => pattern.test(title))
    ) {
      ids.push(id);
    }
  }
  return ids;
}

export function groupOf(title) {
  return (otherGroups.find(({ pattern }) => pattern.test(title)) ?? otherGroups.at(-1)).id;
}

/** Same role at another location or seniority collapses to one title. */
export function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]|\[[^\]]*\]/g, ' ')
    .replace(PLACE_SUFFIX, '')
    .replace(SENIORITY, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Title without a trailing location such as " - SF" or "| Tokyo". */
export function displayTitle(title) {
  return title.replace(PLACE_SUFFIX, '').trim() || title;
}

const CHINA =
  /中国(?!香港|澳门|台湾)|北京|上海|杭州|深圳|广州|成都|南京|武汉|西安|苏州|厦门|合肥|重庆|天津|长沙|郑州|济南|青岛|大连|珠海|东莞|佛山|宁波|无锡|福州|石家庄|beijing|shanghai|hangzhou|shenzhen|guangzhou|chengdu|china/i;

export function isChina(job) {
  return CHINA.test(job.location ?? '');
}

/** History is keyed by UTC day so the server and laptop agree. */
export function dayKey(time) {
  return new Date(time).toISOString().slice(0, 10);
}

/**
 * One history row: open postings and employers per cluster for a day, plus
 * the source ids it was computed from so trends never mix source sets.
 */
export function historyEntry(jobs, time, sourceIds = []) {
  const clusters = {};
  let other = 0;
  for (const job of jobs) {
    const ids = matchClusters(job.title);
    if (!ids.length) other++;
    for (const id of ids) {
      clusters[id] ??= { count: 0, employers: [] };
      clusters[id].count++;
      if (!clusters[id].employers.includes(job.employer)) {
        clusters[id].employers.push(job.employer);
      }
    }
  }
  return { date: dayKey(time), sources: [...sourceIds].sort(), total: jobs.length, other, clusters };
}

// Trend lines only compare days that used the same sources as the latest day.
function comparableHistory(history) {
  const key = (day) => (Array.isArray(day.sources) ? day.sources.join(',') : '');
  const latest = history.at(-1);
  return latest ? history.filter((day) => key(day) === key(latest)) : [];
}

/**
 * Everything the page shows, computed from the research snapshot plus the
 * live state returned by `api/state`. `data` may be null when the live
 * service is unreachable; research content still renders.
 */
export function buildView({ clusters, data, now = Date.now() }) {
  const sources = new Map((data?.sources ?? []).map((source) => [source.id, source]));
  const isNewSince = (time, baseline, days) => {
    const first = Date.parse(time ?? '');
    const base = Date.parse(baseline ?? '');
    return (
      Number.isFinite(first) &&
      Number.isFinite(base) &&
      first > base &&
      now - first <= days * DAY
    );
  };

  const jobs = (data?.jobs ?? []).map((job) => {
    const baseline = sources.get(job.source)?.baselineAt;
    return {
      ...job,
      clusterIds: matchClusters(job.title),
      isNew: isNewSince(job.firstSeenAt, baseline, NEW_JOB_DAYS),
      isNewTitle: isNewSince(job.titleFirstSeenAt, baseline, NEW_TITLE_DAYS),
    };
  });

  const byCluster = new Map(clusters.map((cluster) => [cluster.id, []]));
  const others = [];
  for (const job of jobs) {
    if (!job.clusterIds.length) others.push(job);
    for (const id of job.clusterIds) byCluster.get(id)?.push(job);
  }

  const history = comparableHistory(data?.history ?? []).slice(-TREND_DAYS);
  const clusterViews = clusters.map((cluster) => {
    const list = byCluster.get(cluster.id) ?? [];
    const employers = tally(list.map((job) => job.employer));
    const newJobs = list.filter((job) => job.isNew);
    const newEmployers = employers
      .filter(({ name }) => list.every((job) => job.employer !== name || job.isNew))
      .map(({ name }) => name);
    return {
      ...cluster,
      jobCount: list.length,
      employers,
      chinaCount: list.filter(isChina).length,
      staleCount: list.filter((job) => job.stale).length,
      newJobs,
      newEmployers,
      roles: groupRoles(list),
      skills: tally(list.flatMap((job) => job.knowledge ?? [])).slice(0, 10),
      series: history.map((day) => ({
        date: day.date,
        count: day.clusters?.[cluster.id]?.count ?? 0,
      })),
    };
  });

  const groupLabels = new Map(otherGroups.map((group) => [group.id, group.label]));
  const groups = new Map();
  for (const job of others) {
    const id = groupOf(job.title);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(job);
  }
  const otherViews = [...groups]
    .map(([id, list]) => ({
      id,
      label: groupLabels.get(id) ?? id,
      jobCount: list.length,
      employers: tally(list.map((job) => job.employer)),
      roles: groupRoles(list),
    }))
    .sort((a, b) => b.jobCount - a.jobCount);
  const newTitles = groupRoles(others.filter((job) => job.isNewTitle));

  return {
    clusters: clusterViews,
    others: otherViews,
    otherCount: others.length,
    newTitles,
    changes: buildChanges(clusterViews, newTitles, data, now),
    jobCount: jobs.length,
    matchedCount: jobs.length - others.length,
    employerCount: new Set(jobs.map((job) => job.employer)).size,
    baselineAt: earliest([...sources.values()].map((source) => source.baselineAt)),
    history,
  };
}

function buildChanges(clusterViews, newTitles, data, now) {
  const changes = [];
  for (const source of data?.sources ?? []) {
    if (source.status === 'error') {
      changes.push({
        kind: 'source',
        text: `${source.label}这次没读到（${source.error ?? '原因未知'}），沿用 ${source.lastOkAt ? shortDate(source.lastOkAt) : '上次'} 的岗位。`,
      });
    }
  }
  for (const cluster of clusterViews) {
    if (cluster.newEmployers.length) {
      changes.push({
        kind: 'employer',
        clusterId: cluster.id,
        text: `首次出现雇主：${cluster.newEmployers.join('、')}`,
      });
    }
    if (cluster.newJobs.length) {
      const by = tally(cluster.newJobs.map((job) => job.employer))
        .map(({ name, count }) => `${name} ${count}`)
        .join('、');
      changes.push({
        kind: 'jobs',
        clusterId: cluster.id,
        count: cluster.newJobs.length,
        text: `新增 ${cluster.newJobs.length} 个岗位（${by}）`,
      });
    }
    const weekAgo = cluster.series.findLast(
      (point) => Date.parse(point.date) <= now - NEW_JOB_DAYS * DAY,
    );
    if (weekAgo && weekAgo.count > 0 && cluster.jobCount === 0) {
      changes.push({
        kind: 'gone',
        clusterId: cluster.id,
        text: `在招岗位清零（${weekAgo.date.slice(5)} 还有 ${weekAgo.count} 个）`,
      });
    }
  }
  if (newTitles.length) {
    changes.push({
      kind: 'titles',
      count: newTitles.length,
      text: `未归类岗位里出现 ${newTitles.length} 个新职位名`,
    });
  }
  return changes;
}

/** Collapse postings of the same role (location or seniority variants). */
export function groupRoles(list) {
  const roles = new Map();
  for (const job of list) {
    const key = `${job.employer}\u0000${normalizeTitle(job.title)}`;
    if (!roles.has(key)) roles.set(key, []);
    roles.get(key).push(job);
  }
  return [...roles.values()]
    .map((postings) => {
      const sorted = [...postings].sort(byRecency);
      const title = postings
        .map((job) => displayTitle(job.title))
        .sort((a, b) => a.length - b.length)[0];
      return {
        title,
        employer: postings[0].employer,
        team: postings[0].team,
        url: sorted[0].url,
        count: postings.length,
        locations: [...new Set(postings.flatMap((job) => splitLocations(job.location)))],
        publishedAt: sorted[0].publishedAt,
        firstSeenAt: earliest(postings.map((job) => job.firstSeenAt)),
        isNew: postings.some((job) => job.isNew),
        isNewTitle: postings.some((job) => job.isNewTitle),
        stale: postings.every((job) => job.stale),
        china: postings.some(isChina),
        postings: sorted,
      };
    })
    .sort(
      (a, b) =>
        Number(b.isNew) - Number(a.isNew) ||
        b.count - a.count ||
        String(b.publishedAt ?? '').localeCompare(String(a.publishedAt ?? '')) ||
        a.title.localeCompare(b.title),
    );
}

// "San Francisco, CA; New York City, NY" and "北京市,上海市" both split per city.
function splitLocations(location) {
  return String(location ?? '')
    .split(/\s*[;|·，、]\s*|(?<=[一-鿿])\s*,\s*(?=[一-鿿])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function byRecency(a, b) {
  return (
    String(b.publishedAt ?? '').localeCompare(String(a.publishedAt ?? '')) ||
    String(b.firstSeenAt ?? '').localeCompare(String(a.firstSeenAt ?? ''))
  );
}

export function tally(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function earliest(values) {
  return (
    values
      .filter((value) => Number.isFinite(Date.parse(value ?? '')))
      .sort((a, b) => Date.parse(a) - Date.parse(b))[0] ?? null
  );
}

function shortDate(value) {
  const date = new Date(value);
  return `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`;
}
