// 岗位归类规则。只看职位标题（不区分大小写），一个岗位可以同时属于多个职业簇。
// 这是技术字段：调整规则不改变研究结论。改完运行 `node --test`，再到页面上看归类结果。

// 与新职业无关的职能：销售、市场、招聘、财务、法务、行政等。
// 先按部门排除（只对填了部门的海外职位板有效），再按标题排除。
export const excludedTeams = new Set([
  'Sales',
  'Enterprise Sales',
  'GPS Sales',
  'Gen AI Sales',
  'Physical AI Sales',
  'Marketing',
  'Marketing & Brand',
  'Finance',
  'Strategic Finance',
  'CFO Team',
  'Legal',
  'Legal & GRC',
  'People',
  'Communications',
  'Workplace',
  'IT',
  'Corporate Security',
  'Public Sector Business Development',
  'Executive Operations',
  'Business Operations',
]);

export const excludedTitle =
  /\baccount (?:director|executive|associate|manager)|\bsales\b|seller|business development|partner director|client partner|agency partner|vendor (?:lead|manager)|deal operations|capture manager|subcontracts|\brecruit|marketing|lifecycle|growth lead|\bcounsel\b|paralegal|payroll|accountant|executive assistant|\bads\b|\bad (?:formats|sales|solutions|products)\b|warehouse|logistics|transaction (?:manager|principal)|land development|energy scheduling|due diligence|external affairs|congressional|state and local affairs|economic development|community engagement|\bAV\b|audiovisual|administrative|business affairs|deal (?:team|lead)|special situations|销售|招聘|品牌|市场实习|市场营销|营销|推广|采购|财务(?:BP|分析|经理|专员|主管)|会计|出纳|法务|行政|人力资源|HRBP|商务拓展|大客户经理|广告(?:运营|销售|行业|代理)/i;

// 非 AI 公司的来源（requireAiTitle）只算标题本身带 AI 信号的岗位；AI 公司的职位默认都相关。
// 除了 AI、大模型这类词，也认 FDE、后训练、评测这类只在 AI 岗位出现的职位词。
export const aiTitle =
  /\bai\b|aigc|genai|gen ai|generative|\bllms?\b|\bgpt|machine learning|\bml\b|deep learning|\bnlp\b|computer vision|agent|智能体|大模型|多模态|模型|算法|机器学习|深度学习|人工智能|智能|生成式|文心|千帆|混元|longcat|dumate|maas|forward[- ]deployed|\bfde\b|前线部署|post[- ]?training|后训练|强化学习|reinforcement learning|\brl\b|\bevals?\b|模型评测|评测产品|评测工程|评估工程|benchmark|prompt|提示词|标注|训练师|数字人/i;

/** @type {Record<string, {include: RegExp[], exclude?: RegExp[]}>} */
export const clusterRules = {
  'fde-ai-deployment': {
    include: [
      /forward[- ]deployed|\bFDE\b/i,
      /\bdeployment (?:lead|engineer|engineering|strategist|manager)/i,
      /technical deployment/i,
      /AI 实施|部署工程|前线部署|前沿部署|驻场.{0,4}AI|AI.{0,6}驻场/i,
    ],
    exclude: [/model deployment|capacity|data cent(?:er|re)/i],
  },
  'ai-product-engineer': {
    include: [/\bproduct engineer|AI 产品工程|产品工程师/i],
    exclude: [/manufactur/i],
  },
  'agent-evals-product': {
    include: [
      /(?:evals?|evaluation|评测|测评).*(?:product manager|\bPM\b|产品|策略)/i,
      /(?:product manager|\bPM\b|产品|策略).*(?:evals?\b|evaluation|评测|测评)/i,
      /策略\s*PM|agent.*策略|策略.*agent/i,
    ],
  },
  'agent-evaluation-engineer': {
    include: [
      /\bevals?\b|\bevaluations?\b|benchmark|\bgraders?\b/i,
      /\benvironments?\b/i,
      /评测工程|评估工程|评测开发|(?:大模型|模型|多模态|AI|agent|智能体).{0,8}评测|评测(?:专家|工程师|研究员|算法)/i,
    ],
    exclude: [/product manager|\bPM\b|产品|策略|analyst|enforcement/i],
  },
  'agent-post-training': {
    include: [
      /post[- ]?training|后训练/i,
      /\bRL\b|reinforcement learning|强化学习|RLHF/i,
    ],
  },
  'applied-ai-architect': {
    include: [
      /applied ai/i,
      /\bai architect|solutions? (?:architect|engineer)|field executive architect/i,
      /解决方案|AI ?架构|AI ?应用(?:工程|开发|架构|专家)|大模型应用/i,
    ],
    exclude: [/\bads\b/i],
  },
  'ai-success-engineer': {
    include: [
      /ai success|technical success|customer success/i,
      /support engineer|support engineering/i,
      /enablement (?:lead|manager)|cyber enablement/i,
      /technical (?:training|instructor)|head of technical training/i,
      /AI 客户成功|客户成功/i,
    ],
    exclude: [/\bIT support|executive support|data science/i],
  },
  'agentic-risk-safeguards': {
    include: [
      /safeguards|agentic (?:risk|safety)/i,
      /agent (?:safety|robustness|oversight|security)/i,
      /red[- ]team|threat (?:intel|investigat)/i,
      /risk (?:operations|analyst)|safety (?:operations|response)|trust ?(?:&|and) ?safety/i,
      /ai controls|harm operations|(?:agent|risk) standards/i,
      /(?:大模型|模型|AI|智能体|agent|aigc).{0,8}(?:风险|安全|红队|风控)|(?:风险|安全|红队|风控).{0,8}(?:大模型|模型|AI|智能体|agent|aigc)|安全评测|内容安全/i,
    ],
    exclude: [/\bads\b/i],
  },
  'agent-identity-trust-design': {
    include: [
      /agent (?:identity|trust|authori[sz]ation|permissions?)/i,
      /(?:identity|trust).*(?:designer|design lead)|(?:designer|design lead).*(?:identity|trust)/i,
      /智能体身份|权限设计/i,
    ],
  },
  // 只算对 Agent / 工作流负责的产品岗；普通“AI 产品经理”研究里写明不算新，归到簇外的产品组。
  'agent-product-manager': {
    include: [
      /(?:agents?|agentic|codex|workflow|copilot).*(?:product manager|\bPM\b|产品经理|产品专家|产品负责人)/i,
      /(?:product manager|\bPM\b|产品经理|产品专家).*(?:agents?|agentic|codex|workflow|智能体|工作流)/i,
      /(?:智能体|工作流|dumate).{0,6}(?:产品经理|产品专家|产品负责人|产品策划)/i,
    ],
  },
  'medical-ai-evaluation': {
    include: [
      /medical|clinical|clinician|physician|nurs(?:e|ing)|pharmacist|doctor|\bhealth(?:care)?\b|life sciences?|biosciences?|biomedical|pharma/i,
      /医疗|医学|临床|健康|医药|药物|医生|医师|护士|护理|药师/i,
    ],
    exclude: [/biological safety|bio harms|hardware health/i],
  },
  'ai-ops-rag-baseline': {
    include: [
      /(?:\bai\b|模型|大模型|生成式|agent|dumate|gen ?ai|generative ai).*运营|运营.*(?:\bai\b|模型|agent)/i,
      /product operations.*(?:\bai\b|generative)|ai operations/i,
      /\bRAG\b|retrieval|knowledge (?:team|work|management)|知识库|知识治理|检索/i,
    ],
  },
  'prompt-training-digital-human-cooling': {
    include: [
      /prompt engineer|提示词|训练师|数字人|数据标注|标注员|annotator|data label/i,
    ],
  },
};

// 没归进任何职业簇的岗位按粗方向折叠显示；按顺序取第一个命中的方向。
export const otherGroups = [
  {
    id: 'agent-roles',
    label: 'Agent 相关岗位（研究簇之外）',
    pattern: /\bagent|智能体|conversation design|对话设计/i,
  },
  {
    id: 'ai-product',
    label: '产品经理与产品策划（通用 AI 产品）',
    pattern: /product manager|产品经理|产品策划|产品专家|产品负责人|\bAPM\b/i,
  },
  {
    id: 'ai-content',
    label: 'AI 内容、游戏与美术（策划、美术、导演等）',
    pattern: /策划|美术|动画|导演|制片|内容创作|设计师|游戏/,
  },
  {
    id: 'expert-data',
    label: '专家数据与人类反馈',
    pattern:
      /human (?:data|frontier)|data acquisition|frontier data|subject matter expert|\bSME\b|contributor|fellow/i,
  },
  {
    id: 'robotics',
    label: '机器人与硬件设备',
    pattern:
      /robot|actuator|motor|mechanical|electrical|\bPCB\b|manufactur|hardware|device|silicon|chip design|prototyping/i,
  },
  {
    id: 'security',
    label: '安全、隐私与反滥用',
    pattern:
      /security|cyber|threat|fraud|abuse|privacy|integrity|compliance|policy|incident|安全/i,
  },
  {
    id: 'research',
    label: '模型研究（对齐、预训练、推理等）',
    pattern:
      /research|scientist|\bRE\b|\bRS\b|alignment|interpretability|pre-?train|reasoning|\bRSI\b|算法|研究|科学家|语音|视觉|多模态/i,
  },
  {
    id: 'infra',
    label: '基础设施、算力与性能',
    pattern:
      /infrastructure|\binfra\b|\bGPU\b|\bTPU\b|kernel|compute|inference|performance|distributed|network|database|storage|reliability|\bSRE\b|devops|observability|build systems|caching|data center|platform|sandbox|systems engineer|算力|训推|平台|基础设施|沙箱|运维/i,
  },
  {
    id: 'data',
    label: '数据科学与数据工程',
    pattern: /\bdata\b|analytics|数据/i,
  },
  {
    id: 'product',
    label: '产品、设计与增长',
    pattern:
      /product|design|growth|\bUX\b|user experience|monetization|产品|运营/i,
  },
  {
    id: 'program',
    label: '项目、交付与运营管理',
    pattern:
      /program|\bTPM\b|operations|operator|strategy|strategist|delivery|engagement|partnerships?|launch|项目|商业分析|战略|咨询|分析师|交付|技术支持|合作/i,
  },
  {
    id: 'engineering',
    label: '软件工程（各产品线）',
    pattern: /engineer|developer|architect|\bSWE\b|研发|开发|工程|架构|测试/i,
  },
  { id: 'other', label: '其他', pattern: /[\s\S]/ },
];
