# 信源登记

## 使用规则

- 记录来源主体、页面标题、发布日期、观察日期、地区、可支持的结论和限制。
- 同一报告的转述不算独立证据；尽量回到原始报告或官方页面。
- 招聘样本用于识别任务与需求，不把样本量很小的结果外推为整个市场。

## 网站职业数据来源（固定白名单）

白名单写在 `site/server/sources.mjs`，与本节一致。都是雇主官方的公开职位接口或列表页，不接受页面传入的地址，不使用账号、Cookie 或登录态，不绕过访问限制；2026-10-11 检查过 robots.txt，均未限制。2026-10-11 良确认在原 4 个来源之外新增 17 个。

| 分组 | 雇主 | 接口 | 读取方式 | 计入范围 |
|---|---|---|---|---|
| 海外 AI 公司 | OpenAI | [Ashby](https://api.ashbyhq.com/posting-api/job-board/openai) | 全量，1 次请求 | 排除销售等职能后全部 |
| 海外 AI 公司 | Anthropic | [Greenhouse](https://api.greenhouse.io/v1/boards/anthropic/jobs?content=true) | 全量，1 次 | 同上 |
| 海外 AI 公司 | Scale AI | [Greenhouse](https://api.greenhouse.io/v1/boards/scaleai/jobs?content=true) | 全量，1 次 | 同上 |
| 海外 AI 公司 | Palantir | [Lever 公开职位页](https://jobs.lever.co/palantir) | 全量，1 次；页面不含职位描述 | 同上（良 2026-10-11 选择加入；FDE 老牌雇主，会抬高 FDE 计数） |
| 海外 AI 公司 | Databricks | [Greenhouse](https://boards-api.greenhouse.io/v1/boards/databricks/jobs?content=true) | 全量，1 次 | 只计标题带 AI 信号的岗位（数据平台公司） |
| Agent 公司 | Sierra、Decagon、Cohere、LangChain | Ashby（`sierra`、`decagon`、`cohere`、`langchain`） | 各 1 次 | 排除销售等职能后全部 |
| Agent 公司 | Glean | Greenhouse（`gleanwork`） | 1 次 | 同上 |
| 医疗 AI | Abridge、Ambience Healthcare、OpenEvidence、Nabla | Ashby（`abridge`、`ambiencehealthcare`、`openevidence`、`nabla`） | 各 1 次 | 同上 |
| 医疗 AI | Suki、PathAI、Flatiron Health | Greenhouse（`suki`、`pathai`、`flatironhealth`） | 各 1 次 | 同上 |
| 国内 | 腾讯 | [腾讯招聘接口](https://careers.tencent.com/tencentcareer/api/post/Query) | 全量，每页 3000 条 | 只计标题带 AI 信号的岗位 |
| 国内 | 美团 | [美团招聘接口](https://zhaopin.meituan.com/api/official/job/getJobList)（POST，社招） | 全量，每页 1000 条，约 3 页 | 同上 |
| 国内 | 网易 | [网易招聘接口](https://hr.163.com/api/hr163/position/queryPage)（POST） | 全量，每页 200 条（接口上限），约 14 页 | 同上 |
| 国内 | 百度 | [百度实习列表](https://talent.baidu.com/jobs/list?recruitType=INTERN) | 只有列表首页（完整列表接口要登录） | 同上 |

- 2026-10-12：Palantir 原用 [Lever 接口](https://api.lever.co/v0/postings/palantir?mode=json)，约 6 MB 且不压缩，服务器 45 秒只下载到约 1.4 MB，导致首次发布验收失败；改读同一批职位的公开列表页（压缩后约 110 KB，职位 ID 相同）。所有来源遇到连接失败、超时、429 或 5xx 时自动重试一次。
- 只保存岗位标题、链接、地区、部门、发布日期、首次与最近出现日期和职责段里的技能词，不保存职位正文。销售、市场、招聘、财务、法务等职能不计入。
- 岗位按标题归到 13 个职业簇（`site/public/data/rules.js`），作为研究的证据，不改写研究结论；值得追踪的新方向按研究流程写进 `watchlist.md`。海外岗位只作领先信号，不外推中国。
- 2026-10-11 首次读取原 4 个来源 4/4 成功：1652 个职位，相关 1110 个，对上职业簇 351 个。新来源各自以第一次读取成功的时间为基线。
- 依据：[Ashby Job Postings API](https://developers.ashbyhq.com/docs/public-job-posting-api)；[Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html)；[Lever Postings API](https://github.com/lever/postings-api)；OpenAI 官网 [Context Research 岗位](https://openai.com/careers/agent-post-training-context-research-san-francisco/) 的申请入口指向 `jobs.ashbyhq.com/openai/`；[Scale 官网](https://scale.com/careers) 的职位加载代码调用上述 Greenhouse 地址；腾讯、美团、网易接口是各自官网职位列表页调用的公开接口。OpenAI 原搜索页自动请求返回 403，所以改用官方公开接口。
- 测过但不接：字节跳动、阿里巴巴、京东的招聘接口要求登录或带 Cookie 的校验令牌；百度完整列表接口返回未授权；快手接口参数未跑通。北森（如科大讯飞）、Moka、飞书招聘等国内招聘平台上的医疗 AI 公司需要逐家找入口，北森资源服务器在本机连接失败，留作下一步。
- 新增来源先在本页登记，再经良确认后写进白名单。
- 2026-10-11 之前 Codex 版的检查方式（5 项检查、28 个自动方向、代表岗位哈希核验）随网站重写停用，代码与当时的说明保存在项目 Git 提交 `bd2916f`。

## 中国制度与职业标准

| 来源 | 发布日期 | 观察日期 | 地区 | 可支持结论 | 限制 |
|---|---:|---:|---|---|---|
| [人社部：正式发布 19 个新职业](https://www.mohrss.gov.cn/wap/xw/rsxw/202407/t20240731_523281.html) | 2024-07-31 | 2026-08-29 | 中国 | “生成式人工智能系统应用员”是正式新职业 | 官方身份不等于招聘已放量 |
| [人社部：拟新增职业与工种定义附件](https://www.mohrss.gov.cn/wap/zc/zqyj/202405/W020240524589527228268.pdf) | 2024-05-24 | 2026-08-29 | 中国 | 应用员任务定义；人工智能数字人训练师工种 | 公示附件，最终身份另用正式发布页确认 |
| [人社部等：正式发布 17 个新职业、42 个新工种](https://chrm.mohrss.gov.cn/%E4%BA%BA%E5%8A%9B%E8%B5%84%E6%BA%90%E7%A4%BE%E4%BC%9A%E4%BF%9D%E9%9A%9C%E9%83%A8%E3%80%81%E5%9B%BD%E5%AE%B6%E5%B8%82%E5%9C%BA%E7%9B%91%E7%9D%A3%E7%AE%A1%E7%90%86%E6%80%BB%E5%B1%80%E3%80%81%E5%9B%BD-3/) | 2025-07-25 | 2026-08-29 | 中国 | 正式发布批次与制度流程 | 页面正文未逐项展开 42 个工种，需与通知附件交叉核对 |
| [中国人力资源市场网：42 个新工种](https://chrm.mohrss.gov.cn/%E8%81%8C%E4%B8%9A%E4%B8%8A%E6%96%B0%EF%BC%8142%E4%B8%AA%E6%96%B0%E5%B7%A5%E7%A7%8D%E4%BA%AE%E7%9B%B8/) | 2025 | 2026-08-29 | 中国 | 应用员下新增生成式人工智能系统测试员工种 | 介绍性页面，不提供招聘规模 |
| [人工智能训练师国家职业技能标准](https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/rcrs_4225/jnrc/202112/W020211227626977039770.pdf) | 2021 | 2026-08-29 | 中国 | AI 训练师正式任务边界 | 标准较早，不能代表 2026 年细分岗位结构 |
| [人社部新职业在线学习：人工智能训练师](https://xzy.mohrss.gov.cn/lesson/167) | 未标明 | 2026-08-29 | 中国 | 基础训练仍包含多模态数据标注与处理 | 课程说明不是劳动力市场统计 |

## 招聘与劳动力市场数据

| 来源 | 发布日期 | 观察日期 | 地区 | 可支持结论 | 限制 |
|---|---:|---:|---|---|---|
| [LinkedIn AI Labor Market Update](https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/ai-labor-market-update-header-sept-2025.pdf) | 2025-09-05 | 2026-08-29 | 美国 | AI engineering、AI literacy 与 Agent 技能增长；Prompt 向多职能扩散 | 美国 LinkedIn 数据，不能外推中国或杭州 |
| [LinkedIn：2026 AI 招聘研究](https://news.linkedin.com/2026/new-linkedin-research-finds-women-account-for-just-26-percent-of-ai-hires-as-ai-jobs-surge) | 2026-08-18 | 2026-08-29 | 美国职位；24 国会员 | FDE 在其口径下成为常见 AI 职业之一 | 统计口径依赖职位标题与关键词，不等于统一职业分类 |
| [LinkedIn Skills on the Rise 2026](https://news.linkedin.com/2026/Skills-on-the-rise-2026) | 2026-02-24 | 2026-08-29 | 12 个市场 | Prompt、LLM 等是增长技能 | 统计技能，不证明独立“提示词工程师”职业放量 |
| [WEF Future of Jobs 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/) | 2025-01-07 | 2026-08-29 | 全球雇主调查 | AI 同时创造与替代任务，技术与人类技能组合更重要 | 预测与调查，不是已实现招聘 |
| [智联招聘 2026 AI 人才报告聚合预览](https://www.sgpjbg.com/bgdown/1279005.html) | 2026-07 | 2026-08-29 | 中国 | 提供 AI 产品经理、AI 训练师等方向的二级市场线索 | 非智联原始发布页；未找到可公开核验的一手全文，本期不以其精确增速支撑主要结论 |

## AI 技术与组织采用

| 来源 | 发布日期 | 观察日期 | 地区 | 可支持结论 | 限制 |
|---|---:|---:|---|---|---|
| [Stanford AI Index 2026：Economy](https://hai.stanford.edu/ai-index/2026-ai-index-report/economy) | 2026 | 2026-08-29 | 全球综合 | AI 采用上升，但 Agent 部署仍早期；部分组织预期减员 | 多数据源汇总，不给中国细分职业招聘量 |
| [Microsoft Work Trend Index 2026](https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization) | 2026-05-05 | 2026-08-29 | 10 国、Microsoft 365 | 人的任务转向设定目标、评估、监督和承担结果；组织采用需要流程与培训 | 样本不含中国，且部分为自报调查 |

## 企业招聘与任务样本

| 来源 | 页面日期 / 状态 | 观察日期 | 地区 | 可支持结论 | 限制 |
|---|---:|---:|---|---|---|
| [百度：医学标注经理（医疗大模型方向）](https://talent.baidu.com/jobs/detail/SOCIAL/cde9bf36-be36-4c0e-ba1e-bbd58bc4735c) | 2026-07-21 | 2026-08-29 | 北京 | 临床知识用于标准、评测、数据质量与模型优化 | 社招 1 人、要求临床经验，不代表初级需求规模 |
| [百度：AI 医疗产品实习等岗位列表](https://talent.baidu.com/jobs/list?recommendCode=IZBMK9&recruitType=INTERN) | 2026-08-25 起 | 2026-08-29 | 北京等 | AI 医疗产品测试、验收、评测及解决方案实习任务 | 动态列表会变化；用于任务识别，不当作固定岗位承诺 |
| [百度：医疗健康 AI 产品经理实习](https://talent.baidu.com/jobs/detail/INTERN/177e55ca-15a2-44e9-85d6-6dbe1c2928e6) | 2026-07-21 | 2026-08-29 | 北京 | 医疗需求研究、大模型产品规划与数据反馈形成 junior 入口 | 单一雇主样本 |
| [百度：AI 产品经理实习](https://talent.baidu.com/jobs/detail/INTERN/0ad545f8-07df-42f1-9a10-28e79d5dc407) | 2026-07-29 | 2026-08-29 | 北京 | Agent、Workflow、Bad Case、日志与产品闭环 | 单一雇主样本；每周至少 4 天、3 个月 |
| [百度：Agent / Coding Agent 产品实习](https://talent.baidu.com/jobs/detail/INTERN/f8227146-6713-4744-a963-dccebf6ff468) | 2026-07-21 | 2026-08-29 | 北京 | Agent 产品设计、原型、协同落地和复盘 | 偏产品设计，不代表非技术岗位普遍低门槛 |
| [百度：模型与任务效果评估产品实习](https://talent.baidu.com/jobs/detail/INTERN/7b2806f7-5c45-4c94-99bd-49c401ba3790) | 2026-07-21 | 2026-08-29 | 北京 | 标准、标注、模型评估和任务评估闭环 | 单一职位样本 |
| [百度：AI 搜索 / RAG 产品实习](https://talent.baidu.com/jobs/detail/INTERN/62d8d7de-58f6-4bcf-b78f-03649b28de7b) | 2026-07-23 | 2026-08-29 | 北京 | RAG、内容质量、满意度和策略实验任务 | 计算机等专业优先 |
| [百度：AI 应用工程师](https://talent.baidu.com/jobs/detail/SOCIAL/b286456b-922b-4ff3-9da0-0e8855443ba0) | 2026-07-21 | 2026-08-29 | 北京 | Agent、知识库、工作流和业务系统集成 | 强工程岗位，不是良的当前直接入口 |
| [百度：数字人产品运营实习](https://talent.baidu.com/jobs/detail/INTERN/72bb7ebe-4964-420e-be18-486aac47e63e) | 2026-07-21 | 2026-08-29 | 北京 | 数字人文本质量、审核、调研与专家知识库 | 单一岗位；行业低端供给可能同质化 |
| [OpenAI：Forward Deployed Engineer](https://openai.com/careers/forward-deployed-engineer-%28fde%29-seattle-seattle/) | 当前在招 | 2026-08-29 | 美国 | FDE 的发现、设计、构建、上线和评测驱动反馈 | 5 年以上经验、强编码；只作领先信号 |
| [OpenAI：AI Deployment Manager / Enablement](https://openai.com/careers/ai-deployment-manager-builder-san-francisco/) | 当前在招 | 2026-08-29 | 美国 | 企业 AI 培训、采用、工作坊和可复用手册 | 4 年以上、技术培训能力强；非初级样本 |
| [OpenAI：Agentic Risk Analyst](https://openai.com/careers/agentic-risk-analyst-san-francisco/) | 当前在招 | 2026-08-29 | 美国 | Agent 风险组合、弱信号、评测与治理闭环 | 7 年以上经验；不能视作当前入口 |
| [OpenAI：AI Support Engineer, Biosciences](https://openai.com/careers/ai-support-engineer-biosciences-san-francisco-san-francisco/) | 当前在招 | 2026-08-29 | 美国 | AI 支持与生命科学领域知识结合 | 8 年以上技术支持经验 |
| [Google：Clinical Specialist, Health Optimization](https://www.google.com/about/careers/applications/jobs/results/110970752634626758-clinical-specialist-health-optimization?distance=50&q=health) | 当前在招 | 2026-08-29 | 美国 | 临床专家参与 GenAI 设计、评估和多群体性能方法 | 要求临床博士、患者照护与 AI 产品经验 |
| [Scale：Forward Deployed Engineer, GenAI](https://scale.com/careers/4593571005) | 当前在招 | 2026-08-29 | 美国 | 高质量人类数据、模型评估与客户交付结合 | 强编码、端到端开发；只作领先信号 |
| [Anthropic 当前职位列表](https://www.anthropic.com/careers/jobs?hsLang=en-us) | 当前在招 | 2026-08-29 | 美国等 | Model Evals、Human Data、Safeguards、Life Sciences 等任务簇 | 多为技术或资深岗位，不能外推中国初级需求 |
| [OpenAI：Forward Deployed 职位搜索](https://openai.com/careers/search/?q=forward+deployed) | 当前在招 | 2026-08-29 | 美国、亚洲、澳洲、中东 | 当前列出 22 个相关岗位，并细分到医疗、法律、政府、半导体和多个地区 | 单一雇主的职位数，不等于整个市场规模；页面会动态变化 |
| [OpenAI：Healthcare FDE](https://openai.com/careers/forward-deployed-engineer-%28fde%29-healthcare-sf-san-francisco/) | 当前在招 | 2026-08-29 | 美国 | FDE 已向受监管医疗场景细分，覆盖发现、架构、实现、评测、上线和交接 | 要求 6 年以上技术经验；不是应届入口 |
| [Scale：Forward Deployed Engineering 负责人](https://scale.com/careers/4690504005) | 当前在招 | 2026-08-29 | 英国 / 全球客户 | FDE 已形成团队与管理层级，交付对象包括企业级 AI Agent | 管理岗样本只证明组织化，不能代表初级岗位数量 |
| [OpenAI：Agent 职位搜索](https://openai.com/careers/search/?q=agent) | 当前在招 | 2026-08-29 | 美国等 | 当前列出 28 个 Agent 相关岗位，已细分到 post-training、evals、environment、security、product engineering 等 | 单一前沿实验室样本，技术岗位占比高 |
| [OpenAI：Agent Post-Training, Context Research](https://openai.com/careers/agent-post-training-context-research-san-francisco/) | 当前在招 | 2026-08-29 | 美国 | Agent 后训练已拆分为 context、环境、grader、训练信号和产品反馈闭环 | 研究工程门槛极高，只作前沿职业信号 |
| [OpenAI：Early Access Deployment Engineer](https://openai.com/careers/early-access-deployment-engineer-san-francisco/) | 当前在招 | 2026-08-29 | 美国 | alpha 能力试点出现独立交付角色，连接客户实验、评测、发布决策和研究反馈 | 要求 4 年以上软件工程与客户交付经验 |
| [OpenAI：Agent Identity 产品设计](https://openai.com/careers/product-designer-identity-san-francisco/) | 当前在招 | 2026-08-29 | 美国 | 人—Agent 与 Agent—Agent 的身份、授权、确认和信任交互成为明确设计任务 | 当前仍是单一职位样本，应列前沿而非扩散 |
| [OpenAI：AI Success 职位搜索](https://openai.com/careers/search/?q=ai+success) | 当前在招 | 2026-08-29 | 美国等 | AI Success 已细分到教育、政府、医疗与生命科学等领域 | 搜索结果和岗位在动态变化；不能直接外推中国 |
| [百度：AI 产品工程实习生](https://talent.baidu.com/jobs/detail/INTERN/eccb3218-409a-4157-98a6-895b733266cd) | 2026-07-21 | 2026-08-29 | 北京 / 全球化产品 | “产品 + AI Coding + 原型到可用功能”已被直接命名为产品工程岗位，并要求作品链接 | 单一雇主 3 人实习样本，尚不能证明中国已普遍采用同名岗位 |
| [百度：AI Agent 产品实习生](https://talent.baidu.com/jobs/detail/INTERN/d896e43f-94b7-4eb5-93af-d99a24896997) | 2026-07-23 | 2026-08-29 | 北京 | Agent 工作流、模型边界、异常处理和 Vibe Coding 构成明确 junior 产品入口 | 单一雇主样本；要求每周 5 天、连续 6 个月 |
| [百度：Agent 评估工程师实习生](https://talent.baidu.com/jobs/detail/INTERN/a0bbc449-854f-421c-bfaf-1a5be906f86e) | 2026-07-21 | 2026-08-29 | 北京 | 记忆、规划、工具调用、反思、LLM-as-a-judge 与 Agent Benchmark 被组合成独立评估岗位 | 计算机相关专业与 Python 门槛高 |
| [百度：评测产品实习生](https://talent.baidu.com/jobs/detail/INTERN/a7487847-e649-4b60-96cf-faa90f6f8b34) | 2026-07-21 | 2026-08-29 | 北京 | 长程任务标准、内置 Skill、记忆连续性、成本和效果复盘成为 Agent 评测产品任务 | 单一雇主样本；职位页可能动态下线 |
| [百度：当前实习职位列表](https://talent.baidu.com/jobs/list?recruitType=INTERN) | 2026-08-17 至 2026-08-27 | 2026-08-29 | 中国多地 | 新增 DuMate 策略 PM、Agent 开发、AI 测试开发、解决方案架构、Agent 效果评估等近期样本 | 动态列表；只用于识别任务与日期，不把当前条数当长期规模 |
| [美团：Agent 评测产品经理（CatPaw）](https://zhaopin.meituan.com/web/position/detail?jobUnionId=4777203989&highlightType=social) | 2026-09-16 发布，在招 | 2026-10-12 | 北京、上海 | 办公、编程、NoCode 与企业级 Agent 的评测体系：任务分类、评测集、评分标准、离线/人工/自动/线上评测、轨迹级失败归因、A/B 与回归验收 | 3 年以上，其中 1 年以上大模型或 Agent 产品经验 |
| [美团：LongCat 大模型 - Agent 评测产品经理](https://zhaopin.meituan.com/web/position/detail?jobUnionId=4301295312&highlightType=social) | 2026-08-13 发布，在招 | 2026-10-12 | 北京、上海 | 面向 Claude Code、OpenClaw 等框架的长程任务评测、自动化 Rubric 流水线、专家评审资源与评测→归因→策略闭环 | 1 年以上大模型评测或智能体落地经验，欢迎算法、工程转岗 |
| [美团：Agent 评测平台产品经理](https://zhaopin.meituan.com/web/position/detail?jobUnionId=4614990439&highlightType=social) | 2026-07-09 发布，在招 | 2026-10-12 | 北京 | Agent 评测产品化：任务与数据集管理、Rubric、Evaluator 配置、人评机评协同、回归对比 | 3 年以上 |
| [腾讯：WorkBuddy - Agent Harness 策略产品经理](https://careers.tencent.com/jobdesc.html?postId=2098252455568654336) | 2026-09-19 更新，在招 | 2026-10-12 | 深圳 | Agent 策略体系、效果/稳定性/Token 成本取舍、按场景定义评测标准与评测集并实验验证 | 接口不含任职要求 |
| [腾讯：混元 Agent 数据策略分析岗](https://careers.tencent.com/jobdesc.html?postId=2092600086931615744) | 2026-09-20 更新，在招 | 2026-10-12 | 北京等 | Coding Agent 用户日志与执行轨迹分析，定位规划、执行、验证环节的失败机制，产出评测题、失败案例、Rubric 与 Skill 线索 | 分析岗，偏数据；接口不含任职要求 |
| [美团：AI 评测产品经理](https://zhaopin.meituan.com/web/position/detail?jobUnionId=4792416536&highlightType=social) | 2026-10-12 发布，在招 | 2026-10-12 | 上海 | 通用 AI 产品评测集、评分标准与 LLM-as-Judge 自动评测 | 不限于 Agent；3 年以上 |
| [腾讯：腾讯会议 - 评测产品经理](https://careers.tencent.com/jobdesc.html?postId=2041409199149314048) | 2026-10-08 更新，在招 | 2026-10-12 | 深圳 | 语音识别与大模型产品评测体系、业务化 Benchmark 与 badcase 闭环 | 不限于 Agent |
| [腾讯：混元大模型数据策略产品经理 - AI Agent / Coding](https://careers.tencent.com/jobdesc.html?postId=2059832165742592000) | 2026-09-28 更新，在招 | 2026-10-12 | 北京、深圳 | Agent 与金融、医疗等垂类的后训练数据策略，Agent 任务动态评测集与 Sandbox / RL 环境 | 偏数据策略，与 Agent 评估工程重叠 |
| [Cohere：Product Manager, Agent Harness & Modelling](https://jobs.ashbyhq.com/cohere/1d1b300d-254b-48c4-958f-99c6b907f295) | 2026-03-18 发布，在招 | 2026-10-12 | 海外 | 海外最接近「Agent 策略产品」的岗位；海外暂无「Agent 评测产品经理」同名岗位 | 单一样本，职责以 Harness 产品为主 |
