'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Crosshair,
  FileSearch,
  MapPin,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DiscoveryBoard from '@/components/discovery-board';
import { cn } from '@/lib/utils';
import type { RadarRefreshStatus } from '@/scripts/radar-refresh';
import {
  clusters,
  fitMeta,
  liangTopActions,
  noveltyMeta,
  requiredKnowledgeNote,
  snapshot,
  stageMeta,
  statusMeta,
  topActions,
  type Fit,
  type NoveltyZone,
  type RadarCluster,
} from '@/lib/radar-data';

type Edition = 'frontier' | 'liang';
type MarketFilter = 'new' | 'all' | NoveltyZone;
type LiangFilter = 'recommended' | 'all' | Fit;
type Filter = MarketFilter | LiangFilter;

const marketFilters: Array<{ key: MarketFilter; label: string }> = [
  { key: 'new', label: '新信号' },
  { key: 'frontier', label: '前沿' },
  { key: 'expanding', label: '扩散' },
  { key: 'forming', label: '成型' },
  { key: 'baseline', label: '基线' },
  { key: 'cooling', label: '退潮' },
  { key: 'all', label: '全部' },
];

const liangFilters: Array<{ key: LiangFilter; label: string }> = [
  { key: 'recommended', label: '优先入口' },
  { key: 'direct', label: '可直接关注' },
  { key: 'stretch', label: '进阶方向' },
  { key: 'observe', label: '先观察' },
  { key: 'avoid', label: '不投入' },
  { key: 'all', label: '全部' },
];

const fitStyles: Record<Fit, { badge: string; edge: string; dot: string }> = {
  direct: {
    badge: 'border-emerald-700/20 bg-emerald-700/10 text-emerald-900',
    edge: 'before:bg-emerald-700',
    dot: 'bg-emerald-600',
  },
  stretch: {
    badge: 'border-sky-700/20 bg-sky-700/10 text-sky-900',
    edge: 'before:bg-sky-700',
    dot: 'bg-sky-600',
  },
  observe: {
    badge: 'border-amber-700/20 bg-amber-600/12 text-amber-950',
    edge: 'before:bg-amber-600',
    dot: 'bg-amber-500',
  },
  avoid: {
    badge: 'border-rose-700/20 bg-rose-700/10 text-rose-950',
    edge: 'before:bg-rose-600',
    dot: 'bg-rose-600',
  },
};

const zoneStyles: Record<NoveltyZone, { badge: string; edge: string }> = {
  frontier: {
    badge: 'border-violet-700/20 bg-violet-700/10 text-violet-950',
    edge: 'before:bg-violet-600',
  },
  expanding: {
    badge: 'border-emerald-700/20 bg-emerald-700/10 text-emerald-950',
    edge: 'before:bg-emerald-700',
  },
  forming: {
    badge: 'border-sky-700/20 bg-sky-700/10 text-sky-950',
    edge: 'before:bg-sky-600',
  },
  baseline: {
    badge: 'border-stone-600/20 bg-stone-600/10 text-stone-800',
    edge: 'before:bg-stone-500',
  },
  cooling: {
    badge: 'border-rose-700/20 bg-rose-700/10 text-rose-950',
    edge: 'before:bg-rose-600',
  },
};

const sourceKindLabels = {
  official: '官方',
  employer: '雇主',
  research: '研究',
};

function matchesFilter(
  cluster: RadarCluster,
  edition: Edition,
  filter: Filter,
) {
  if (filter === 'all') return true;
  if (edition === 'frontier') {
    if (filter === 'new') return isNewSignal(cluster.noveltyZone);
    return cluster.noveltyZone === (filter as NoveltyZone);
  }
  if (filter === 'recommended') {
    return (
      cluster.noveltyZone !== 'cooling' &&
      (cluster.fit === 'direct' || cluster.fit === 'stretch')
    );
  }
  return cluster.fit === (filter as Fit);
}

function getFilterCount(edition: Edition, filter: Filter) {
  if (filter === 'all') return clusters.length;
  return clusters.filter((cluster) => matchesFilter(cluster, edition, filter))
    .length;
}

function isNewSignal(zone: NoveltyZone) {
  return zone === 'frontier' || zone === 'expanding' || zone === 'forming';
}

function formatCheckedAt(value: string | null | undefined) {
  if (!value) return '尚未刷新';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '时间未知';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function RadarVisual({ edition }: { edition: Edition }) {
  const points = [
    { x: '63%', y: '24%', delay: '0s', fit: 'direct' as Fit },
    { x: '38%', y: '34%', delay: '.7s', fit: 'direct' as Fit },
    { x: '70%', y: '57%', delay: '1.3s', fit: 'stretch' as Fit },
    { x: '31%', y: '68%', delay: '1.9s', fit: 'observe' as Fit },
    { x: '51%', y: '47%', delay: '2.4s', fit: 'direct' as Fit },
  ];

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[340px]"
      aria-label="职业机会雷达示意图"
    >
      <div className="radar-field absolute inset-0 overflow-hidden rounded-full border border-emerald-100/25 bg-[#0e3025] shadow-[inset_0_0_70px_rgb(3_18_13/70%)]">
        <div className="radar-sweep absolute inset-[-1px] origin-center rounded-full" />
        <div className="absolute inset-[49%] rounded-full bg-emerald-200 shadow-[0_0_20px_rgb(167_243_208/90%)]" />
        {points.map((point, index) => (
          <span
            key={`${point.x}-${point.y}`}
            className={cn(
              'radar-dot absolute h-2.5 w-2.5 rounded-full ring-4 ring-white/10',
              point.fit === 'direct' &&
                'bg-emerald-300 shadow-[0_0_16px_rgb(110_231_183)]',
              point.fit === 'stretch' &&
                'bg-sky-300 shadow-[0_0_16px_rgb(125_211_252)]',
              point.fit === 'observe' &&
                'bg-amber-300 shadow-[0_0_16px_rgb(252_211_77)]',
            )}
            style={{ left: point.x, top: point.y, animationDelay: point.delay }}
            aria-hidden="true"
          >
            <span className="sr-only">信号 {index + 1}</span>
          </span>
        ))}
      </div>
      <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-[#09241b]/90 px-3 py-1.5 text-[11px] font-medium tracking-wide text-emerald-100 shadow-lg backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgb(110_231_183)]" />
        {clusters.length} 个任务簇 ·{' '}
        {edition === 'frontier'
          ? `新信号 ${getFilterCount('frontier', 'new')}`
          : `优先入口 ${getFilterCount('liang', 'recommended')}`}
      </div>
    </div>
  );
}

function ClusterCard({
  cluster,
  index,
  edition,
}: {
  cluster: RadarCluster;
  index: number;
  edition: Edition;
}) {
  const fit = fitStyles[cluster.fit];
  const zone = zoneStyles[cluster.noveltyZone];

  return (
    <Card
      className={cn(
        'rise-in relative gap-0 overflow-hidden border border-foreground/10 bg-card/92 py-0 shadow-[0_14px_40px_rgb(25_53_41/6%)] before:absolute before:inset-y-0 before:left-0 before:w-1',
        zone.edge,
      )}
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <CardHeader className="gap-4 border-b border-foreground/8 px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 font-mono text-xs font-semibold text-muted-foreground">
              {String(
                edition === 'frontier' ? cluster.rank : cluster.fitRank,
              ).padStart(2, '0')}
            </span>
            <div>
              <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {cluster.category}
              </p>
              <CardTitle className="font-heading text-[1.3rem] font-semibold leading-tight tracking-tight sm:text-[1.45rem]">
                {cluster.title}
              </CardTitle>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant="outline" className={cn('shrink-0', zone.badge)}>
              {noveltyMeta[cluster.noveltyZone].label}
            </Badge>
            <span className={cn('text-[10px] font-medium', fit.badge)}>
              {fitMeta[cluster.fit].label}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="border-l border-foreground/12 pl-2.5">
            <span className="block text-muted-foreground">最近信号</span>
            <strong className="mt-0.5 block font-medium text-foreground">
              {cluster.lastSignalAt}
            </strong>
          </div>
          <div className="border-l border-foreground/12 pl-2.5">
            <span className="block text-muted-foreground">制度信号</span>
            <strong className="mt-0.5 block font-medium text-foreground">
              {statusMeta[cluster.institutionalStatus]}
            </strong>
          </div>
          <div className="border-l border-foreground/12 pl-2.5">
            <span className="block text-muted-foreground">需求阶段</span>
            <strong className="mt-0.5 block font-medium text-foreground">
              {stageMeta[cluster.demandStage]}
            </strong>
          </div>
          <div className="border-l border-foreground/12 pl-2.5">
            <span className="block text-muted-foreground">置信度</span>
            <strong className="mt-0.5 block font-medium text-foreground">
              {cluster.confidence === 'high' ? '高' : '中'}
            </strong>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 py-5 sm:px-6">
        <div className="border border-violet-900/10 bg-violet-50/65 px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-violet-800 uppercase">
            {edition === 'frontier' ? '为什么现在算新' : '为什么适配良'}
          </p>
          <p className="text-sm font-medium leading-6 text-foreground">
            {edition === 'frontier' ? cluster.whyNew : cluster.fitReason}
          </p>
        </div>
        <p className="text-sm leading-7 text-muted-foreground">
          {cluster.signal}
        </p>
        <div className="border-l-2 border-primary/55 bg-secondary/45 px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
            本期判断
          </p>
          <p className="text-sm font-medium leading-6 text-foreground">
            {cluster.judgment}
          </p>
        </div>
        <details className="group/details border-t border-foreground/8 pt-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-semibold text-primary outline-none marker:content-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/50">
            查看应聘知识、证据与进入方式
            <ChevronDown className="size-4 transition-transform group-open/details:rotate-180" />
          </summary>
          <div className="space-y-5 pt-4">
            <section className="border border-sky-900/10 bg-sky-50/65 p-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-sky-950">
                <BookOpenCheck className="size-3.5 text-sky-700" />
                应聘需要具备的知识
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-sky-950/65">
                {requiredKnowledgeNote}
              </p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {cluster.requiredKnowledge.map((knowledge) => (
                  <div
                    key={knowledge.area}
                    className="border-l-2 border-sky-700/35 pl-3"
                  >
                    <dt className="text-xs font-semibold text-sky-950">
                      {knowledge.area}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-sky-950/72">
                      {knowledge.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-700" />
                可核验事实
              </h3>
              <ul className="space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                {cluster.facts.map((fact) => (
                  <li key={fact} className="list-disc marker:text-primary/55">
                    {fact}
                  </li>
                ))}
              </ul>
            </section>
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="bg-amber-50/70 p-3.5 ring-1 ring-amber-900/10">
                <h3 className="mb-1.5 text-xs font-semibold text-amber-950">
                  反证 / 失效条件
                </h3>
                <p className="text-sm leading-6 text-amber-950/70">
                  {cluster.countercase}
                </p>
              </div>
              <div className="bg-emerald-50/75 p-3.5 ring-1 ring-emerald-900/10">
                <h3 className="mb-1.5 text-xs font-semibold text-emerald-950">
                  现在怎么进入
                </h3>
                <p className="text-sm leading-6 text-emerald-950/70">
                  {cluster.entry}
                </p>
              </div>
            </section>
            <section>
              <h3 className="mb-2 text-xs font-semibold text-foreground">
                检索词
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cluster.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-2 text-xs font-semibold text-foreground">
                主要来源
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {cluster.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <span className="text-[10px] text-muted-foreground">
                      {sourceKindLabels[source.kind]}
                    </span>
                    {source.label}
                    <ArrowUpRight className="size-3" />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

export default function RadarPage() {
  const [view, setView] = useState<'live' | 'research'>('live');
  const [edition, setEdition] = useState<Edition>('frontier');
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('new');
  const [liangFilter, setLiangFilter] = useState<LiangFilter>('recommended');
  const [refreshStatus, setRefreshStatus] = useState<RadarRefreshStatus | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(true);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const refreshInFlight = useRef(false);

  const filter: Filter = edition === 'frontier' ? marketFilter : liangFilter;
  const filters = edition === 'frontier' ? marketFilters : liangFilters;
  const activeTopActions =
    edition === 'frontier' ? topActions : liangTopActions;

  const refreshSignals = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    setRefreshError(null);
    setRefreshNotice(null);
    try {
      const response = await fetch('api/radar-refresh', {
        method: 'POST',
        headers: { 'x-radar-intent': 'refresh' },
      });
      const payload = (await response.json()) as {
        refresh?: RadarRefreshStatus;
        error?: string;
        reused?: boolean;
      };
      if (!response.ok || !payload.refresh) {
        throw new Error(payload.error ?? '固定信源刷新失败');
      }
      setRefreshStatus(payload.refresh);
      if (payload.reused)
        setRefreshNotice('服务器防护：5 分钟内重复刷新使用最新缓存。');
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : '固定信源刷新失败',
      );
    } finally {
      refreshInFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('api/radar-refresh', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('local refresh unavailable');
        const payload = (await response.json()) as {
          refresh?: RadarRefreshStatus;
        };
        if (payload.refresh) {
          setRefreshStatus(payload.refresh);
          const lastCheck = Date.parse(payload.refresh.checkedAt ?? '');
          if (
            payload.refresh.state === 'running' ||
            !Array.isArray(payload.refresh.discoveries) ||
            !Number.isFinite(lastCheck) ||
            Date.now() - lastCheck >= 6 * 60 * 60 * 1000
          ) {
            void refreshSignals();
          }
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setRefreshError('职业更新服务暂不可用，请稍后重试');
      })
      .finally(() => setLoadingSnapshot(false));
    const timer = window.setInterval(
      () => {
        if (document.visibilityState === 'visible') void refreshSignals();
      },
      6 * 60 * 60 * 1000,
    );
    const checkOnVisible = () => {
      if (document.visibilityState !== 'visible') return;
      void fetch('api/radar-refresh', {
        cache: 'no-store',
        signal: controller.signal,
      })
        .then(
          async (response) =>
            (await response.json()) as { refresh?: RadarRefreshStatus },
        )
        .then((payload: { refresh?: RadarRefreshStatus }) => {
          const checkedAt = Date.parse(payload.refresh?.checkedAt ?? '');
          if (
            !Number.isFinite(checkedAt) ||
            Date.now() - checkedAt >= 6 * 60 * 60 * 1000
          )
            void refreshSignals();
        })
        .catch(() => undefined);
    };
    document.addEventListener('visibilitychange', checkOnVisible);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', checkOnVisible);
    };
  }, [refreshSignals]);

  const filteredClusters = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');
    return clusters
      .filter((cluster) => {
        const haystack = [
          cluster.title,
          cluster.shortTitle,
          cluster.category,
          cluster.whyNew,
          cluster.fitReason,
          cluster.signal,
          cluster.judgment,
          cluster.entry,
          ...cluster.requiredKnowledge.flatMap((knowledge) => [
            knowledge.area,
            knowledge.detail,
          ]),
          noveltyMeta[cluster.noveltyZone].label,
          fitMeta[cluster.fit].label,
          ...cluster.keywords,
        ]
          .join(' ')
          .toLocaleLowerCase('zh-CN');
        return (
          matchesFilter(cluster, edition, filter) &&
          (!normalizedQuery || haystack.includes(normalizedQuery))
        );
      })
      .sort((left, right) =>
        edition === 'frontier'
          ? left.rank - right.rank
          : left.fitRank - right.fitRank,
      );
  }, [edition, filter, query]);

  function showAllClusters() {
    flushSync(() => {
      setQuery('');
      if (edition === 'frontier') setMarketFilter('all');
      else setLiangFilter('all');
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <header className="border-b border-foreground/10 bg-background/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label="回到 AI 新职业雷达顶部"
          >
            <span className="grid size-9 place-items-center bg-primary text-primary-foreground shadow-sm">
              <Radar className="size-5" strokeWidth={1.8} />
            </span>
            <span>
              <strong className="block font-heading text-base leading-none tracking-tight">
                AI 新职业雷达
              </strong>
              <span className="mt-1 block font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                Career signal observatory
              </span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="hidden border-primary/20 bg-secondary/70 text-primary sm:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {view === 'live' ? '自动职业发现' : snapshot.mode}
            </Badge>
            <span className="font-mono text-[10px] text-muted-foreground">
              {view === 'live'
                ? `发现更新 ${formatCheckedAt(refreshStatus?.checkedAt)}`
                : `研究快照 ${snapshot.updatedAt}`}
            </span>
          </div>
        </div>
      </header>

      <section className="border-b border-foreground/10 bg-secondary/45">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
          <div className="min-w-0 text-xs leading-5 text-muted-foreground">
            <strong className="mr-2 text-foreground">固定信源状态</strong>
            {refreshError ??
              (loadingSnapshot
                ? '正在读取职业快照'
                : refreshing || refreshStatus?.state === 'running'
                  ? '正在读取职位并更新职业列表'
                  : refreshStatus?.checkedAt
                    ? `${refreshStatus.succeeded}/${refreshStatus.sourceCount} 个一手信源可达 · ${formatCheckedAt(refreshStatus.checkedAt)}`
                    : '尚未执行刷新')}
            {refreshStatus?.candidateSignals.length ? (
              <span className="ml-2 hidden text-primary lg:inline">
                候选命中：
                {refreshStatus.candidateSignals.slice(0, 3).join('、')}
              </span>
            ) : null}
            <span className="ml-2">
              自动更新职业发现；新颖性与进入门槛待核验。
            </span>
            {refreshStatus?.sources?.length ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-foreground">
                  查看各信源结果与打开入口
                </summary>
                <ul className="mt-2 space-y-1">
                  {refreshStatus.sources.map((source) => (
                    <li key={source.id}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4"
                      >
                        {source.label} ↗
                      </a>
                      {' · '}
                      {source.status === 'ok'
                        ? typeof source.matchedJobs === 'number'
                          ? `可达 · ${source.matchedJobs} 个相关职位`
                          : '可达'
                        : source.httpStatus === 403
                          ? '自动请求被网站拒绝（403），可手动打开查看'
                          : (source.error ?? '暂不可达')}
                      {source.checkedUrl && source.checkedUrl !== source.url ? (
                        <a
                          href={source.checkedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 underline underline-offset-4"
                        >
                          官方职位数据 ↗
                        </a>
                      ) : null}
                      {source.sampleJobs?.length ? (
                        <ul className="ml-4 mt-1 list-disc space-y-1">
                          {source.sampleJobs.map((job) => (
                            <li key={`${job.url}:${job.title}`}>
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-4"
                              >
                                {job.title} ↗
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 rounded-none bg-background"
            disabled={refreshing}
            onClick={() => void refreshSignals()}
          >
            <RefreshCw
              className={cn('size-3.5', refreshing && 'animate-spin')}
            />
            {refreshing ? '正在更新' : '更新职业列表'}
          </Button>
        </div>
        {refreshNotice ? (
          <output className="mt-2 block text-xs text-muted-foreground">
            {refreshNotice}
          </output>
        ) : null}
      </section>

      <nav
        className="mx-auto flex max-w-[1440px] flex-wrap gap-2 px-4 pt-6 sm:px-7 lg:px-10"
        aria-label="选择职业数据视图"
      >
        <Button
          variant={view === 'live' ? 'default' : 'outline'}
          aria-pressed={view === 'live'}
          onClick={() => setView('live')}
        >
          最新职业发现{' '}
          {loadingSnapshot
            ? '读取中'
            : (refreshStatus?.discoveries?.length ?? 0)}
        </Button>
        <Button
          variant={view === 'research' ? 'default' : 'outline'}
          aria-pressed={view === 'research'}
          onClick={() => setView('research')}
        >
          人工研究档案 {clusters.length}
        </Button>
      </nav>
      {view === 'live' ? (
        <>
          <div
            className="mx-auto flex max-w-[1440px] gap-2 px-4 pt-4 sm:px-7 lg:px-10"
            aria-label="选择职业雷达版本"
          >
            <Button
              variant={edition === 'frontier' ? 'default' : 'outline'}
              aria-pressed={edition === 'frontier'}
              size="sm"
              onClick={() => setEdition('frontier')}
            >
              市场前沿版
            </Button>
            <Button
              variant={edition === 'liang' ? 'default' : 'outline'}
              aria-pressed={edition === 'liang'}
              size="sm"
              onClick={() => setEdition('liang')}
            >
              良的适配版
            </Button>
          </div>
          <DiscoveryBoard
            careers={refreshStatus?.discoveries ?? []}
            edition={edition}
            loading={loadingSnapshot || refreshing}
            checkedAt={refreshStatus?.checkedAt ?? null}
          />
        </>
      ) : (
        <>
          <section
            id="top"
            className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-12 pt-10 sm:px-7 sm:pt-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,.92fr)] lg:gap-14 lg:px-10 lg:pb-16 lg:pt-16"
          >
            <div className="flex flex-col justify-center">
              <div
                className="mb-6 inline-flex w-fit border border-foreground/12 bg-background p-1 shadow-sm"
                aria-label="选择职业雷达版本"
              >
                {(
                  [
                    ['frontier', '市场前沿版'],
                    ['liang', '良的适配版'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      'px-4 py-2 text-xs font-semibold transition-colors',
                      edition === value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                    aria-pressed={edition === value}
                    onClick={() => setEdition(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mb-5 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-primary uppercase">
                <span>
                  第 {String(snapshot.issue).padStart(2, '0')} 期 ·{' '}
                  {snapshot.edition}
                </span>
                <span className="h-px w-8 bg-primary/35" />
                <span>{snapshot.region}</span>
              </div>
              <h1 className="max-w-4xl font-heading text-[clamp(2.8rem,7vw,6.7rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-foreground">
                {edition === 'frontier'
                  ? 'FDE 已进第一屏，'
                  : '先从医学 AI 评测切入，'}
                <span className="mt-2 block text-primary">
                  {edition === 'frontier'
                    ? '这次只追新信号。'
                    : '再向 Agent 评测与产品升级。'}
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {edition === 'frontier'
                  ? '先看最近 6—12 个月谁在跨雇主、行业和地区扩散，再单独判断良现在能不能进入。'
                  : '用同一批证据，按你的临床医学、AI 应用、产品与评测积累重新排序；排名代表进入顺序，不是假装市场更大。'}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="h-11 rounded-none px-5 shadow-[0_8px_24px_rgb(27_88_65/16%)]"
                  onClick={() => {
                    showAllClusters();
                    document
                      .getElementById('radar-results')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  查看本期 {clusters.length} 个职业簇
                  <ArrowDown data-icon="inline-end" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-none bg-background/60 px-5"
                  onClick={() =>
                    document
                      .getElementById('methodology')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  雷达怎么判断
                </Button>
              </div>
              <dl className="mt-10 grid max-w-2xl grid-cols-3 border-y border-foreground/12 py-4">
                <div>
                  <dt className="text-xs text-muted-foreground">本期追踪</dt>
                  <dd className="mt-1 font-heading text-3xl font-semibold">
                    {clusters.length}
                  </dd>
                </div>
                <div className="border-l border-foreground/12 pl-5">
                  <dt className="text-xs text-muted-foreground">
                    {edition === 'frontier' ? '新信号' : '优先入口'}
                  </dt>
                  <dd className="mt-1 font-heading text-3xl font-semibold text-primary">
                    {edition === 'frontier'
                      ? getFilterCount('frontier', 'new')
                      : getFilterCount('liang', 'recommended')}
                  </dd>
                </div>
                <div className="border-l border-foreground/12 pl-5">
                  <dt className="text-xs text-muted-foreground">
                    {edition === 'frontier' ? '快速扩散' : '可直接关注'}
                  </dt>
                  <dd className="mt-1 font-heading text-3xl font-semibold">
                    {edition === 'frontier'
                      ? getFilterCount('frontier', 'expanding')
                      : getFilterCount('liang', 'direct')}
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="relative overflow-hidden bg-[#102f25] p-5 text-white shadow-[0_24px_70px_rgb(19_47_38/18%)] sm:p-7">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-emerald-300/8 blur-3xl" />
              <div className="relative flex items-center justify-between border-b border-white/12 pb-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-emerald-200/70 uppercase">
                    Signal map / 2026.08
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-semibold">
                    {edition === 'frontier' ? '本期强信号' : '良的优先入口'}
                  </h2>
                </div>
                <Crosshair className="size-5 text-emerald-200/70" />
              </div>
              <div className="relative py-7">
                <RadarVisual edition={edition} />
              </div>
              <div className="relative mt-1 divide-y divide-white/10 border-t border-white/12">
                {activeTopActions.map((cluster) => (
                  <a
                    key={cluster.id}
                    href={`#${cluster.id}`}
                    onClick={() => {
                      if (!document.getElementById(cluster.id))
                        showAllClusters();
                    }}
                    className="group flex items-center gap-3 py-3.5"
                  >
                    <span className="font-mono text-[10px] text-emerald-200/55">
                      {String(
                        edition === 'frontier' ? cluster.rank : cluster.fitRank,
                      ).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-emerald-50">
                      {cluster.shortTitle}
                    </span>
                    <span className="text-[11px] text-emerald-200/65 transition-colors group-hover:text-emerald-200">
                      {edition === 'frontier' ? '立即验证' : '优先准备'}
                    </span>
                    <ArrowUpRight className="size-3.5 text-emerald-200/55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </aside>
          </section>

          <section
            id="radar-results"
            className="border-y border-foreground/10 bg-[#e9ede5]/70 py-12 sm:py-16"
          >
            <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-10">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.13em] text-primary uppercase">
                    <CircleDot className="size-3.5" />
                    Radar board
                  </div>
                  <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                    {edition === 'frontier' ? '本期职业簇' : '良的进入顺序'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {edition === 'frontier'
                      ? '按近期新颖度与扩散速度排序；良的适配只作为第二标签。'
                      : '先看临床与评测优势能否形成差异化，再看补齐能力所需距离；市场层级仍原样保留。'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  非实时招聘流 · 下一期研究后更新
                </div>
              </div>

              <div className="mt-7 border border-foreground/10 bg-background/82 p-3 shadow-sm backdrop-blur sm:p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="搜新职业，例如：FDE / Agent Evals / AI Product Engineer"
                      aria-label="搜索职业簇"
                      className="h-11 rounded-none border-foreground/15 bg-card pl-10 pr-10 shadow-none"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
                        aria-label="清空搜索"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                  <div
                    className="flex gap-1 overflow-x-auto pb-1 xl:pb-0"
                    aria-label={
                      edition === 'frontier'
                        ? '按新颖度筛选'
                        : '按良的适配度筛选'
                    }
                  >
                    {filters.map((item) => (
                      <Button
                        key={item.key}
                        variant={filter === item.key ? 'default' : 'ghost'}
                        size="lg"
                        className={cn(
                          'h-9 shrink-0 rounded-none px-3 text-xs',
                          filter !== item.key &&
                            'text-muted-foreground hover:bg-secondary/65',
                        )}
                        aria-pressed={filter === item.key}
                        onClick={() => {
                          if (edition === 'frontier') {
                            setMarketFilter(item.key as MarketFilter);
                          } else {
                            setLiangFilter(item.key as LiangFilter);
                          }
                        }}
                      >
                        {item.label}
                        <span
                          className={cn(
                            'font-mono text-[10px]',
                            filter === item.key
                              ? 'text-primary-foreground/65'
                              : 'text-muted-foreground/75',
                          )}
                        >
                          {getFilterCount(edition, item.key)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="mt-5 flex items-center justify-between text-xs text-muted-foreground"
                aria-live="polite"
              >
                <span>
                  显示 {filteredClusters.length} / {clusters.length} 个职业簇
                </span>
                {(query ||
                  filter !==
                    (edition === 'frontier' ? 'new' : 'recommended')) && (
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setQuery('');
                      if (edition === 'frontier') setMarketFilter('new');
                      else setLiangFilter('recommended');
                    }}
                  >
                    重置筛选
                  </button>
                )}
              </div>

              {filteredClusters.length > 0 ? (
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {filteredClusters.map((cluster, index) => (
                    <div
                      id={cluster.id}
                      key={cluster.id}
                      className="scroll-mt-6"
                    >
                      <ClusterCard
                        cluster={cluster}
                        index={index}
                        edition={edition}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-foreground/20 bg-background/55 px-6 py-16 text-center">
                  <FileSearch className="mx-auto size-7 text-muted-foreground" />
                  <h3 className="mt-3 font-heading text-xl font-semibold">
                    没有匹配的职业簇
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    换一个任务词，或清除当前版本的筛选。
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-none"
                    onClick={() => {
                      setQuery('');
                      if (edition === 'frontier') setMarketFilter('new');
                      else setLiangFilter('recommended');
                    }}
                  >
                    {edition === 'frontier' ? '查看新信号' : '查看优先入口'}
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section
            id="methodology"
            className="mx-auto max-w-[1440px] px-4 py-14 sm:px-7 sm:py-20 lg:px-10"
          >
            <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
              <div>
                <p className="font-mono text-[11px] tracking-[0.14em] text-primary uppercase">
                  How it works
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                  这不是“未来职业名录”
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                  雷达先判断最近 6—12
                  个月是否出现跨雇主、行业、地区或层级扩散，再单独判断良能否进入。每项都保留事实、推断和反证。
                </p>
                <div className="mt-7 border-l-2 border-accent bg-accent/28 px-4 py-3 text-sm leading-6 text-accent-foreground">
                  “新职业机会更多”只成立一半：上升空间可能更大，但第一批正式岗位往往更少、标题更乱、经验门槛更高。
                </div>
              </div>
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-3">
                <div className="border-t-2 border-primary pt-4">
                  <BookOpenCheck className="size-5 text-primary" />
                  <h3 className="mt-4 font-heading text-lg font-semibold">
                    先收事实
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    记录最近信号日期，优先当前雇主招聘与一手劳动力数据。
                  </p>
                </div>
                <div className="border-t-2 border-primary pt-4">
                  <ShieldCheck className="size-5 text-primary" />
                  <h3 className="mt-4 font-heading text-lg font-semibold">
                    再做分层
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    前沿、扩散、成型、基线和退潮，与个人适配分开判断。
                  </p>
                </div>
                <div className="border-t-2 border-primary pt-4">
                  <Sparkles className="size-5 text-primary" />
                  <h3 className="mt-4 font-heading text-lg font-semibold">
                    最后给行动
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    升级需 8 周内至少 3 家独立中国雇主重复采购，并出现初级入口。
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-14 grid gap-4 border-t border-foreground/12 pt-7 text-xs text-muted-foreground sm:grid-cols-3">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                主观察：中国；全球数据仅作领先信号。
              </p>
              <p className="flex items-start gap-2">
                <Search className="mt-0.5 size-3.5 shrink-0" />
                当前为人工研究快照，不是实时岗位爬虫。
              </p>
              <p className="flex items-start gap-2">
                <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                {snapshot.signalWindow}；结论会随新证据升降级。
              </p>
            </div>
          </section>
        </>
      )}
      <footer className="border-t border-foreground/10 bg-[#102f25] text-emerald-50">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
          <div className="flex items-center gap-2 font-medium">
            <Radar className="size-4 text-emerald-300" />
            AI 新职业雷达 ·{' '}
            {view === 'live'
              ? '自动职业发现'
              : `第 ${snapshot.issue} 期 · ${snapshot.edition}`}
          </div>
          <p className="text-emerald-100/55">判断可以改变，证据必须留下。</p>
        </div>
      </footer>
    </main>
  );
}
