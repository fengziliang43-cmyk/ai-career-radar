/**
 * Skill words found in a job's responsibilities and requirements. They are
 * hints for preparation, not a hiring bar, so degree, years and certificates
 * are deliberately absent.
 */
const TERMS = [
  [/\bpython\b/i, 'Python'],
  [/\btypescript\b|\bjavascript\b|\bnode\.?js\b/i, 'TypeScript / JavaScript'],
  [/\breact\b/i, 'React'],
  [/\bsql\b/i, 'SQL'],
  [/\bpytorch\b|\bjax\b|\btensorflow\b/i, 'PyTorch / JAX'],
  [/\bllms?\b|large language models?|大模型|大语言模型/i, 'LLM 原理与应用'],
  [/\bagents?\b|agentic|智能体/i, 'Agent 与工作流编排'],
  [/tool[- ]?(?:use|call)|function call|工具调用/i, '工具调用'],
  [/\brag\b|retrieval[- ]augmented|检索增强|知识库/i, 'RAG / 知识库'],
  [/\bevals?\b|evaluation|benchmark|评测|测评/i, '评测设计与指标'],
  [/\bgraders?\b|llm[- ]as[- ]a[- ]judge|rubric/i, '自动评分 / Rubric'],
  [/reinforcement learning|\brlhf\b|\brl\b|强化学习/i, '强化学习 / RLHF'],
  [/fine[- ]?tun|post[- ]?training|微调|后训练/i, '微调与后训练'],
  [/prompt/i, 'Prompt 设计'],
  [/\bapis?\b|integrations?|系统集成/i, 'API 与系统集成'],
  [/kubernetes|\bk8s\b|docker|container/i, '容器与 Kubernetes'],
  [/\baws\b|\bgcp\b|\bazure\b|cloud (?:infrastructure|platform)/i, '云平台'],
  [/\bcuda\b|\btriton\b|\bgpus?\b/i, 'GPU / CUDA'],
  [/distributed (?:systems|training)|分布式/i, '分布式系统'],
  [/red[- ]team|红队/i, '红队测试'],
  [/interpretability|可解释/i, '可解释性'],
  [/a\/b test|experiment design|实验设计/i, 'A/B 实验'],
  [/data analysis|analytics|数据分析/i, '数据分析'],
  [/clinical|clinician|patient|临床|医学|医疗/i, '临床与医疗场景'],
  [/\bhipaa\b|\bfhir\b|\bhl7\b|\behr\b|\bemr\b|病历/i, '医疗数据标准与合规'],
  [/privacy|compliance|regulat|合规|隐私/i, '隐私与合规'],
];

const SCOPE_START =
  /about (?:the|this) role|responsibilities|in this role|what you[’']ll do|you (?:will|might)|you may be a good fit|who should apply|qualifications|requirements|工作职责|岗位职责|职位描述|任职要求/i;
const SCOPE_END =
  /about anthropic|about openai|about scale|compensation|equal opportunity|benefits|salary range|logistics|pay transparency|annual salary|we are an equal/i;

export function extractKnowledge(description) {
  if (!description) return [];
  const start = description.search(SCOPE_START);
  let scope = start >= 0 ? description.slice(start) : description;
  const end = scope.search(SCOPE_END);
  if (end > 0) scope = scope.slice(0, end);
  return TERMS.filter(([pattern]) => pattern.test(scope)).map(
    ([, label]) => label,
  );
}
