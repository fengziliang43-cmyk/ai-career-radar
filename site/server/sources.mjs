import { SourceError } from './fetch.mjs';

/**
 * Fixed whitelist of public job boards. Keep in sync with
 * ../../sources/registry.md; adding a source needs 良's approval.
 * Each request reads the employer's full public list; classification into
 * career clusters happens later from the job title.
 */
export const SOURCES = [
  {
    id: 'openai',
    employer: 'OpenAI',
    label: 'OpenAI 全部公开职位',
    format: 'ashby',
    fetchUrl: 'https://api.ashbyhq.com/posting-api/job-board/openai',
    pageUrl: 'https://openai.com/careers/search/',
    jobUrlPrefix: 'https://jobs.ashbyhq.com/openai/',
    timeoutMs: 45_000,
  },
  {
    id: 'anthropic',
    employer: 'Anthropic',
    label: 'Anthropic 全部公开职位',
    format: 'greenhouse',
    fetchUrl: 'https://api.greenhouse.io/v1/boards/anthropic/jobs?content=true',
    pageUrl: 'https://www.anthropic.com/careers/jobs',
    jobUrlPrefix: 'https://job-boards.greenhouse.io/anthropic/jobs/',
    timeoutMs: 20_000,
  },
  {
    id: 'scaleai',
    employer: 'Scale AI',
    label: 'Scale AI 全部公开职位',
    format: 'greenhouse',
    fetchUrl: 'https://api.greenhouse.io/v1/boards/scaleai/jobs?content=true',
    pageUrl: 'https://scale.com/careers',
    jobUrlPrefix: 'https://job-boards.greenhouse.io/scaleai/jobs/',
    timeoutMs: 20_000,
  },
  {
    id: 'baidu-intern',
    employer: '百度',
    label: '百度实习职位（列表首页）',
    format: 'baidu',
    fetchUrl: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    pageUrl: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    jobUrlPrefix: 'https://talent.baidu.com/jobs/detail/INTERN/',
    timeoutMs: 15_000,
    // A general internship list: only titles with an AI signal count.
    requireAiTitle: true,
  },
];

const INVALID = '职位列表格式无法识别';

/**
 * Parse one source body into raw jobs. Descriptions are returned as plain
 * text for knowledge extraction only and are never persisted.
 * @returns {Array<{id: string, title: string, url: string, location: string,
 *   team: string, publishedAt: string | null, description: string}>}
 */
export function parseSource(source, body) {
  const rows = source.format === 'baidu' ? baiduRows(body) : jsonRows(body);
  const jobs = [];
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object') throw new SourceError(INVALID);
    const job =
      source.format === 'ashby'
        ? ashbyJob(raw)
        : source.format === 'greenhouse'
          ? greenhouseJob(raw)
          : baiduJob(raw, source);
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
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new SourceError(INVALID);
  }
  if (!payload || !Array.isArray(payload.jobs)) throw new SourceError(INVALID);
  return payload.jobs;
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

function baiduJob(raw, source) {
  const id = text(raw.postId);
  if (!/^[0-9a-z-]{6,64}$/i.test(id)) throw new SourceError(INVALID);
  return {
    id,
    title: raw.name,
    url: `${source.jobUrlPrefix}${id}`,
    location: text(raw.workPlace) || '未注明地区',
    team: text(raw.projectType) || '',
    publishedAt: validDate(raw.publishDate),
    description: `${text(raw.workContent)}\n${text(raw.serviceCondition)}`,
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
