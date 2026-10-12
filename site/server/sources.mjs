import { SourceError } from './fetch.mjs';

/**
 * Fixed whitelist of public job boards. Keep in sync with
 * ../../sources/registry.md; adding a source needs 良's approval.
 * Each source is read in full; classification into career clusters happens
 * later from the job title. `requireAiTitle` marks employers whose lists are
 * mostly not about AI: only titles with an AI signal count there.
 */
const ashby = (board, extra) => ({
  format: 'ashby',
  fetchUrl: `https://api.ashbyhq.com/posting-api/job-board/${board}`,
  jobUrlPrefix: `https://jobs.ashbyhq.com/${board}/`,
  timeoutMs: 30_000,
  ...extra,
});
const greenhouse = (board, extra) => ({
  format: 'greenhouse',
  fetchUrl: `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`,
  jobUrlPrefix: `https://job-boards.greenhouse.io/${board}/jobs/`,
  timeoutMs: 30_000,
  ...extra,
});

export const SOURCES = [
  // 海外 AI 公司
  ashby('openai', {
    id: 'openai',
    group: '海外 AI 公司',
    employer: 'OpenAI',
    label: 'OpenAI 全部公开职位',
    pageUrl: 'https://openai.com/careers/search/',
    timeoutMs: 45_000,
  }),
  greenhouse('anthropic', {
    id: 'anthropic',
    group: '海外 AI 公司',
    employer: 'Anthropic',
    label: 'Anthropic 全部公开职位',
    fetchUrl: 'https://api.greenhouse.io/v1/boards/anthropic/jobs?content=true',
    pageUrl: 'https://www.anthropic.com/careers/jobs',
  }),
  greenhouse('scaleai', {
    id: 'scaleai',
    group: '海外 AI 公司',
    employer: 'Scale AI',
    label: 'Scale AI 全部公开职位',
    fetchUrl: 'https://api.greenhouse.io/v1/boards/scaleai/jobs?content=true',
    pageUrl: 'https://scale.com/careers',
  }),
  // Lever's JSON API sends ~6 MB uncompressed, too slow from the server; the
  // hosted list page has the same postings gzipped to ~110 KB (no descriptions).
  {
    id: 'palantir',
    group: '海外 AI 公司',
    employer: 'Palantir',
    label: 'Palantir 全部公开职位',
    format: 'lever-page',
    fetchUrl: 'https://jobs.lever.co/palantir',
    pageUrl: 'https://www.palantir.com/careers/',
    jobUrlPrefix: 'https://jobs.lever.co/palantir/',
    timeoutMs: 30_000,
  },
  greenhouse('databricks', {
    id: 'databricks',
    group: '海外 AI 公司',
    employer: 'Databricks',
    label: 'Databricks 公开职位（只计 AI 岗位）',
    pageUrl: 'https://www.databricks.com/company/careers/open-positions',
    jobUrlPrefix: 'https://databricks.com/company/',
    timeoutMs: 45_000,
    requireAiTitle: true,
  }),

  // Agent 公司
  ashby('sierra', { id: 'sierra', group: 'Agent 公司', employer: 'Sierra', label: 'Sierra 全部公开职位', pageUrl: 'https://sierra.ai/careers' }),
  ashby('decagon', { id: 'decagon', group: 'Agent 公司', employer: 'Decagon', label: 'Decagon 全部公开职位', pageUrl: 'https://decagon.ai/careers' }),
  greenhouse('gleanwork', { id: 'glean', group: 'Agent 公司', employer: 'Glean', label: 'Glean 全部公开职位', pageUrl: 'https://www.glean.com/careers' }),
  ashby('cohere', { id: 'cohere', group: 'Agent 公司', employer: 'Cohere', label: 'Cohere 全部公开职位', pageUrl: 'https://cohere.com/careers' }),
  ashby('langchain', { id: 'langchain', group: 'Agent 公司', employer: 'LangChain', label: 'LangChain 全部公开职位', pageUrl: 'https://www.langchain.com/careers' }),

  // 医疗 AI
  ashby('abridge', { id: 'abridge', group: '医疗 AI', employer: 'Abridge', label: 'Abridge 全部公开职位', pageUrl: 'https://www.abridge.com/careers' }),
  ashby('ambiencehealthcare', { id: 'ambience', group: '医疗 AI', employer: 'Ambience', label: 'Ambience Healthcare 全部公开职位', pageUrl: 'https://www.ambiencehealthcare.com/careers' }),
  ashby('openevidence', { id: 'openevidence', group: '医疗 AI', employer: 'OpenEvidence', label: 'OpenEvidence 全部公开职位', pageUrl: 'https://www.openevidence.com/careers' }),
  ashby('nabla', { id: 'nabla', group: '医疗 AI', employer: 'Nabla', label: 'Nabla 全部公开职位', pageUrl: 'https://www.nabla.com/careers' }),
  greenhouse('suki', { id: 'suki', group: '医疗 AI', employer: 'Suki', label: 'Suki 全部公开职位', pageUrl: 'https://www.suki.ai/careers', jobUrlPrefix: 'https://www.suki.ai/' }),
  greenhouse('pathai', { id: 'pathai', group: '医疗 AI', employer: 'PathAI', label: 'PathAI 全部公开职位', pageUrl: 'https://www.pathai.com/careers', jobUrlPrefix: 'https://www.pathai.com/' }),
  greenhouse('flatironhealth', { id: 'flatiron', group: '医疗 AI', employer: 'Flatiron Health', label: 'Flatiron Health 全部公开职位', pageUrl: 'https://flatiron.com/careers', jobUrlPrefix: 'https://flatiron.com/' }),

  // 国内
  {
    id: 'tencent',
    group: '国内',
    employer: '腾讯',
    label: '腾讯社会招聘（只计 AI 岗位）',
    format: 'tencent',
    fetchUrl: 'https://careers.tencent.com/tencentcareer/api/post/Query',
    pageUrl: 'https://careers.tencent.com/search.html',
    jobUrlPrefix: 'https://careers.tencent.com/jobdesc.html?postId=',
    timeoutMs: 45_000,
    requireAiTitle: true,
  },
  {
    id: 'meituan',
    group: '国内',
    employer: '美团',
    label: '美团社会招聘（只计 AI 岗位）',
    format: 'meituan',
    fetchUrl: 'https://zhaopin.meituan.com/api/official/job/getJobList',
    pageUrl: 'https://zhaopin.meituan.com/web/social',
    jobUrlPrefix: 'https://zhaopin.meituan.com/web/position/detail?jobUnionId=',
    timeoutMs: 30_000,
    requireAiTitle: true,
  },
  {
    id: 'netease',
    group: '国内',
    employer: '网易',
    label: '网易招聘（只计 AI 岗位）',
    format: 'netease',
    fetchUrl: 'https://hr.163.com/api/hr163/position/queryPage',
    pageUrl: 'https://hr.163.com/job-list.html',
    jobUrlPrefix: 'https://hr.163.com/job-detail.html?id=',
    timeoutMs: 20_000,
    requireAiTitle: true,
  },
  {
    id: 'baidu-intern',
    group: '国内',
    employer: '百度',
    label: '百度实习职位（列表首页）',
    format: 'baidu',
    fetchUrl: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    pageUrl: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    jobUrlPrefix: 'https://talent.baidu.com/jobs/detail/INTERN/',
    timeoutMs: 15_000,
    requireAiTitle: true,
  },
];

const INVALID = '职位列表格式无法识别';
const PAGE_PAUSE_MS = 300;
const RETRY_DELAY_MS = 2_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One retry for dropped connections, timeouts, 429 and 5xx; nothing else.
async function fetchOnce(fetchText, url, options, retryDelay) {
  try {
    return await fetchText(url, options);
  } catch (error) {
    if (!(error instanceof SourceError && error.transient)) throw error;
    if (retryDelay) await sleep(retryDelay);
    return fetchText(url, options);
  }
}

/**
 * Paginated career sites. `request(page)` builds one fixed query; `rows(body)`
 * returns that page's jobs and whether the list is complete. A list longer
 * than `maxPages` fails the source rather than silently truncating it.
 */
const PAGERS = {
  tencent: {
    maxPages: 5,
    request: (source, page) => ({
      url: `${source.fetchUrl}?${new URLSearchParams({
        timestamp: String(Date.now()),
        countryId: '',
        cityId: '',
        bgIds: '',
        productId: '',
        categoryId: '',
        parentCategoryId: '',
        attrId: '',
        keyword: '',
        pageIndex: String(page),
        pageSize: '3000',
        language: 'zh-cn',
        area: 'cn',
      })}`,
    }),
    rows: (payload, seen) => {
      const posts = payload?.Data?.Posts;
      const total = payload?.Data?.Count;
      if (payload?.Code !== 200 || !Array.isArray(posts) || typeof total !== 'number') return null;
      return { rows: posts, done: seen + posts.length >= total || posts.length === 0 };
    },
  },
  meituan: {
    maxPages: 8,
    request: (source, page) => ({
      url: source.fetchUrl,
      method: 'POST',
      body: JSON.stringify({
        page: { pageNo: page, pageSize: 1000 },
        jobShareType: '1',
        keywords: '',
        cityList: [],
        department: [],
        jfJgList: [],
        jobType: [{ code: '3', subCode: [] }],
        typeCode: [],
        specialCode: [],
      }),
    }),
    rows: (payload, seen) => {
      const list = payload?.data?.list;
      const total = payload?.data?.page?.totalCount;
      if (!Array.isArray(list) || typeof total !== 'number') return null;
      return { rows: list, done: seen + list.length >= total || list.length < 1000 };
    },
  },
  netease: {
    maxPages: 30,
    request: (source, page) => ({
      url: source.fetchUrl,
      method: 'POST',
      body: JSON.stringify({ currentPage: page, pageSize: 200 }),
    }),
    rows: (payload, seen, page) => {
      const list = payload?.data?.list;
      const pages = payload?.data?.pages;
      if (payload?.code !== 200 || !Array.isArray(list) || typeof pages !== 'number') return null;
      return { rows: list, done: page >= pages || list.length === 0 };
    },
  },
};

/**
 * Read one source completely and return its jobs. Descriptions are returned
 * as plain text for knowledge extraction only and are never persisted.
 * @returns {Promise<Array<{id: string, title: string, url: string,
 *   location: string, team: string, publishedAt: string | null,
 *   description: string}>>}
 */
export async function loadSource(
  source,
  fetchText,
  { pause = PAGE_PAUSE_MS, retryDelay = RETRY_DELAY_MS } = {},
) {
  const pager = PAGERS[source.format];
  if (!pager) {
    const body = await fetchOnce(fetchText, source.fetchUrl, { timeoutMs: source.timeoutMs }, retryDelay);
    return parseSource(source, body);
  }
  const jobs = [];
  let seen = 0;
  for (let page = 1; page <= pager.maxPages; page++) {
    if (page > 1 && pause) await sleep(pause);
    const request = pager.request(source, page);
    const body = await fetchOnce(fetchText, request.url, { ...request, timeoutMs: source.timeoutMs }, retryDelay);
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new SourceError(INVALID);
    }
    const result = pager.rows(payload, seen, page);
    if (!result) throw new SourceError(INVALID);
    seen += result.rows.length;
    jobs.push(...toJobs(source, result.rows));
    if (result.done) return jobs;
  }
  throw new SourceError('职位数超过预期上限');
}

/** Parse a single-response source (Ashby, Greenhouse, Lever page, Baidu list). */
export function parseSource(source, body) {
  const rows =
    source.format === 'baidu'
      ? baiduRows(body)
      : source.format === 'lever-page'
        ? leverPageRows(body)
        : jsonRows(body);
  return toJobs(source, rows);
}

/** Exported for tests: map one paginated page body to jobs. */
export function parsePage(source, body, seen = 0, page = 1) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new SourceError(INVALID);
  }
  const result = PAGERS[source.format].rows(payload, seen, page);
  if (!result) throw new SourceError(INVALID);
  return { jobs: toJobs(source, result.rows), done: result.done };
}

const MAPPERS = {
  ashby: ashbyJob,
  greenhouse: greenhouseJob,
  'lever-page': (raw) => raw,
  baidu: baiduJob,
  tencent: tencentJob,
  meituan: meituanJob,
  netease: neteaseJob,
};

function toJobs(source, rows) {
  const jobs = [];
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object') throw new SourceError(INVALID);
    const job = MAPPERS[source.format](raw, source);
    if (!job) continue;
    if (
      !job.id ||
      typeof job.title !== 'string' ||
      !job.title.trim() ||
      typeof job.url !== 'string' ||
      !job.url.startsWith(source.jobUrlPrefix)
    ) {
      throw new SourceError(INVALID);
    }
    jobs.push({ ...job, title: cleanSpace(job.title) });
  }
  return jobs;
}

function jsonRows(body) {
  const payload = parseJson(body);
  if (!payload || !Array.isArray(payload.jobs)) throw new SourceError(INVALID);
  return payload.jobs;
}

function parseJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    throw new SourceError(INVALID);
  }
}

function ashbyJob(raw) {
  if (raw.isListed === false) return null;
  const locations = [
    raw.location,
    ...(Array.isArray(raw.secondaryLocations)
      ? raw.secondaryLocations.map((item) => item?.location)
      : []),
  ].filter((value) => typeof value === 'string' && value.trim());
  return {
    id: String(raw.id ?? ''),
    title: raw.title,
    url: raw.jobUrl,
    location: [...new Set(locations)].join(' · ') || '未注明地区',
    team: text(raw.department) || text(raw.team),
    publishedAt: validDate(raw.publishedAt),
    description: text(raw.descriptionPlain),
  };
}

function greenhouseJob(raw) {
  return {
    id: String(raw.id ?? ''),
    title: raw.title,
    url: raw.absolute_url,
    location: text(raw.location?.name) || '未注明地区',
    team: Array.isArray(raw.departments) ? text(raw.departments[0]?.name) : '',
    publishedAt: validDate(raw.first_published) ?? validDate(raw.updated_at),
    description: htmlToText(text(raw.content)),
  };
}

// Lever's hosted list page groups postings under team headings. Each posting
// carries its id, link, title and location; descriptions are not on this page.
function leverPageRows(body) {
  if (!body.includes('postings-wrapper')) throw new SourceError(INVALID);
  const rows = [];
  for (const group of body.split('<div class="postings-group">').slice(1)) {
    const team = decodeEntities(group.match(/class="posting-category-title[^"]*"[^>]*>([^<]*)</)?.[1] ?? '').trim();
    const postings = group.matchAll(
      /<div class="posting" data-qa-posting-id="([0-9a-f-]{36})">[\s\S]*?<a class="posting-title" href="([^"]+)"><h5 data-qa="posting-name">([\s\S]*?)<\/h5>([\s\S]*?)<\/a>/g,
    );
    for (const [, id, url, title, categories] of postings) {
      const location = categories.match(/class="[^"]*\blocation\b[^"]*">([^<]*)</)?.[1] ?? '';
      rows.push({
        id,
        title: decodeEntities(title.replace(/<[^>]*>/g, '')).trim(),
        url: decodeEntities(url),
        location: decodeEntities(location).trim() || '未注明地区',
        team,
        publishedAt: null,
        description: '',
      });
    }
  }
  const listed = (body.match(/data-qa-posting-id="/g) ?? []).length;
  if (rows.length !== listed) throw new SourceError(INVALID);
  return rows;
}

function baiduJob(raw, source) {
  const id = text(raw.postId);
  if (!/^[0-9a-z-]{6,64}$/i.test(id)) throw new SourceError(INVALID);
  return {
    id,
    title: raw.name,
    url: `${source.jobUrlPrefix}${id}`,
    location: text(raw.workPlace) || '未注明地区',
    team: text(raw.projectType),
    publishedAt: validDate(raw.publishDate),
    description: `${text(raw.workContent)}\n${text(raw.serviceCondition)}`,
  };
}

function tencentJob(raw, source) {
  const id = text(raw.PostId);
  if (!/^\d{6,30}$/.test(id)) throw new SourceError(INVALID);
  const day = text(raw.LastUpdateTime).match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  return {
    id,
    title: raw.RecruitPostName,
    url: `${source.jobUrlPrefix}${id}`,
    location: text(raw.LocationName) || text(raw.CountryName) || '未注明地区',
    team: [text(raw.BGName), text(raw.CategoryName)].filter(Boolean).join(' · '),
    publishedAt: day ? `${day[1]}-${day[2].padStart(2, '0')}-${day[3].padStart(2, '0')}` : null,
    description: text(raw.Responsibility),
  };
}

function meituanJob(raw, source) {
  const id = text(String(raw.jobUnionId ?? ''));
  if (!/^\d{4,30}$/.test(id)) throw new SourceError(INVALID);
  const cities = Array.isArray(raw.cityList) ? raw.cityList.map((city) => text(city?.name)).filter(Boolean) : [];
  const department = Array.isArray(raw.department) ? text(raw.department[0]?.name) : '';
  const time = raw.refreshTime ?? raw.firstPostTime;
  return {
    id,
    title: raw.name,
    url: `${source.jobUrlPrefix}${id}&highlightType=social`,
    location: cities.join('、') || '未注明地区',
    team: department || text(raw.jobFamily),
    publishedAt: Number.isFinite(time) ? new Date(time).toISOString() : null,
    description: `${text(raw.jobDuty)}\n${text(raw.jobRequirement)}`,
  };
}

function neteaseJob(raw, source) {
  const id = String(raw.id ?? '');
  if (!/^\d{1,12}$/.test(id)) throw new SourceError(INVALID);
  const places = Array.isArray(raw.workPlaceNameList) ? raw.workPlaceNameList.filter((value) => typeof value === 'string') : [];
  return {
    id,
    title: raw.name,
    url: `${source.jobUrlPrefix}${id}&lang=zh`,
    location: places.join('、') || '未注明地区',
    team: text(raw.firstDepName),
    publishedAt: Number.isFinite(raw.updateTime) ? new Date(raw.updateTime).toISOString() : null,
    description: `${text(raw.description)}\n${text(raw.requirement)}`,
  };
}

// The Baidu list page embeds its first page of jobs as JSON. Extract that
// array by bracket matching instead of evaluating any page script.
function baiduRows(body) {
  const marker = '"listDetailData":';
  const start = body.indexOf(marker);
  const offset = start < 0 ? -1 : body.indexOf('[', start + marker.length);
  if (offset < 0) throw new SourceError(INVALID);
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = offset; index < body.length; index++) {
    const char = body[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '[') depth++;
    else if (char === ']' && --depth === 0) {
      try {
        const rows = JSON.parse(body.slice(offset, index + 1));
        if (Array.isArray(rows)) return rows;
      } catch {
        break;
      }
    }
  }
  throw new SourceError(INVALID);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const code =
        entity[1].toLowerCase() === 'x'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000
        ? String.fromCodePoint(code)
        : ' ';
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

// Greenhouse returns entity-escaped HTML; decode once to get markup, strip
// tags, then decode again for the text entities inside.
export function htmlToText(value) {
  return cleanSpace(
    decodeEntities(
      decodeEntities(value)
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<\/(p|div|li|h\d|br|ul|ol)>|<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, ' '),
    ),
  );
}

function cleanSpace(value) {
  return value.replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Date-only values stay as YYYY-MM-DD so time zones cannot shift the day.
function validDate(value) {
  if (typeof value !== 'string') return null;
  const day = value.trim().match(/^(\d{4}-\d{2}-\d{2})(?:[ T]00:00(?::00)?)?$/);
  if (day) return day[1];
  return Number.isNaN(Date.parse(value)) ? null : new Date(value).toISOString();
}
