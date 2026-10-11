'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import type { DiscoveredCareer } from '@/lib/radar-discovery';
import { reviewFor } from '@/lib/radar-reviews';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DiscoveryFilter = 'all' | 'multiple' | 'china' | 'medical';
const filters: Array<{ key: DiscoveryFilter; label: string }> = [
  { key: 'all', label: '全部方向' },
  { key: 'multiple', label: '多雇主出现' },
  { key: 'china', label: '中国入口' },
  { key: 'medical', label: '医疗相关' },
];

function matches(career: DiscoveredCareer, filter: DiscoveryFilter) {
  return (
    filter === 'all' ||
    (filter === 'multiple' && career.employers.length > 1) ||
    (filter === 'china' && career.china) ||
    (filter === 'medical' && career.medical)
  );
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '未知'
    : date.toLocaleDateString('zh-CN');
}

export default function DiscoveryBoard({
  careers,
  edition,
  loading,
  checkedAt,
}: {
  careers: DiscoveredCareer[];
  edition: 'frontier' | 'liang';
  loading: boolean;
  checkedAt: string | null;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<DiscoveryFilter>('all');
  const visible = useMemo(
    () =>
      careers
        .filter((career) => {
          const haystack = [
            career.title,
            career.task,
            ...career.employers,
            ...career.knowledge,
            ...career.jobs.flatMap((job) => [job.title, job.location]),
          ]
            .join(' ')
            .toLowerCase();
          return (
            matches(career, filter) &&
            haystack.includes(query.trim().toLowerCase())
          );
        })
        .sort((a, b) =>
          edition === 'liang'
            ? Number(b.medical) - Number(a.medical) ||
              Number(b.china) - Number(a.china) ||
              b.employers.length - a.employers.length ||
              b.jobs.length - a.jobs.length
            : b.employers.length - a.employers.length ||
              b.jobs.length - a.jobs.length,
        ),
    [careers, edition, query, filter],
  );
  const jobCount = careers.reduce(
    (total, career) => total + career.jobs.length,
    0,
  );

  const reviewedCount = careers
    .flatMap((career) => career.jobs)
    .filter((job) => reviewFor(job)?.taskVerified).length;

  return (
    <section
      id="top"
      className="mx-auto max-w-[1440px] px-4 py-8 sm:px-7 lg:px-10"
    >
      <p className="text-xs font-semibold tracking-widest text-primary">
        LIVE CAREER DISCOVERY
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
        最新 AI 职业方向
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        从官方招聘列表自动归并任务方向。页面打开时检查更新，之后每 6
        小时检查一次，也可点击上方“更新职业列表”。
        新方向会随招聘内容加入；单个职位名不等于已成立的新职业，已核验结论见具体职位；本次核验招聘任务与部分门槛，没有足够历史证据确认新职业形成或需求增长。
      </p>
      <div
        className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"
        aria-live="polite"
      >
        <strong className="text-foreground">
          {careers.length} 个职业方向 · {jobCount} 条去重岗位样本 ·{' '}
          {reviewedCount} 条代表样本任务已核验
        </strong>
        <span>
          {checkedAt ? `最近检查 ${dateLabel(checkedAt)}` : '正在准备最新列表'}
        </span>
        <span>
          {edition === 'liang'
            ? '医学相关、中国入口优先；仅作准备顺序提示'
            : '跨雇主出现优先；不代表新增或增长'}
        </span>
      </div>
      <div className="mt-6 space-y-3 border border-foreground/10 bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            aria-label="搜索最新职业"
            placeholder="搜索职业、知识、公司或地区"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-none pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2" aria-label="筛选最新职业">
          {filters.map((item) => (
            <Button
              key={item.key}
              variant={item.key === filter ? 'default' : 'outline'}
              size="sm"
              aria-pressed={item.key === filter}
              onClick={() => setFilter(item.key)}
            >
              {item.label}{' '}
              {careers.filter((career) => matches(career, item.key)).length}
            </Button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
        显示 {visible.length} / {careers.length} 个最新职业方向
      </p>
      {careers.length === 0 ? (
        <div className="mt-4 border border-dashed p-8 text-sm text-muted-foreground">
          {loading
            ? '正在读取公开岗位并生成职业列表…'
            : '本次尚未取得可归并岗位。请查看上方信源结果并重试更新。'}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4 border border-dashed p-8 text-sm">
          没有匹配的最新职业。
          <Button
            className="ml-3"
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
          >
            重置发现筛选
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {visible.map((career) => (
            <article
              key={career.id}
              className="border border-foreground/10 bg-card p-5"
              data-career-id={career.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-heading text-xl font-semibold">
                  {career.title}
                </h2>
                <span className="border border-amber-700/20 bg-amber-50 px-2 py-1 text-[10px] text-amber-900">
                  {career.jobs.some((job) => reviewFor(job)?.taskVerified)
                    ? '已有样本核验 · 新职业未确证'
                    : '任务待核验'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                方向归并（推断）：
                {career.id.startsWith('title-') &&
                career.jobs.some((job) => reviewFor(job))
                  ? reviewFor(career.jobs.find((job) => reviewFor(job))!)
                      ?.finding
                  : career.task}
              </p>
              <p className="mt-3 text-sm font-medium">
                {career.jobs.length} 个岗位样本 · {career.employers.length}{' '}
                家雇主 ·{' '}
                {
                  career.jobs.filter((job) => reviewFor(job)?.taskVerified)
                    .length
                }{' '}
                条代表样本任务已核验
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {career.employers.join('、')} · 观察{' '}
                {dateLabel(career.observedAt)}
              </p>
              {career.jobs.some((job) => job.stale) ? (
                <p className="mt-2 text-xs text-amber-800">
                  部分来源本次失败，保留上次样本；旧样本已单独标注。
                </p>
              ) : null}
              <details className="mt-4 border-t pt-3">
                <summary className="cursor-pointer text-sm font-semibold text-primary">
                  查看具体职位与应聘知识线索
                </summary>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  以下知识词从岗位职责与要求段提取，属于线索，具体要求以各岗位为准。未自动判断学历、年限或对良的实际录用门槛。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {career.knowledge.length ? (
                    career.knowledge.map((term) => (
                      <span
                        key={term}
                        className="border bg-secondary/50 px-2 py-1 text-xs"
                      >
                        {term}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      当前样本未提取到知识词，请打开原岗位查看。
                    </p>
                  )}
                </div>
                <ul className="mt-4 space-y-3">
                  {[...career.jobs]
                    .sort(
                      (a, b) =>
                        Number(Boolean(reviewFor(b))) -
                        Number(Boolean(reviewFor(a))),
                    )
                    .map((job) => (
                      <li
                        key={`${job.employer}:${job.id}`}
                        className="border-l-2 border-primary/25 pl-3"
                      >
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary underline underline-offset-4"
                        >
                          {job.title}
                          <ArrowUpRight className="ml-1 inline size-3" />
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {job.employer} · {job.location}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          来源
                          {job.employer === 'OpenAI'
                            ? '最近发布'
                            : job.employer === '百度'
                              ? '发布'
                              : '首次发布'}{' '}
                          {job.publishedAt
                            ? dateLabel(job.publishedAt)
                            : '未提供'}{' '}
                          · 观察 {dateLabel(job.observedAt)}
                          {job.stale ? ' · 旧样本，本次未确认' : ''}
                        </p>
                        {reviewFor(job) ? (
                          <p className="mt-2 border-l-2 border-emerald-700/40 bg-emerald-50 p-2 text-xs leading-5 text-emerald-950">
                            {reviewFor(job)?.taskVerified
                              ? '任务已核验'
                              : '正文不完整 · 门槛待核验'}{' '}
                            · {reviewFor(job)?.reviewedAt}：
                            {reviewFor(job)?.finding}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-amber-800">
                            本条任务与门槛尚未人工核验；新抓取、正文变化或来源失败会恢复待核验。
                          </p>
                        )}
                        {job.knowledge.length ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            知识线索：{job.knowledge.join('、')}
                          </p>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs leading-6 text-muted-foreground">
        范围：OpenAI、Anthropic、Scale AI
        的公开职位与百度实习列表当前页。海外样本不能直接外推中国。移除岗位仅表示本次列表未见，不能据此推断职业退潮。
      </p>
    </section>
  );
}
