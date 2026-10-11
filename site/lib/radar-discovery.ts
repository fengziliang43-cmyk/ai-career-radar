export type DiscoveryJob = {
  id: string;
  title: string;
  url: string;
  employer: string;
  location: string;
  publishedAt: string | null;
  observedAt: string;
  stale?: boolean;
  contentHash?: string;
  knowledge: string[];
};

export type DiscoveredCareer = {
  id: string;
  title: string;
  task: string;
  jobs: DiscoveryJob[];
  employers: string[];
  knowledge: string[];
  medical: boolean;
  china: boolean;
  firstSeenAt: string;
  observedAt: string;
};

const knowledgeTerms: Array<[RegExp, string]> = [
  [/\bpython\b/i, 'Python'],
  [/\btypescript\b|\bjavascript\b/i, 'TypeScript / JavaScript'],
  [/\breact\b/i, 'React'],
  [/\bsql\b/i, 'SQL'],
  [/\bpytorch\b/i, 'PyTorch'],
  [/\btensorflow\b/i, 'TensorFlow'],
  [/reinforcement learning|强化学习|\brlhf\b|\bgrpo\b/i, '强化学习 / RLHF'],
  [/\brag\b|retrieval.augmented|检索增强/i, 'RAG / 检索增强'],
  [/evaluation|\bevals?\b|评测|测评/i, '评测集、评测指标与实验设计'],
  [/\bgrader\b/i, '自动评分器 / Grader'],
  [/tool.call|工具调用/i, '工具调用与执行工作流'],
  [/\bkubernetes\b|\bk8s\b/i, 'Kubernetes'],
  [/\bcuda\b|\btriton\b/i, 'CUDA / Triton'],
  [/distributed (?:systems|training)|分布式/i, '分布式系统 / 训练'],
  [/fine.tun|微调/i, '模型微调'],
  [/red.team|红队/i, '红队测试'],
  [/interpretability|可解释性/i, '模型可解释性'],
  [/clinical|临床/i, '临床知识与医疗场景'],
  [/\bab test|a\/b test|a\/b实验|a\/b test/i, 'A/B 实验'],
];

export function extractKnowledge(text: string) {
  // Restrict terms to responsibilities/qualifications; company descriptions are not requirements.
  const start = text.search(
    /about (?:the|this) role|responsibilities|in this role|what you[’']ll do|you will|who should apply|任职要求|工作职责/i,
  );
  let scope = start >= 0 ? text.slice(start) : text;
  const end = scope.search(
    /about anthropic|about openai|compensation packages|equal opportunity|benefits|salary range|logistics/i,
  );
  if (end >= 0) scope = scope.slice(0, end);
  return knowledgeTerms
    .filter(([pattern]) => pattern.test(scope))
    .map(([, label]) => label);
}

// Task families are display inferences, not certified new professions or demand stages.
const families: Array<{
  id: string;
  title: string;
  pattern: RegExp;
  task: string;
}> = [
  {
    id: 'medical',
    title: '医疗与生命科学 AI',
    pattern:
      /medical|clinical|healthcare|life sciences|bioscience|医学|医疗|健康/i,
    task: '医疗、生命科学场景中的模型研究、评测、产品与交付。',
  },
  {
    id: 'agent-evals',
    title: 'Agent 评测与任务环境',
    pattern:
      /(?:agent|frontier).*(?:eval|environment)|(?:eval|environment).*agent|agent.*评测|评测.*agent/i,
    task: '构建 Agent 的任务环境、评分与行为评测。',
  },
  {
    id: 'computer-use',
    title: 'Computer Use 计算机操作',
    pattern: /computer use/i,
    task: '训练模型操作浏览器、桌面及应用，构建执行与评测系统。',
  },
  {
    id: 'multi-agent',
    title: '多 Agent 协作研究',
    pattern: /multi.agent/i,
    task: '研究多 Agent 协作、训练环境与协作激励。',
  },
  {
    id: 'agent-security',
    title: 'Agent 安全与运行监督',
    pattern:
      /agent oversight|agent security|agent standards|ai controls and monitoring/i,
    task: 'Agent 身份、授权、标准、运行监测与风险干预；研究、工程、治理是不同岗位。',
  },
  {
    id: 'post-training',
    title: '模型后训练与强化学习',
    pattern: /post.training|reinforcement learning|\brl\b|后训练|强化学习/i,
    task: '训练信号、强化学习环境及模型行为优化。',
  },
  {
    id: 'fde',
    title: 'FDE 与 AI 部署交付',
    pattern: /forward deployed|\bfde\b|deployment|部署/i,
    task: '客户场景发现、系统部署和技术交付。',
  },
  {
    id: 'agent-product',
    title: 'Agent 产品、策略与运营',
    pattern:
      /(?:agent|dumate|codex).*(?:product|strateg|运营|产品|策略)|(?:product|strateg).*(?:agent|codex)/i,
    task: 'Agent 产品、执行策略、采用与运营。',
  },
  {
    id: 'agent-engineering',
    title: 'Agent 工程与基础设施',
    pattern: /agent|dumate/i,
    task: 'Agent 的运行系统、平台和应用工程。',
  },
  {
    id: 'applied-ai',
    title: 'AI 应用架构与工程',
    pattern:
      /applied ai|ai architect|ai engineer|(?:software engineer.*(?:enterprise ai|gen ai|cooperative ai|ai products|claude design))|ai.*consult|ai advisory|ai development|ai.*工程|ai.*研发|ai.*开发/i,
    task: 'AI 应用方案、系统集成与工程落地。',
  },
  {
    id: 'ai-product',
    title: 'AI 产品设计与运营',
    pattern:
      /(?:ai|claude|chatgpt).*(?:product manager|product designer|product design|product operations|运营|产品)|(?:product manager|product designer|product design|product operations).*(?:ai|claude|chatgpt)|模型.*产品/i,
    task: 'AI 产品功能、交互和业务工作流设计。',
  },
  {
    id: 'safety',
    title: 'AI 安全、对齐与治理',
    pattern:
      /safeguard|alignment|interpretability|ai safety|agentic risk|ai.*compliance|ai.*policy|模型.*安全/i,
    task: '模型对齐、可解释性、安全评测与治理。',
  },
  {
    id: 'evals',
    title: '模型评测与质量工程',
    pattern:
      /\bevals?\b|\bevaluations?\b|评测|测评|质量.*(?:模型|ai)|(?:模型|ai).*质量/i,
    task: '模型质量验证、实验设计与持续评测。',
  },
  {
    id: 'inference',
    title: '模型推理与性能优化',
    pattern: /inference|model.*performance|推理.*(?:优化|工程)/i,
    task: '模型服务、推理性能与运行成本优化。',
  },
  {
    id: 'training',
    title: '预训练与模型训练工程',
    pattern: /pre.?train|model training|training:|研究.*模型|生成式.*算法/i,
    task: '模型训练、训练系统和生成式算法。',
  },
  {
    id: 'human-data',
    title: '训练数据与人类反馈',
    pattern:
      /human data|data acquisition|data engine\b|training data|rl data|数据.*(?:标注|训练)|(?:训练|模型).*数据/i,
    task: '训练数据、数据获取与人类反馈质量。',
  },
  {
    id: 'retrieval',
    title: 'AI 检索与知识系统',
    pattern: /retrieval|knowledge team|knowledge work|知识库|检索|\brag\b/i,
    task: '检索、知识组织及模型知识工作。',
  },
  {
    id: 'multimodal',
    title: '多模态、语音与生成内容',
    pattern:
      /multimodal|imagegen|\bspeech\b|\baudio\b|\bvoice\b|视频.*模型|多模态|语音/i,
    task: '图像、语音、视频及跨模态模型应用。',
  },
  {
    id: 'ai-support',
    title: 'AI 技术支持与客户采用',
    pattern: /ai success|ai support|technical success|技术支持.*ai/i,
    task: 'AI 系统接入、客户采用与技术支持。',
  },
  {
    id: 'accelerator',
    title: 'AI 加速器与计算系统',
    pattern:
      /ai for chip design|gpu|tpu|ml accelerator|kernel|compute.*systems|ai accelerator/i,
    task: '模型计算系统、加速器和底层性能工程。',
  },
  {
    id: 'ai-reliability',
    title: 'AI 可靠性与运行工程',
    pattern: /ai reliability|ai operations|ai enablement|ai outcomes/i,
    task: 'AI 系统可靠性、运营支持及业务效果验收。',
  },
  {
    id: 'ai-infrastructure',
    title: 'AI 基础设施与系统工程',
    pattern:
      /infrastructure software engineer.*enterprise ai|ai infrastructure|gpt infrastructure|ml systems|ml networking|ml infrastructure|ai networking|ai systems|ml sampling/i,
    task: 'AI 平台、网络、模型运行与基础设施工程。',
  },
  {
    id: 'ml-engineering',
    title: '机器学习工程与应用',
    pattern: /machine learning|\bml research/i,
    task: '机器学习模型、应用实验与工程系统。',
  },
];

function fallbackTitle(title: string, location: string) {
  let value = title;
  for (const place of location
    .split(/[;|]/)
    .map((part) => part.trim())
    .filter(Boolean)) {
    value = value.replaceAll(place, '');
  }
  return value
    .replace(/\b(?:senior|staff\+?|principal|junior|lead)\b/gi, '')
    .replace(
      /\s*[-–]\s*(?:SF|NYC|London|Tokyo|Singapore|Paris|Dublin|Munich)\b.*$/i,
      '',
    )
    .replace(/（J\d+）/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/^[\s,/+-]+|[\s,/+-]+$/g, '')
    .trim();
}

export function buildDiscoveries(
  jobs: DiscoveryJob[],
  previous: DiscoveredCareer[] = [],
): DiscoveredCareer[] {
  const seen = new Set<string>();
  const groups = new Map<string, DiscoveredCareer>();
  const previousById = new Map(previous.map((career) => [career.id, career]));
  for (const job of jobs) {
    const unique = `${job.employer}:${job.id}`;
    if (seen.has(unique)) continue;
    seen.add(unique);
    if (
      /recruiter|account (?:executive|director)|\bsales\b|marketing|business development representative|supply chain|payroll|workplace|people research|品牌市场|市场实习|\bcounsel\b|audiovisual/i.test(
        job.title,
      )
    )
      continue;
    const family = families.find(({ pattern }) => pattern.test(job.title));
    // Generic corporate roles at an AI company do not qualify as AI career discoveries.
    if (
      !family &&
      !/(?:\bAI\b|\bML\b|machine learning|\bLLM\b|\bGPT\b|generative|人工智能|大模型|生成式)/i.test(
        job.title,
      )
    )
      continue;
    const normalized = fallbackTitle(job.title, job.location);
    const id =
      family?.id ?? `title-${encodeURIComponent(normalized.toLowerCase())}`;
    let group = groups.get(id);
    if (!group) {
      group = {
        id,
        title: family?.title ?? normalized,
        task: family?.task ?? '新职位名称候选：任务结构和新颖性尚待人工核验。',
        jobs: [],
        employers: [],
        knowledge: [],
        medical: false,
        china: false,
        firstSeenAt: previousById.get(id)?.firstSeenAt ?? job.observedAt,
        observedAt: job.observedAt,
      };
      groups.set(id, group);
    }
    group.jobs.push(job);
    group.employers = [...new Set([...group.employers, job.employer])];
    group.knowledge = [...new Set([...group.knowledge, ...job.knowledge])];
    group.medical ||=
      /medical|clinical|healthcare|life sciences|bioscience|医学|医疗|健康/i.test(
        job.title,
      );
    group.china ||=
      job.employer === '百度' ||
      /中国|北京|上海|杭州|深圳|beijing|shanghai|hangzhou|shenzhen|china/i.test(
        job.location,
      );
    if (job.observedAt > group.observedAt) group.observedAt = job.observedAt;
  }
  return [...groups.values()].sort(
    (a, b) =>
      b.employers.length - a.employers.length ||
      b.jobs.length - a.jobs.length ||
      a.title.localeCompare(b.title, 'zh-CN'),
  );
}
