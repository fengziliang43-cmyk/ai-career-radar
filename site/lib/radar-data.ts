export type Fit = 'direct' | 'stretch' | 'observe' | 'avoid';
export type Confidence = 'high' | 'medium';
export type DemandStage = 'seed' | 'forming' | 'scaling' | 'mature' | 'weakening';
export type NoveltyZone =
  | 'frontier'
  | 'expanding'
  | 'forming'
  | 'baseline'
  | 'cooling';
export type InstitutionalStatus =
  | 'official'
  | 'industry_named'
  | 'analyst_derived';

export type RadarSource = {
  label: string;
  url: string;
  kind: 'official' | 'employer' | 'research';
};

export type RadarCluster = {
  id: string;
  rank: number;
  fitRank: number;
  title: string;
  shortTitle: string;
  category: string;
  noveltyZone: NoveltyZone;
  lastSignalAt: string;
  whyNew: string;
  institutionalStatus: InstitutionalStatus;
  demandStage: DemandStage;
  confidence: Confidence;
  fit: Fit;
  fitReason: string;
  signal: string;
  judgment: string;
  facts: string[];
  countercase: string;
  entry: string;
  keywords: string[];
  sources: RadarSource[];
};

export const snapshot = {
  issue: 2,
  edition: '前沿修正版',
  updatedAt: '2026-08-29',
  signalWindow: '最近信号 2026-07-21—2026-08-29',
  region: '全球前沿 + 中国入口',
  mode: '人工研究快照',
};

export const fitMeta: Record<
  Fit,
  { label: string; shortLabel: string; note: string }
> = {
  direct: {
    label: '良可直接关注',
    shortLabel: '直接',
    note: '现有经历可迁移，但仍需用作品证明',
  },
  stretch: {
    label: '良的进阶方向',
    shortLabel: '进阶',
    note: '市场信号强，当前需先补相邻能力',
  },
  observe: {
    label: '良先观察',
    shortLabel: '观察',
    note: '职业真实，但与当前入口或能力距离较远',
  },
  avoid: {
    label: '良不投入',
    shortLabel: '降级',
    note: '只当通用技能，不作为职业定位',
  },
};

export const noveltyMeta: Record<
  NoveltyZone,
  { label: string; shortLabel: string; note: string }
> = {
  frontier: {
    label: '前沿萌芽',
    shortLabel: '前沿',
    note: '新任务组合已出现，但还可能无法形成稳定职业',
  },
  expanding: {
    label: '快速扩散',
    shortLabel: '扩散',
    note: '跨雇主、行业、地区或团队层级持续出现',
  },
  forming: {
    label: '正在成型',
    shortLabel: '成型',
    note: '任务已稳定出现，持续性或跨雇主证据仍需补强',
  },
  baseline: {
    label: '已成基线',
    shortLabel: '基线',
    note: '需求真实，但已不是新的职业发现',
  },
  cooling: {
    label: '退潮 / 被吸收',
    shortLabel: '退潮',
    note: '独立头衔弱化，能力被其他岗位吸收或商品化',
  },
};

export const statusMeta: Record<InstitutionalStatus, string> = {
  official: '官方职业信号',
  industry_named: '企业已命名',
  analyst_derived: '任务簇推断',
};

export const stageMeta: Record<DemandStage, string> = {
  seed: '种子信号',
  forming: '正在形成',
  scaling: '正在放量',
  mature: '常规需求',
  weakening: '正在弱化',
};

export const clusters: RadarCluster[] = [
  {
    id: 'fde-ai-deployment',
    rank: 1,
    fitRank: 7,
    title: 'FDE / AI Deployment Engineer',
    shortTitle: 'FDE / AI 交付工程',
    category: '工程 × 客户交付 × 模型反馈',
    noveltyZone: 'expanding',
    lastSignalAt: '2026-08-29',
    whyNew:
      'FDE 这个词并非刚出现；真正的新信号是 AI 版 FDE 正在跨公司、地区、行业和管理层级扩散。',
    institutionalStatus: 'industry_named',
    demandStage: 'scaling',
    confidence: 'high',
    fit: 'stretch',
    fitReason:
      '医学、产品和交付意识能迁移到医疗 FDE，但当前主流样本要求资深工程与生产落地经历，适合作为两阶段后的目标。',
    signal:
      'OpenAI 当前列出 22 个 forward-deployed 相关岗位，并细分到医疗、法律、政府、半导体和多个地区；Anthropic 与 Scale 也已形成同类团队。',
    judgment:
      '这是本期一号市场信号，但不是良当前的应届主投。它是工程、产品、咨询和客户交付的复合职业。',
    facts: [
      'LinkedIn 2026 年美国职位研究把 FDE 列为其口径下第三常见的 AI 职业。',
      'OpenAI 当前 FDE 搜索页覆盖医疗、法律、政府、半导体以及美国、亚洲、澳洲和中东。',
      'Scale 已招聘 FDE 团队负责人，Anthropic Applied AI 团队也同时招聘 FDE 与 Technical Deployment Lead。',
    ],
    countercase:
      'OpenAI 通用样本通常要求 5 年以上经验，医疗 FDE 要求 6 年以上并理解受监管医疗系统；热度不等于初级入口。',
    entry:
      '先走 AI 产品、评测、PoC、解决方案助理或客户侧交付，积累生产上线与验收，再向 FDE 迁移。',
    keywords: [
      'FDE',
      'Forward Deployed Engineer',
      'AI Deployment Engineer',
      'Technical Deployment Lead',
      'AI 实施',
      'PoC',
    ],
    sources: [
      {
        label: 'LinkedIn｜2026 AI 职位研究',
        url: 'https://news.linkedin.com/2026/new-linkedin-research-finds-women-account-for-just-26-percent-of-ai-hires-as-ai-jobs-surge',
        kind: 'research',
      },
      {
        label: 'OpenAI｜22 个 Forward Deployed 相关岗位',
        url: 'https://openai.com/careers/search/?q=forward+deployed',
        kind: 'employer',
      },
      {
        label: 'Anthropic｜Applied AI 当前职位',
        url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
        kind: 'employer',
      },
      {
        label: 'Scale｜FDE 团队负责人',
        url: 'https://scale.com/careers/4690504005',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'ai-product-engineer',
    rank: 2,
    fitRank: 5,
    title: 'AI Product Engineer / AI 产品工程师',
    shortTitle: 'AI 产品工程师',
    category: '产品判断 × AI Coding × 端到端构建',
    noveltyZone: 'expanding',
    lastSignalAt: '2026-07-21',
    whyNew:
      '产品与工程的边界被 AI Coding 压缩，企业开始直接采购能从需求判断做到可用功能的人。',
    institutionalStatus: 'industry_named',
    demandStage: 'forming',
    confidence: 'high',
    fit: 'stretch',
    fitReason:
      '已有 AI 产品实践和端到端意识，最需要补的是独立调试、部署与工程可信度；做出可验证作品后可进入。',
    signal:
      '百度已直接命名 AI 产品工程实习生；OpenAI 当前也出现 Product Engineer, Full Stack - Agents 等细分。',
    judgment:
      '它不是传统 PM，也不是只接需求写代码；核心产出是快速把想法变成被真实用户使用的完整功能。',
    facts: [
      '百度岗位要求重度使用 AI Coding，从想法到原型再到可用功能。',
      '岗位同时要求产品感觉、交互细节、基础开发、调试和部署。',
      'OpenAI 当前 Agent 岗位包含 Product Engineer, Full Stack - Agents。',
    ],
    countercase:
      '中国同名样本仍少，可能长期藏在产品实习、全栈产品工程或独立开发岗位中；不会调试部署时，不能只靠 Vibe Coding 冒充工程能力。',
    entry:
      '把现有本地 AI 产品升级为可解释、可调试、可部署的作品，并记录真实用户、失败修复和版本迭代。',
    keywords: [
      'AI Product Engineer',
      'AI 产品工程师',
      'Product Engineer',
      'AI Coding',
      'Vibe Coding',
      '独立产品',
    ],
    sources: [
      {
        label: '百度｜AI 产品工程实习生',
        url: 'https://talent.baidu.com/jobs/detail/INTERN/eccb3218-409a-4157-98a6-895b733266cd',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜Agent 当前职位',
        url: 'https://openai.com/careers/search/?q=agent',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'agent-evals-product',
    rank: 3,
    fitRank: 2,
    title: 'Agent Evals Product / Agent 策略 PM',
    shortTitle: 'Agent 评测产品',
    category: '长程任务 × Skill 策略 × 效果归因',
    noveltyZone: 'frontier',
    lastSignalAt: '2026-08-17',
    whyNew:
      'Agent 从聊天变成执行系统后，开始需要专人定义长程任务、Skill、记忆、成本和失败归因。',
    institutionalStatus: 'industry_named',
    demandStage: 'forming',
    confidence: 'high',
    fit: 'direct',
    fitReason:
      '模型评测、内容质控、产品判断和可验证工作流正好落在核心任务上，是除医学垂直外最贴近现有证据的入口。',
    signal:
      '百度 7—8 月连续出现评测产品与 DuMate 策略 PM，职责围绕执行类 Agent 的长程评测和内置 Skill。',
    judgment:
      '这是本版最值得良直接关注的新入口；它比通用 AI 产品经理更新，也更贴近良已有的验证型工作流。',
    facts: [
      'DuMate 策略 PM 要制定长程任务测试并优化完成率、记忆连贯性和成本。',
      '岗位负责 Office、浏览器自动化、生图生视频等内置 Skill 的逻辑、调用和复盘。',
      '评测产品实习生把同一组任务作为独立产品职责，而非普通 PM 的附带要求。',
    ],
    countercase:
      '当前中国一手证据主要来自百度，可能是公司内部命名；尚不能宣称全国放量。',
    entry:
      '作品从单轮回答评测升级到多步任务：完成率、成本、记忆、工具调用、异常恢复和人工接管。',
    keywords: [
      'Agent Evals Product',
      'Agent 策略 PM',
      '评测产品',
      '长程任务评测',
      'Skill 策略',
      'Agent 产品策略',
    ],
    sources: [
      {
        label: '百度｜DuMate 策略 PM（当前列表）',
        url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
        kind: 'employer',
      },
      {
        label: '百度｜评测产品实习生',
        url: 'https://talent.baidu.com/jobs/detail/INTERN/a7487847-e649-4b60-96cf-faa90f6f8b34',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'agent-evaluation-engineer',
    rank: 4,
    fitRank: 8,
    title: 'Agent Evaluation Engineer / Environment Builder',
    shortTitle: 'Agent 评估工程',
    category: '评测框架 × 任务环境 × 自动 Grader',
    noveltyZone: 'expanding',
    lastSignalAt: '2026-08-29',
    whyNew:
      '评测对象从模型回复升级为会规划、用工具、记忆和执行的 Agent，任务环境本身成为工程资产。',
    institutionalStatus: 'industry_named',
    demandStage: 'scaling',
    confidence: 'high',
    fit: 'stretch',
    fitReason:
      '评测思维可以直接迁移，但环境构建、自动 grader 与评测基础设施要求更强工程能力，宜先做作品再投。',
    signal:
      '百度、OpenAI 与 Anthropic 当前都在招聘 Agent 评估、Evals Infrastructure、Frontier Evals & Environments 等任务。',
    judgment:
      '这是传统模型评测之后更前沿的一层：不只判断答案，而是构造环境、运行轨迹、grader 和回归实验。',
    facts: [
      '百度 Agent 评估工程师评估记忆、规划、工具调用与反思，并建设 Agent Benchmark。',
      'OpenAI 当前设有 Frontier Evals & Environments 相关岗位。',
      'Anthropic 当前同时列出 Model Evaluations、Evals Infrastructure 和环境基础设施岗位。',
    ],
    countercase:
      '代表性岗位要求 Python、统计、实验设计和工程框架；手工评测表不能替代自动化能力。',
    entry:
      '先从 Agent 评测产品或医疗评测进入，再补 Python、日志分析、自动 grader 和最小评测 harness。',
    keywords: [
      'Agent Evaluation Engineer',
      'Evals Engineer',
      'Environment Builder',
      'Frontier Evals',
      'LLM-as-a-judge',
      'Agent Benchmark',
    ],
    sources: [
      {
        label: '百度｜Agent 评估工程师实习生',
        url: 'https://talent.baidu.com/jobs/detail/INTERN/a0bbc449-854f-421c-bfaf-1a5be906f86e',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜Agent 当前职位',
        url: 'https://openai.com/careers/search/?q=agent',
        kind: 'employer',
      },
      {
        label: 'Anthropic｜当前职位',
        url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'agent-post-training',
    rank: 5,
    fitRank: 12,
    title: 'Agent Post-Training Engineer / Researcher',
    shortTitle: 'Agent 后训练',
    category: '训练信号 × 环境 × 产品行为',
    noveltyZone: 'expanding',
    lastSignalAt: '2026-08-29',
    whyNew:
      'Agent 能力开始按 Context、Connectors、Computer Use、Personality 和 Frontier Evals 等产品行为拆分训练岗位。',
    institutionalStatus: 'industry_named',
    demandStage: 'forming',
    confidence: 'high',
    fit: 'observe',
    fitReason:
      '方向重要但通常要求机器学习训练、研究或大规模实验经验，与当前临床产品型入口距离较远。',
    signal:
      'OpenAI 当前 Agent Post-Training 已出现多个明确细分；Anthropic 也招聘 Production Model Post-Training。',
    judgment:
      '这是真正前沿的模型能力职业族，但高度集中在实验室，不等于大众就业入口。',
    facts: [
      'OpenAI 当前列出 Context、Connectors、Computer Use、Personality、Artifacts 等 Post-Training 细分。',
      '职责把产品失败转成环境、grader、训练数据、奖励信号和训练实验。',
      'Anthropic 当前也设有 Production Model Post-Training 岗位。',
    ],
    countercase:
      '岗位要求机器学习、强化学习、训练系统和强工程能力，市场容量可能长期集中在少数实验室。',
    entry:
      '只观察，不为它暂停当前求职或从零投入完整训练栈。',
    keywords: [
      'Agent Post-Training',
      'Production Model Post-Training',
      'Context Research',
      'Connectors Research',
      'RLHF',
      'Grader',
    ],
    sources: [
      {
        label: 'OpenAI｜Agent Post-Training, Context',
        url: 'https://openai.com/careers/agent-post-training-context-research-san-francisco/',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜Agent 当前职位',
        url: 'https://openai.com/careers/search/?q=agent',
        kind: 'employer',
      },
      {
        label: 'Anthropic｜当前职位',
        url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'applied-ai-architect',
    rank: 6,
    fitRank: 9,
    title: 'Applied AI Architect / Applied AI Engineer',
    shortTitle: 'Applied AI',
    category: '架构 × 技术咨询 × 生产边界',
    noveltyZone: 'expanding',
    lastSignalAt: '2026-08-29',
    whyNew:
      '企业采购的不再只是模型 API，而是能把模型行为、评测、平台和组织约束组合成生产方案的人。',
    institutionalStatus: 'industry_named',
    demandStage: 'scaling',
    confidence: 'high',
    fit: 'stretch',
    fitReason:
      '领域理解与工作流设计可迁移，但架构决策、客户咨询和生产系统经验门槛偏高，更像中期升级方向。',
    signal:
      'Anthropic 当前 Applied AI 团队有 20 个职位并覆盖多个行业与国家；OpenAI 也有多类 Applied AI Architect / Engineer。',
    judgment:
      '它与 FDE 相邻，但更偏架构、技术咨询和可复用方案，而非每次都亲自承担完整客户系统。',
    facts: [
      'Anthropic Applied AI 当前覆盖商业、政府、行业、合作伙伴、企业技术和安全。',
      '同一团队同时出现 Architect、Engineer、FDE、Solutions Architect 与 Technical Deployment Lead。',
      'OpenAI 当前职位也包含多类 Applied AI Architect 与 Applied AI Engineer。',
    ],
    countercase:
      '样本多为资深企业岗位，可能长期与传统 Solutions Architect 标题并存。',
    entry:
      '先积累医疗 AI 场景发现、方案表达、PoC、评测与验收，再向医疗 Applied AI / Solutions 迁移。',
    keywords: [
      'Applied AI Architect',
      'Applied AI Engineer',
      'AI Solutions Architect',
      'AI 架构师',
      'MaaS',
      '生产评测',
    ],
    sources: [
      {
        label: 'Anthropic｜Applied AI 当前职位',
        url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜当前职位',
        url: 'https://openai.com/careers/search/?trk=public_post-text',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'ai-success-engineer',
    rank: 7,
    fitRank: 4,
    title: 'AI Success Engineer / 领域 AI 成功工程师',
    shortTitle: 'AI Success',
    category: '领域采用 × 工作流效果 × 客户成功',
    noveltyZone: 'expanding',
    lastSignalAt: '2026-08-29',
    whyNew:
      '模型进入组织后，客户成功开始承担技术采用、工作流结果和领域价值，而不只是续费与关系维护。',
    institutionalStatus: 'industry_named',
    demandStage: 'forming',
    confidence: 'high',
    fit: 'stretch',
    fitReason:
      '临床背景、产品沟通与落地支持可组合成医疗或生命科学入口；还需证明客户采用、效果指标和上线闭环。',
    signal:
      'OpenAI 当前 AI Success 已细分到教育、政府、医疗与生命科学，并同时招聘 Biosciences AI Support。',
    judgment:
      '这可能是领域专家进入 AI 部署链的中间层，对医学背景有潜在复利，但当前样本仍偏资深。',
    facts: [
      'OpenAI 当前 AI Success 职位覆盖教育、政府、医疗与生命科学。',
      '同一招聘体系另有 Biosciences AI Support Engineer。',
      'Anthropic 当前也出现 Life Sciences Operator 等领域落地角色。',
    ],
    countercase:
      '强证据主要来自前沿公司，且不少岗位要求多年技术支持、客户成功或行业经验。',
    entry:
      '先找医疗 AI 产品支持、解决方案、产品运营与验收岗位，积累采用指标和真实工作流结果。',
    keywords: [
      'AI Success Engineer',
      'AI Support Engineer',
      'Healthcare AI Success',
      'AI 客户成功',
      'AI Enablement',
      '采用效果',
    ],
    sources: [
      {
        label: 'OpenAI｜AI Success 当前职位',
        url: 'https://openai.com/careers/search/?q=ai+success',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜领域 AI Success / Support',
        url: 'https://openai.com/careers/search/?locationId=6252b4ed-714d-469a-a970-7a13101bac9d',
        kind: 'employer',
      },
      {
        label: 'Anthropic｜Life Sciences 等当前职位',
        url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'agentic-risk-safeguards',
    rank: 8,
    fitRank: 10,
    title: 'Agentic Risk / Safeguards Analyst',
    shortTitle: 'Agent 风险分析',
    category: 'Agent 安全 × 风险组合 × 缓解闭环',
    noveltyZone: 'forming',
    lastSignalAt: '2026-08-29',
    whyNew:
      'Agent 拥有自治、多步执行、工具、记忆和连接器后，风险从内容审核升级为系统级运行风险。',
    institutionalStatus: 'industry_named',
    demandStage: 'forming',
    confidence: 'high',
    fit: 'observe',
    fitReason:
      '临床安全与质量意识有迁移价值，但前沿 Agent 安全岗位仍偏研究、红队或基础设施，先观察任务下沉。',
    signal:
      'OpenAI 当前直接招聘 Agentic Risk Analyst；Anthropic Safeguards 已分化到研究、基础设施、数据和红队。',
    judgment:
      '职业任务已形成，但资深门槛和地区集中度都高；先把它当医疗 AI 评测的相邻能力。',
    facts: [
      'OpenAI 岗位管理 Agent 风险、所有者、缓解措施、依赖和剩余缺口。',
      '职责覆盖事故、评测、红队、安全审查、外部弱信号和发布准备度。',
      'Anthropic 当前 Safeguards 职位横跨研究、工程、数据与基础设施。',
    ],
    countercase:
      'OpenAI 样本通常要求 7 年以上安全、风控、调查或信任安全经验；中国初级证据不足。',
    entry:
      '在医疗评测作品中加入风险分级、升级机制、适用边界和高风险失败案例，不单独转轨。',
    keywords: [
      'Agentic Risk Analyst',
      'Safeguards',
      'Agent Security',
      'AI 风险运营',
      '红队',
      '安全评测',
    ],
    sources: [
      {
        label: 'OpenAI｜Agentic Risk Analyst',
        url: 'https://openai.com/careers/agentic-risk-analyst-san-francisco/',
        kind: 'employer',
      },
      {
        label: 'Anthropic｜Safeguards 当前职位',
        url: 'https://www.anthropic.com/careers/jobs?hsLang=en-us',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'agent-identity-trust-design',
    rank: 9,
    fitRank: 11,
    title: 'Agent Identity & Trust Designer',
    shortTitle: 'Agent 信任设计',
    category: '身份 × 授权 × 人机信任',
    noveltyZone: 'frontier',
    lastSignalAt: '2026-08-29',
    whyNew:
      '人替 Agent 授权、Agent 代表谁、何时确认以及 Agent 间信任，正在产生没有成熟惯例的新交互问题。',
    institutionalStatus: 'analyst_derived',
    demandStage: 'seed',
    confidence: 'medium',
    fit: 'observe',
    fitReason:
      '产品判断可迁移，但身份权限、信任设计与安全系统经验尚无直接证明，暂不作为主投入方向。',
    signal:
      'OpenAI 当前产品设计岗位已把人—Agent、Agent—Agent 的身份、授权、权限和信任模型列为明确职责。',
    judgment:
      '这是值得监测的前沿任务，不足以宣称已成独立职业；出现第二家雇主前保持 seed。',
    facts: [
      '岗位要求设计 Agent 能访问什么、代表谁行动以及何时需要更强认证。',
      '职责明确提到人—Agent 与 Agent—Agent 的身份、授权和信任。',
      'OpenAI 当前 Agent 产品岗位扩张，为这类交互任务提供相邻需求背景。',
    ],
    countercase:
      '目前只有单一强样本，可能最终仍被吸收进身份、安全或产品设计岗位。',
    entry:
      '不转轨；在医疗 Agent 作品中加入权限模型、敏感动作确认、审计记录和人工接管。',
    keywords: [
      'Agent Identity',
      'Agent Trust',
      'Agent Authorization',
      'AI 产品设计',
      'Human-Agent Interaction',
      '权限设计',
    ],
    sources: [
      {
        label: 'OpenAI｜Product Designer, Identity',
        url: 'https://openai.com/careers/product-designer-identity-san-francisco/',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜Agent 当前职位',
        url: 'https://openai.com/careers/search/?q=agent',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'agent-product-manager',
    rank: 10,
    fitRank: 3,
    title: 'Agent Product Manager / Workflow Product',
    shortTitle: 'Agent 产品',
    category: '工具调用 × 多步任务 × 异常恢复',
    noveltyZone: 'expanding',
    lastSignalAt: '2026-08-29',
    whyNew:
      'AI 产品经理并不新；新的是对工具调用、长程执行、异常恢复和 Agent 评测负责的产品子类。',
    institutionalStatus: 'industry_named',
    demandStage: 'scaling',
    confidence: 'high',
    fit: 'direct',
    fitReason:
      'AI 应用实践、产品与流程意识能直接迁移到多步任务、工具调用和异常恢复设计，适合用现有项目改造成求职证据。',
    signal:
      '百度近期同时出现 AI Agent 产品、Coding Agent 产品和自主 Agent 产品；OpenAI 当前也招聘 API Agents 产品经理。',
    judgment:
      '良可直接关注，但要排除只做聊天、内容生成或提示词维护的换皮 AI 产品岗。',
    facts: [
      '百度 AI Agent 产品实习覆盖工作流、模型边界、异常处理、Vibe Coding 和产品数据。',
      'Coding Agent 产品岗位覆盖用户场景、原型、协同落地和上线复盘。',
      'OpenAI 当前 Agent 职位包含 Product Manager, API Agents。',
    ],
    countercase:
      '只写“AI 产品”而没有工具、执行、环境、评测和结果责任的岗位不属于本簇。',
    entry:
      '作品明确展示需求、Agent 与工具分工、失败处理、验收指标、权限和复盘。',
    keywords: [
      'Agent Product Manager',
      'Agent 产品经理',
      'Workflow Product',
      'Coding Agent 产品',
      'AI Agent 产品',
      '策略产品',
    ],
    sources: [
      {
        label: '百度｜AI Agent 产品实习',
        url: 'https://talent.baidu.com/jobs/detail/INTERN/d896e43f-94b7-4eb5-93af-d99a24896997',
        kind: 'employer',
      },
      {
        label: '百度｜Coding Agent 产品',
        url: 'https://talent.baidu.com/jobs/detail/INTERN/f8227146-6713-4744-a963-dccebf6ff468',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜Agent 当前职位',
        url: 'https://openai.com/careers/search/?q=agent',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'medical-ai-evaluation',
    rank: 11,
    fitRank: 1,
    title: '医疗 AI 评测与领域数据质量',
    shortTitle: '医疗 AI 评测',
    category: '临床标准 × 评测 × 领域质量',
    noveltyZone: 'forming',
    lastSignalAt: '2026-08-29',
    whyNew:
      '医学评测本身不是最新头衔；新变化是它正与医疗 FDE、生命科学 AI Success 和 Agent 工作流验收汇合。',
    institutionalStatus: 'industry_named',
    demandStage: 'forming',
    confidence: 'high',
    fit: 'direct',
    fitReason:
      '临床医学、模型评测、知识质量和可追溯验证四项优势在同一岗位汇合，是当前最有差异化的主入口。',
    signal:
      '医疗 FDE、生命科学 AI Success、Biosciences Support 与中国医学模型评测样本同时存在。',
    judgment:
      '这是良最有差异化的入口，但不再因个人适配而占据雷达第一位。',
    facts: [
      'OpenAI 已把 FDE 细分到医疗，并要求客户特定 benchmark、验收和上线准备度。',
      'OpenAI 当前存在医疗与生命科学 AI Success、Biosciences AI Support。',
      '中国招聘样本仍在采购医学标准、循证检索、模型评估和数据质量任务。',
    ],
    countercase:
      '领域价值不等于初级岗位放量；低价医学标注与资深医疗部署岗位之间仍有明显断层。',
    entry:
      '做一份无患者隐私的医疗 AI 评测包，并逐步升级为多步医疗 Agent 工作流验收。',
    keywords: [
      '医疗 AI 评测',
      '医学大模型',
      'Healthcare FDE',
      'Life Sciences AI',
      '医学数据质量',
      '临床 AI 产品',
    ],
    sources: [
      {
        label: 'OpenAI｜Healthcare FDE',
        url: 'https://openai.com/careers/forward-deployed-engineer-%28fde%29-healthcare-sf-san-francisco/',
        kind: 'employer',
      },
      {
        label: 'OpenAI｜领域 AI Success / Support',
        url: 'https://openai.com/careers/search/?locationId=6252b4ed-714d-469a-a970-7a13101bac9d',
        kind: 'employer',
      },
      {
        label: '百度｜医学标注经理',
        url: 'https://talent.baidu.com/jobs/detail/SOCIAL/cde9bf36-be36-4c0e-ba1e-bbd58bc4735c',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'ai-ops-rag-baseline',
    rank: 12,
    fitRank: 6,
    title: '通用 AI 产品运营 / RAG 知识治理',
    shortTitle: 'AI 运营 / RAG',
    category: '成熟基线 × 效果闭环',
    noveltyZone: 'baseline',
    lastSignalAt: '2026-08-26',
    whyNew:
      '需求仍然真实，但模型运营、知识库和 RAG 已成为常规 AI 岗位职责，不再算前沿发现。',
    institutionalStatus: 'analyst_derived',
    demandStage: 'mature',
    confidence: 'high',
    fit: 'direct',
    fitReason:
      '进入门槛与现有经历最接近，可作为短期求职入口；但它已是成熟基线，不应替代对更新职业的能力投资。',
    signal:
      '近期岗位继续采购模型说明、调用数据、客户接入、文档、知识库和 Agent 效果评估，但任务已趋常规。',
    judgment:
      '保留为现实求职基线，不再放在新职业首页前列。',
    facts: [
      '百度近期模型平台运营覆盖模型能力、调用数据、客户接入、文档与竞品研究。',
      '近期业务运营平台产品岗位包含模型与 Agent 效果评估闭环。',
      'Agent 开发岗位继续采购知识库、工作流和自动评估能力。',
    ],
    countercase:
      '仅上传文档、维护 FAQ 或做换皮增长的岗位价值低；必须对模型效果、来源或用户反馈负责。',
    entry:
      '可直接投，但简历必须突出效果评估、来源追溯、用户反馈和版本复盘。',
    keywords: [
      'AI 产品运营',
      '模型运营',
      'RAG',
      '知识治理',
      'Agent 效果评估',
      '模型平台运营',
    ],
    sources: [
      {
        label: '百度｜当前实习职位列表',
        url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
        kind: 'employer',
      },
      {
        label: '百度｜Agent 开发与自动评估样本',
        url: 'https://talent.baidu.com/jobs/list?recommendCode=IX3PB1&recruitType=INTERN',
        kind: 'employer',
      },
    ],
  },
  {
    id: 'prompt-training-digital-human-cooling',
    rank: 13,
    fitRank: 13,
    title: '独立提示词 / 泛训练师 / 模板数字人',
    shortTitle: '旧标题退潮层',
    category: '通用技能 × 商品化供给',
    noveltyZone: 'cooling',
    lastSignalAt: '2026-08-29',
    whyNew:
      '这组方向不再是新职业信号：Prompt 正被多岗位吸收，基础训练与模板内容更易自动化和压价。',
    institutionalStatus: 'analyst_derived',
    demandStage: 'weakening',
    confidence: 'high',
    fit: 'avoid',
    fitReason:
      '相关技能可以保留在作品里，但独立头衔缺少长期壁垒，不值得作为良的职业定位或付费培训方向。',
    signal:
      '近期前沿岗位把 Prompt、数据标注和数字内容能力作为工作流中的技能，而非高价值独立职业。',
    judgment:
      '把能力留在作品中，不把这些头衔作为长期职业定位，也不为单一证书付费。',
    facts: [
      'LinkedIn Skills on the Rise 统计的是 Prompt 等技能增长，不等于独立提示词岗位增长。',
      '百度 AI 产品工程岗位把 Prompt / Tool 调度放在端到端产品能力的加分项中。',
      '前沿评测岗位的价值已转向环境、grader、失败归因和业务结果。',
    ],
    countercase:
      '少数独立岗位仍会存在；如果它拥有领域标准、质量责任、评测闭环或产品所有权，应重新拆出，而不是一概否定。',
    entry:
      'Prompt、标注和数字内容只作为 AI 产品、评测、运营或领域质量岗位中的技能表达。',
    keywords: [
      '提示词工程师',
      'AI 训练师',
      '数字人训练师',
      'Prompt Engineering',
      '数据标注',
      '数字人运营',
    ],
    sources: [
      {
        label: 'LinkedIn｜Skills on the Rise 2026',
        url: 'https://news.linkedin.com/2026/Skills-on-the-rise-2026',
        kind: 'research',
      },
      {
        label: '百度｜AI 产品工程实习生',
        url: 'https://talent.baidu.com/jobs/detail/INTERN/eccb3218-409a-4157-98a6-895b733266cd',
        kind: 'employer',
      },
      {
        label: '百度｜Agent 评估工程师',
        url: 'https://talent.baidu.com/jobs/detail/INTERN/a0bbc449-854f-421c-bfaf-1a5be906f86e',
        kind: 'employer',
      },
    ],
  },
];

export const topActions = clusters.slice(0, 3);

export const liangTopActions = [...clusters]
  .sort((left, right) => left.fitRank - right.fitRank)
  .slice(0, 3);
