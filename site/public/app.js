import {
  clusters,
  confidenceMeta,
  fitMeta,
  noveltyMeta,
  requiredKnowledgeNote,
  snapshot,
  stageMeta,
  statusMeta,
} from './data/clusters.js';
import { buildView, NEW_JOB_DAYS, NEW_TITLE_DAYS } from './shared/radar.js';

const DAY = 86_400_000;
const STALE_AFTER = 6 * 3_600_000; // 打开页面时数据超过 6 小时就刷新
const CHECK_EVERY = 30 * 60_000;
const ROLE_PREVIEW = 12;
const LENS_KEY = 'career-radar:lens';

const LENSES = {
  market: {
    note: '按新颖度和跨雇主扩散排序：正在扩散、刚冒头的职业在前。',
    order: (cluster) => cluster.rank,
    line: (cluster) => ['为什么算新', cluster.whyNew],
  },
  liang: {
    note: '按良能凭临床、AI 应用、产品和评测经验切入的先后排序。',
    order: (cluster) => cluster.fitRank,
    line: (cluster) => ['怎么进入', cluster.entry],
  },
};
const SOURCE_KIND = { official: '官方', employer: '雇主', research: '研究' };

const ui = {
  data: null,
  view: buildView({ clusters, data: null }),
  lens: readLens(),
  query: '',
  loading: true,
  refreshing: false,
  error: '',
  notice: '',
  open: new Set(),
  allRoles: new Set(),
  openGroups: new Set(),
};

const $ = (id) => document.getElementById(id);

// ---------- 数据 ----------

async function getState() {
  const response = await fetch('api/state', { cache: 'no-store' });
  if (!response.ok) throw new Error('职位数据暂时读不到');
  return response.json();
}

function setData(data) {
  ui.data = data;
  ui.view = buildView({ clusters, data });
}

function isStale(data) {
  const last = Date.parse(data?.checkedAt ?? '');
  return !Number.isFinite(last) || Date.now() - last >= STALE_AFTER;
}

async function refresh({ auto = false } = {}) {
  if (ui.refreshing) return;
  ui.refreshing = true;
  ui.error = '';
  ui.notice = '';
  renderStatus();
  try {
    const response = await fetch('api/refresh', {
      method: 'POST',
      headers: { 'x-radar-intent': 'refresh' },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error ?? '刷新失败，请稍后再试');
    setData(payload);
    if (payload.reused && !auto) ui.notice = '5 分钟内刚刷新过，显示的就是最新结果。';
  } catch (error) {
    ui.error = error instanceof Error && error.message ? error.message : '刷新失败，请稍后再试';
  } finally {
    ui.refreshing = false;
    render();
  }
}

async function checkForUpdates() {
  if (ui.refreshing || document.visibilityState !== 'visible') return;
  try {
    const data = await getState();
    setData(data);
    render();
    if (isStale(data) || data.refreshing) await refresh({ auto: true });
  } catch {
    // 下次检查再试；页面保留现有内容。
  }
}

// ---------- 渲染 ----------

function render() {
  renderStatus();
  renderSummary();
  renderAlerts();
  renderChanges();
  renderClusters();
  renderOthers();
  renderFooter();
}

function renderStatus() {
  const text = $('status-text');
  const button = $('refresh');
  const sourceCount = ui.data?.sources?.length ?? 4;
  if (ui.refreshing) text.textContent = `正在读取 ${sourceCount} 个招聘来源…`;
  else if (ui.loading) text.textContent = '正在读取职位数据…';
  else if (ui.data?.checkedAt) {
    text.innerHTML = `职位数据 <b>${esc(relativeTime(ui.data.checkedAt))}</b> 更新`;
  } else if (ui.data) text.textContent = '还没有职位数据，点刷新读取';
  else text.textContent = '职位数据暂时读不到';
  button.disabled = ui.refreshing;
  button.innerHTML = ui.refreshing ? '<span class="spin" aria-hidden="true"></span>刷新中' : '刷新';
}

function renderSummary() {
  const view = ui.view;
  const parts = ui.data?.jobs?.length
    ? [
        `<span><b>${fmt(view.jobCount)}</b> 个在招 AI 岗位，来自 ${view.employerCount} 家雇主</span>`,
        `<span>其中 <b>${fmt(view.matchedCount)}</b> 个属于下面 13 个职业簇</span>`,
      ]
    : [`<span><b>13</b> 个人工研究的职业簇</span>`];
  parts.push(`<span>研究判断截至 ${esc(snapshot.updatedAt)}</span>`);
  $('summary').innerHTML = parts.join('');
}

function renderAlerts() {
  const alerts = [];
  if (ui.error) alerts.push(`<p class="alert" role="alert">${esc(ui.error)}</p>`);
  if (ui.notice) alerts.push(`<p class="alert info">${esc(ui.notice)}</p>`);
  $('alerts').innerHTML = alerts.join('');
}

function renderChanges() {
  const box = $('changes');
  if (!ui.data) {
    box.innerHTML = `<p class="empty">${ui.loading ? '正在读取职位数据…' : '职位数据读不到，暂时没有变化可显示。'}</p>`;
    return;
  }
  const byId = new Map(ui.view.clusters.map((cluster) => [cluster.id, cluster]));
  const order = LENSES[ui.lens].order;
  const rank = (change) =>
    change.kind === 'source' ? -1 : change.clusterId ? order(byId.get(change.clusterId)) : 99;
  const changes = [...ui.view.changes].sort((a, b) => rank(a) - rank(b));
  if (!changes.length) {
    const baseline = Date.parse(ui.view.baselineAt ?? '');
    const recent = Number.isFinite(baseline) && Date.now() - baseline < NEW_JOB_DAYS * DAY;
    box.innerHTML = `<p class="empty">${
      recent
        ? `从 ${esc(fmtDay(ui.view.baselineAt))} 开始记录。之后新出现的岗位、雇主和职位名会列在这里。`
        : '最近 7 天没有新岗位、新雇主或新职位名。'
    }</p>`;
    return;
  }
  box.innerHTML = `<ul>${changes
    .map((change) => {
      if (change.kind === 'source') return `<li class="source">${esc(change.text)}</li>`;
      if (change.kind === 'titles') {
        return `<li><a href="#new-titles"><b>未归类</b> ${esc(change.text)}</a></li>`;
      }
      const cluster = byId.get(change.clusterId);
      return `<li><a href="#c-${cluster.id}" data-open="${cluster.id}"><b>${esc(cluster.shortTitle)}</b> ${esc(change.text)}</a></li>`;
    })
    .join('')}</ul>`;
}

function renderClusters() {
  const lens = LENSES[ui.lens];
  for (const button of document.querySelectorAll('[data-action="lens"]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lens === ui.lens));
  }
  $('lens-note').textContent = lens.note;
  const query = ui.query.trim().toLowerCase();
  const shown = ui.view.clusters
    .filter((cluster) => !query || searchText(cluster).includes(query))
    .sort((a, b) => lens.order(a) - lens.order(b));
  const list = $('clusters');
  if (!shown.length) {
    list.innerHTML = `<li class="empty-list">没有和“${esc(ui.query.trim())}”相关的职业簇。<button class="link-button" type="button" data-action="clear-search">清空搜索</button></li>`;
    return;
  }
  list.innerHTML = shown.map(clusterHtml).join('');
  for (const id of ui.open) {
    const panel = $(`d-${id}`);
    if (panel) panel.innerHTML = detailHtml(clusterById(id));
  }
}

function clusterHtml(cluster) {
  const open = ui.open.has(cluster.id);
  const zone = noveltyMeta[cluster.noveltyZone];
  const fit = fitMeta[cluster.fit];
  const rank = LENSES[ui.lens].order(cluster);
  const [lineLabel, lineText] = LENSES[ui.lens].line(cluster);
  return `<li class="cluster${open ? ' is-open' : ''}" id="c-${cluster.id}">
  <div class="cluster-head" data-action="toggle" data-id="${cluster.id}">
    <span class="rank">${String(rank).padStart(2, '0')}</span>
    <div class="name">
      <h3><button type="button" data-action="toggle" data-id="${cluster.id}" aria-expanded="${open}" aria-controls="d-${cluster.id}">${esc(cluster.shortTitle)}</button></h3>
      <p class="en">${esc(cluster.title)} · ${esc(cluster.category)}</p>
      <p class="line"><b>${lineLabel}：</b>${esc(lineText)}</p>
    </div>
    <div class="tags">
      <span class="chip zone-${cluster.noveltyZone}${ui.lens === 'liang' ? ' muted' : ''}" title="${esc(zone.note)}">${esc(zone.label)}</span>
      <span class="stage">需求${esc(stageMeta[cluster.demandStage])}</span>
      <span class="chip fit-${cluster.fit}${ui.lens === 'market' ? ' muted' : ''}" title="${esc(fit.note)}">${esc(fit.label)}</span>
    </div>
    <div class="live">${liveSummaryHtml(cluster)}</div>
    <span class="chev" aria-hidden="true"></span>
  </div>
  <div class="detail" id="d-${cluster.id}"${open ? '' : ' hidden'}></div>
</li>`;
}

function liveSummaryHtml(cluster) {
  if (!ui.data?.jobs) return '<span class="live-count zero"><b>—</b></span>';
  if (!cluster.jobCount) return '<span class="live-count zero"><b>0</b> 个在招</span>';
  const extras = [
    cluster.newJobs.length ? `<span class="badge-new">本周 +${cluster.newJobs.length}</span>` : '',
    cluster.chinaCount ? `<span>中国 ${cluster.chinaCount}</span>` : '',
    sparkline(cluster.series),
  ].join('');
  return `<span class="live-count"><b>${cluster.jobCount}</b> 个在招 · ${cluster.employers.length} 家</span>${
    extras ? `<span class="live-sub">${extras}</span>` : ''
  }`;
}

function detailHtml(cluster) {
  return `<div class="detail-research">
  <p class="eyebrow">研究判断 · ${esc(snapshot.updatedAt)}</p>
  <p class="judgment">${esc(cluster.judgment)}</p>
  <h4>为什么算新</h4>
  <p>${esc(cluster.whyNew)}</p>
  <h4>为什么适配良</h4>
  <p>${esc(cluster.fitReason)}</p>
  <h4>信号</h4>
  <p>${esc(cluster.signal)}</p>
  <h4>可核验事实</h4>
  <ul class="prose-list">${cluster.facts.map((fact) => `<li>${esc(fact)}</li>`).join('')}</ul>
  <div class="pair">
    <section class="callout"><h4>反证 / 失效条件</h4><p>${esc(cluster.countercase)}</p></section>
    <section class="callout entry"><h4>现在怎么进入</h4><p>${esc(cluster.entry)}</p></section>
  </div>
  <h4>应聘需要的知识</h4>
  <dl class="knowledge">${cluster.requiredKnowledge
    .map((item) => `<div><dt>${esc(item.area)}</dt><dd>${esc(item.detail)}</dd></div>`)
    .join('')}</dl>
  <p class="note">${esc(requiredKnowledgeNote)}</p>
  <h4>检索词</h4>
  <p class="tokens">${cluster.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join('')}</p>
  <h4>主要来源</h4>
  <ul class="source-list">${cluster.sources
    .map((source) => `<li>${link(source.url, source.label)}<small>${SOURCE_KIND[source.kind] ?? ''}</small></li>`)
    .join('')}</ul>
  <p class="meta">${esc(statusMeta[cluster.institutionalStatus])} · 置信度${esc(confidenceMeta[cluster.confidence])} · 最近信号 ${esc(cluster.lastSignalAt)}</p>
</div>
<div class="detail-live">${liveDetailHtml(cluster)}</div>`;
}

function liveDetailHtml(cluster) {
  if (!ui.data?.jobs) {
    return '<p class="eyebrow">现在在招</p><p class="no-jobs">职位数据暂时读不到。</p>';
  }
  let html = `<p class="eyebrow">现在在招 · ${esc(relativeTime(ui.data.checkedAt))}</p>`;
  if (!cluster.jobCount) {
    return `${html}<p class="no-jobs">追踪的 ${ui.data.sources.length} 个招聘来源里，目前没有这个方向的岗位。</p>`;
  }
  html += `<p class="live-total"><b>${cluster.jobCount}</b> 个岗位，来自 ${cluster.employers.length} 家雇主${
    cluster.newJobs.length ? ` <span class="badge-new">本周新增 ${cluster.newJobs.length}</span>` : ''
  }</p>`;
  html += `<p class="employer-split">${cluster.employers
    .map(({ name, count }) => `${esc(name)} ${count}`)
    .join(' · ')}${cluster.chinaCount ? ` · 其中中国岗位 ${cluster.chinaCount}` : ''}</p>`;
  if (cluster.series.length >= 2) html += trendHtml(cluster.series);
  if (cluster.skills.length) {
    html += `<h4>这些岗位里常见的技能词</h4><p class="tokens">${cluster.skills
      .map(({ name, count }) => `<span>${esc(name)}<b>${count}</b></span>`)
      .join('')}</p>`;
  }
  const showAll = ui.allRoles.has(cluster.id);
  const roles = showAll ? cluster.roles : cluster.roles.slice(0, ROLE_PREVIEW);
  html += `<h4>职位（同一职位的不同城市已合并）</h4><ul class="roles">${roles.map(roleHtml).join('')}</ul>`;
  if (cluster.roles.length > ROLE_PREVIEW) {
    html += `<p class="more"><button class="link-button" type="button" data-action="all-roles" data-id="${cluster.id}">${
      showAll ? '收起' : `显示全部 ${cluster.roles.length} 个职位`
    }</button></p>`;
  }
  return html;
}

function roleHtml(role) {
  const places = role.locations.slice(0, 3).join(' / ');
  const meta = [
    esc(role.employer),
    places && esc(places + (role.locations.length > 3 ? ` 等 ${role.locations.length} 地` : '')),
    role.publishedAt && `<span class="nowrap">发布于 ${esc(fmtDate(role.publishedAt))}</span>`,
    role.stale && '<span class="stale">该来源本次没读到，沿用上次数据</span>',
  ].filter(Boolean);
  return `<li class="role"><p class="role-title">${link(role.url, role.title)}${
    role.count > 1 ? `<span class="times">×${role.count}</span>` : ''
  }${role.isNew ? '<span class="badge-new">新</span>' : ''}</p><p class="role-meta">${meta.join(' · ')}</p></li>`;
}

function renderOthers() {
  const box = $('others');
  const view = ui.view;
  if (!ui.data?.jobs) {
    $('others-title').textContent = '职业簇之外的 AI 岗位';
    box.innerHTML = `<p class="lede">${ui.loading ? '正在读取职位数据…' : '职位数据读不到。'}</p>`;
    return;
  }
  $('others-title').innerHTML = `职业簇之外的 AI 岗位<small>${fmt(view.otherCount)} 个</small>`;
  const baseline = Date.parse(view.baselineAt ?? '');
  const recent = Number.isFinite(baseline) && Date.now() - baseline < NEW_TITLE_DAYS * DAY;
  const newTitles = view.newTitles.length
    ? `<ul class="roles">${view.newTitles.map(roleHtml).join('')}</ul>`
    : `<p>${
        recent
          ? `从 ${esc(fmtDay(view.baselineAt))} 开始记录职位名，之后第一次出现的会列在这里。`
          : '最近两周没有出现新的职位名。'
      }</p>`;
  box.innerHTML = `<div class="new-titles" id="new-titles"><h3>近 ${NEW_TITLE_DAYS} 天新出现的职位名</h3>${newTitles}</div>
<ul class="groups">${view.others.map(groupHtml).join('')}</ul>`;
}

function groupHtml(group) {
  const open = ui.openGroups.has(group.id);
  return `<li class="group${open ? ' is-open' : ''}">
  <button class="group-head" type="button" data-action="group" data-id="${group.id}" aria-expanded="${open}">
    <span class="label">${esc(group.label)}</span>
    <span class="count">${group.jobCount}</span>
    <span class="by">${group.employers.map(({ name, count }) => `${esc(name)} ${count}`).join(' · ')}</span>
    <span class="chev" aria-hidden="true"></span>
  </button>
  <div class="group-body"${open ? '' : ' hidden'}>${
    open ? `<ul class="roles">${group.roles.map(roleHtml).join('')}</ul>` : ''
  }</div>
</li>`;
}

function renderFooter() {
  const sources = ui.data?.sources ?? [];
  const reports = snapshot.reports.map((report) => `${report.date}《${report.title}》`).join('、');
  const lines = [
    `<p><b>数据范围</b>OpenAI、Anthropic、Scale AI 的全部公开职位，加上百度实习列表首页；销售、招聘、财务、法务等职能不计入。海外岗位是领先信号，不直接代表中国市场。</p>`,
    `<p><b>研究判断</b>来自 ${esc(reports)}。新颖度、需求阶段和适配度只在人工研究后更新，岗位数据不会改写它们。</p>`,
    `<p><b>归类方式</b>按职位标题归到职业簇，一个岗位可以同时属于几个簇；同一职位在不同城市的招聘合并显示。“新”指 ${NEW_JOB_DAYS} 天内第一次出现的岗位。</p>`,
  ];
  if (sources.length) {
    lines.push(
      `<p class="sources"><b>来源</b>${sources
        .map(
          (source) =>
            `<span>${link(source.pageUrl, source.employer)} ${
              source.status === 'error'
                ? `<em class="err">本次未读到（${esc(source.error ?? '原因未知')}）</em>`
                : source.status === 'ok'
                  ? `${source.jobCount} 个`
                  : '待读取'
            }</span>`,
        )
        .join('')}</p>`,
    );
  }
  $('footer').innerHTML = lines.join('');
}

// ---------- 交互 ----------

function clusterById(id) {
  return ui.view.clusters.find((cluster) => cluster.id === id);
}

function setOpen(id, open) {
  const item = $(`c-${id}`);
  const panel = $(`d-${id}`);
  if (!item || !panel) return;
  if (open) {
    ui.open.add(id);
    panel.innerHTML = detailHtml(clusterById(id));
  } else {
    ui.open.delete(id);
  }
  item.classList.toggle('is-open', open);
  panel.hidden = !open;
  item.querySelector('h3 button')?.setAttribute('aria-expanded', String(open));
}

function revealCluster(id) {
  if (!clusterById(id)) return;
  if (ui.query) {
    ui.query = '';
    $('search').value = '';
    renderClusters();
  }
  setOpen(id, true);
  $(`c-${id}`)?.scrollIntoView({ block: 'start' });
}

document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-open]');
  if (opener) {
    event.preventDefault();
    history.replaceState(null, '', `#c-${opener.dataset.open}`);
    revealCluster(opener.dataset.open);
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target || event.target.closest('a')) return;
  const { action, id } = target.dataset;
  if (action === 'toggle') setOpen(id, !ui.open.has(id));
  else if (action === 'refresh') refresh();
  else if (action === 'lens') {
    ui.lens = target.dataset.lens;
    saveLens(ui.lens);
    renderChanges();
    renderClusters();
  } else if (action === 'all-roles') {
    if (ui.allRoles.has(id)) ui.allRoles.delete(id);
    else ui.allRoles.add(id);
    $(`d-${id}`).innerHTML = detailHtml(clusterById(id));
    $(`d-${id}`).querySelector('[data-action="all-roles"]')?.focus();
  } else if (action === 'group') {
    if (ui.openGroups.has(id)) ui.openGroups.delete(id);
    else ui.openGroups.add(id);
    renderOthers();
    document.querySelector(`[data-action="group"][data-id="${id}"]`)?.focus();
  } else if (action === 'clear-search') {
    ui.query = '';
    $('search').value = '';
    renderClusters();
    $('search').focus();
  }
});

$('search').addEventListener('input', (event) => {
  ui.query = event.target.value;
  renderClusters();
});

window.addEventListener('hashchange', () => {
  const match = location.hash.match(/^#c-([\w-]+)$/);
  if (match) revealCluster(match[1]);
});

document.addEventListener('visibilitychange', checkForUpdates);
setInterval(checkForUpdates, CHECK_EVERY);

// ---------- 工具 ----------

function searchText(cluster) {
  return [
    cluster.title,
    cluster.shortTitle,
    cluster.category,
    cluster.whyNew,
    cluster.fitReason,
    cluster.signal,
    cluster.judgment,
    cluster.entry,
    cluster.countercase,
    noveltyMeta[cluster.noveltyZone].label,
    fitMeta[cluster.fit].label,
    ...cluster.keywords,
    ...cluster.requiredKnowledge.flatMap((item) => [item.area, item.detail]),
    ...cluster.skills.map((skill) => skill.name),
    ...cluster.roles.map((role) => role.title),
  ]
    .join(' ')
    .toLowerCase();
}

function sparkline(series, { width = 72, height = 20, stretch = false } = {}) {
  if (series.length < 2) return '';
  const max = Math.max(1, ...series.map((point) => point.count));
  const step = width / (series.length - 1);
  const points = series.map((point, index) => [
    index * step,
    height - 2 - (point.count / max) * (height - 4),
  ]);
  const path = points
    .map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const [lastX, lastY] = points.at(-1);
  const label = `${series[0].date} 到 ${series.at(-1).date}：${series[0].count} → ${series.at(-1).count}`;
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"${
    stretch ? ' preserveAspectRatio="none"' : ''
  } role="img" aria-label="${esc(label)}"><path d="${path}" vector-effect="non-scaling-stroke" /><circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="${stretch ? 0 : 2}" /></svg>`;
}

function trendHtml(series) {
  const max = Math.max(...series.map((point) => point.count));
  const first = series[0];
  const last = series.at(-1);
  return `<figure class="trend">${sparkline(series, { width: 320, height: 56, stretch: true })}<figcaption><span>${esc(
    fmtDay(first.date),
  )} · ${first.count}</span><span>最高 ${max}</span><span>${esc(fmtDay(last.date))} · ${last.count}</span></figcaption></figure>`;
}

function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}

function link(url, text) {
  return /^https:\/\//.test(url ?? '')
    ? `<a href="${esc(url)}" target="_blank" rel="noreferrer noopener">${esc(text)}</a>`
    : esc(text);
}

function fmt(value) {
  return Number(value).toLocaleString('zh-CN');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

/** "今天 09:30" / "昨天 23:10" / "10 月 9 日 08:00" in the viewer's time zone. */
function relativeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '时间未知';
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const today = new Date();
  const days = Math.round(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()) -
      new Date(date.getFullYear(), date.getMonth(), date.getDate())) /
      DAY,
  );
  if (days === 0) return `今天 ${time}`;
  if (days === 1) return `昨天 ${time}`;
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${time}`;
}

/** Posting dates: YYYY-MM-DD values are shown as-is, timestamps in local time. */
function fmtDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '日期未知'
    : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fmtDay(value) {
  const day = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (day) return `${Number(day[2])} 月 ${Number(day[3])} 日`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function readLens() {
  try {
    return localStorage.getItem(LENS_KEY) === 'liang' ? 'liang' : 'market';
  } catch {
    return 'market';
  }
}

function saveLens(lens) {
  try {
    localStorage.setItem(LENS_KEY, lens);
  } catch {
    // 无痕模式等情况下不记住视角，不影响使用。
  }
}

// ---------- 启动 ----------

render();
try {
  setData(await getState());
} catch {
  ui.error = '职位数据暂时读不到，下面先显示研究内容。';
}
ui.loading = false;
render();
const hashMatch = location.hash.match(/^#c-([\w-]+)$/);
if (hashMatch) revealCluster(hashMatch[1]);
if (ui.data && (isStale(ui.data) || ui.data.refreshing)) refresh({ auto: true });
