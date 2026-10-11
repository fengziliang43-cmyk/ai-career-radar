import type { DiscoveryJob } from './radar-discovery';

// Representative source reviews on 2026-10-11; exact content hashes prevent future jobs inheriting approval.
export const reviews = [
  {
    url: 'https://jobs.ashbyhq.com/openai/4f0d64b8-bfa7-4c30-9972-a10d74b49075',
    title: 'Software Engineer, Life Sciences',
    employer: 'OpenAI',
    publishedAt: '2026-10-06T23:58:11.643+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '为科学家搭建模型、科研工具和实验室服务的全栈产品；强调后端、系统设计和成熟工程交付。原文明确生命科学背景有帮助，但不是必须，医学学历不能替代工程能力。',
    taskVerified: true,
    contentHash:
      'f3031db118f16e20cc41d947a8c2d178a9ee1cfac952f4dd70426f8d2a18acc2',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5439391008',
    title: 'Technical Program Manager, Life Sciences',
    employer: 'Anthropic',
    publishedAt: '2026-10-01T22:19:03-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '负责生命科学认证访问计划 LSVP 的跨团队扩展、依赖协调与安全执行。原文明确这是跨组织执行岗位，而非科研岗，也不直接定义安全政策。',
    taskVerified: true,
    contentHash:
      'f7aeff78f5331622638706d5f290a2097df8df73efd7d628e72a8cfbc2339a22',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4591782005',
    title: 'Medical Fellow - Human Frontier Collective (US)',
    employer: 'Scale AI',
    publishedAt: '2025-07-30T15:15:34-04:00',
    location: 'United States',
    reviewedAt: '2026-10-11',
    finding:
      '设计临床情景、评估模型决策安全与准确性、用结构化反馈塑造推理。明确要求 MD/DO 医学学位与专科认证；不是临床本科生的直接应聘入口。',
    taskVerified: true,
    contentHash:
      'aa6a8c5e069dfa7cae1b6a57e86f4c0c6c424b2e1cda209a22daed132e479ece',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/56d541d3-02b5-44d8-b40b-4df72cdd0405',
    title: 'Software Engineer, AI for Chip Design',
    employer: 'OpenAI',
    publishedAt: '2026-09-08T23:43:33.720+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '产品经理、设计、运营确有招聘，但工程师和法律岗位不应仅因标题含 Product/Design 而归入产品职业。产品岗位属于既有职业在 AI 场景的扩展。',
    taskVerified: true,
    contentHash:
      '7ed06f802872b3ae2620f27d86ac40191c4da46df915f67f1986f6da70c5828f',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5368034008',
    title: 'Staff+ Software Engineer, Enterprise AI Products',
    employer: 'Anthropic',
    publishedAt: '2026-07-22T17:36:02-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '产品经理、设计、运营确有招聘，但工程师和法律岗位不应仅因标题含 Product/Design 而归入产品职业。产品岗位属于既有职业在 AI 场景的扩展。',
    taskVerified: true,
    contentHash:
      'f49b568af4e960e7d2a361fb1846378569d88ac383f21acdb766a2e6ff8de5d1',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4675842005',
    title: 'Staff Product Manager, Gen AI',
    employer: 'Scale AI',
    publishedAt: '2026-03-23T10:54:30-04:00',
    location: 'New York, NY; San Francisco, CA',
    reviewedAt: '2026-10-11',
    finding:
      '产品经理、设计、运营确有招聘，但工程师和法律岗位不应仅因标题含 Product/Design 而归入产品职业。产品岗位属于既有职业在 AI 场景的扩展。',
    taskVerified: true,
    contentHash:
      'c756d49feea6a570b9478d9ba0fe3898a472b2c06a194ba5217829dd0910346a',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/2aae72af-8c35-42bc-86f6-9d5634391245',
    title: 'Manager, Applied AI Architect (India)',
    employer: 'OpenAI',
    publishedAt: '2026-10-01T09:36:38.184+00:00',
    location: 'Bangalore - Remote',
    reviewedAt: '2026-10-11',
    finding:
      '职责包含客户架构、系统集成或内部 AI 工作流开发；技术售前、管理者与开发者不是同一职业。出现招聘不能证明需求增速。',
    taskVerified: true,
    contentHash:
      '2a260924a1e618535a08216af914d8a0d271ed8cb56ba3266e51d4c554768228',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5390966008',
    title: 'Staff Software Engineer, GTM AI Engineering ',
    employer: 'Anthropic',
    publishedAt: '2026-08-25T18:59:04-04:00',
    location:
      'Remote-Friendly (Travel-Required) | San Francisco, CA | Seattle, WA',
    reviewedAt: '2026-10-11',
    finding:
      '职责包含客户架构、系统集成或内部 AI 工作流开发；技术售前、管理者与开发者不是同一职业。出现招聘不能证明需求增速。',
    taskVerified: true,
    contentHash:
      '0aaecf265a69f6ba9d5e685faf9a16fe21eb0d30d395a4b447540e4a45a49c46',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4720050005',
    title: 'Staff Applied AI Engineer',
    employer: 'Scale AI',
    publishedAt: '2026-07-30T17:32:20-04:00',
    location: 'London, UK',
    reviewedAt: '2026-10-11',
    finding:
      '职责包含客户架构、系统集成或内部 AI 工作流开发；技术售前、管理者与开发者不是同一职业。出现招聘不能证明需求增速。',
    taskVerified: true,
    contentHash:
      '95d0a418ebda532e1d132b54f5aa73d063540538222dfb75dc35ced9fbdf38cf',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/a23a49a6-0c20-4cb3-8ffd-4881f5914474',
    title: 'Deployment Lead, FDE - SF',
    employer: 'OpenAI',
    publishedAt: '2026-10-06T23:20:38.239+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '三家雇主均有客户现场的 AI 系统交付任务；工程实现和 Deployment Lead 的项目协调须区分。跨雇主任务证据成立，但本次没有时间序列证明职业新增或增长。',
    taskVerified: true,
    contentHash:
      '71ab7ad93864a85e65dc7e4df334b97ff0a4f004170954df30e3d74901109e10',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5017903008',
    title: 'Technical Deployment Lead',
    employer: 'Anthropic',
    publishedAt: '2025-12-04T10:12:44-05:00',
    location:
      'Austin, TX; Boston, MA; New York City, NY; San Francisco, CA; Seattle, WA',
    reviewedAt: '2026-10-11',
    finding:
      '三家雇主均有客户现场的 AI 系统交付任务；工程实现和 Deployment Lead 的项目协调须区分。跨雇主任务证据成立，但本次没有时间序列证明职业新增或增长。',
    taskVerified: true,
    contentHash:
      '1c69b6f01c6db368122befad3fbd52f8c75cd8b4acf7186d13b97e8e434c50ee',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4673314005',
    title: 'Staff FullStack Software Engineer, (Forward Deployed), GPS',
    employer: 'Scale AI',
    publishedAt: '2026-03-24T16:37:59-04:00',
    location: 'Doha, Qatar ',
    reviewedAt: '2026-10-11',
    finding:
      '三家雇主均有客户现场的 AI 系统交付任务；工程实现和 Deployment Lead 的项目协调须区分。跨雇主任务证据成立，但本次没有时间序列证明职业新增或增长。',
    taskVerified: true,
    contentHash:
      '242f8baf6c58acf6444cbbace003827842d35e1f894cb3a2029f28b964b4a25c',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/d4983a0f-1004-4f27-94b3-e1a38c168c1a',
    title: 'Researcher, Alignment Interpretability',
    employer: 'OpenAI',
    publishedAt: '2026-09-01T22:01:38.925+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '可解释性研究、生产安全基础设施、法律合规运营均真实存在，但方法与门槛不同，不能统一称为安全研究员。',
    taskVerified: true,
    contentHash:
      'a4f6bcd3aac4a23b0138793ec38ff34fa6fa9c4162a8b87d739bc7a44baa8b53',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5108695008',
    title: 'Technical Program Manager, Safeguards (Infrastructure & Evals)',
    employer: 'Anthropic',
    publishedAt: '2026-02-04T15:47:16-05:00',
    location: 'San Francisco, CA | New York City, NY | Seattle, WA',
    reviewedAt: '2026-10-11',
    finding:
      '可解释性研究、生产安全基础设施、法律合规运营均真实存在，但方法与门槛不同，不能统一称为安全研究员。',
    taskVerified: true,
    contentHash:
      '4ac188578d7c87fdef7d18ec744df6c6e302e01757f6b8a40d1b16481638b6be',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4730306005',
    title: 'GenAI Compliance Operations & Programs Associate ',
    employer: 'Scale AI',
    publishedAt: '2026-09-03T17:16:27-04:00',
    location: 'Mexico City, MX',
    reviewedAt: '2026-10-11',
    finding:
      '可解释性研究、生产安全基础设施、法律合规运营均真实存在，但方法与门槛不同，不能统一称为安全研究员。',
    taskVerified: true,
    contentHash:
      'd41ea4507104bb3c51b05d04070b6bc4f390ba698ef619fd28dc4ff02221a50e',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/3302ceaf-f6ca-4803-9846-7fff7ad48a0d',
    title: 'Agent Post-Training, Personality',
    employer: 'OpenAI',
    publishedAt: '2026-06-26T17:42:19.579+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '已看到模型行为优化、RL 研究项目管理、可验证奖励环境工程三种任务。后训练方向真实；并非每个岗位都是算法研究。',
    taskVerified: true,
    contentHash:
      'c7bc6c382dfdf4fb16f310f6e6662228fc18531fdd82d6155046de945d686210',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5380327008',
    title: 'Technical Program Manager, RL Research',
    employer: 'Anthropic',
    publishedAt: '2026-08-05T17:06:57-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '已看到模型行为优化、RL 研究项目管理、可验证奖励环境工程三种任务。后训练方向真实；并非每个岗位都是算法研究。',
    taskVerified: true,
    contentHash:
      '069db56010e2ca3df3b1601ed4d2b094070ce360db4f2277d246da3117f053a2',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4729820005',
    title: 'Staff Software Engineer, RL Environments  ',
    employer: 'Scale AI',
    publishedAt: '2026-09-02T11:06:21-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      '已看到模型行为优化、RL 研究项目管理、可验证奖励环境工程三种任务。后训练方向真实；并非每个岗位都是算法研究。',
    taskVerified: true,
    contentHash:
      'f5801285b787ea053f7353efada1ac40f74068a737cac24bfee7bb3af5667f34',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/80f0deef-7c66-4545-91eb-f43a1481f997',
    title: 'Agent Standards Architect, Global Affairs',
    employer: 'OpenAI',
    publishedAt: '2026-09-04T17:49:13.391+00:00',
    location: 'Washington, DC',
    reviewedAt: '2026-10-11',
    finding:
      'Agent 运行环境、应用开发有明确任务；Agent Standards Architect 做身份授权和外部标准，已移到安全与监督方向。',
    taskVerified: true,
    contentHash:
      '4edd398cea7c346e51321a04394f9b0aefcf6d5d012206fa8c58e54af508b786',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5316593008',
    title: 'Tech Lead Manager, Agent Runtime Platform',
    employer: 'Anthropic',
    publishedAt: '2026-07-09T13:28:21-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      'Agent 运行环境、应用开发有明确任务；Agent Standards Architect 做身份授权和外部标准，已移到安全与监督方向。',
    taskVerified: true,
    contentHash:
      '98c9858957ca4ea35e9b961d6e66670f6bdd30300de6cc63c0abc89cda2d5be2',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4720487005',
    title: 'Staff Frontier Agents Engineer (Applied AI)',
    employer: 'Scale AI',
    publishedAt: '2026-07-31T19:28:42-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      'Agent 运行环境、应用开发有明确任务；Agent Standards Architect 做身份授权和外部标准，已移到安全与监督方向。',
    taskVerified: true,
    contentHash:
      'cf6ae93776959961ba9882b39263e67911e9b01b038c32c331dc7d8fd12f2870',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/b2250643-bfd0-4ce6-abbf-cb7e8c8123ba',
    title: 'AI Infrastructure Engineer, pAGI',
    employer: 'OpenAI',
    publishedAt: '2026-09-14T18:47:19.139+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '训练评测基础设施、模型采样路径和 ML 平台均有明确系统工程职责；成熟工程能力仍是核心，不属于零基础入门岗位。',
    taskVerified: true,
    contentHash:
      '304d997d080629ababe8efa0e9e012a00ed5c48ed31a6d19762922caea3712ed',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5419868008',
    title: 'Staff+ Software Engineer, ML Sampling Path',
    employer: 'Anthropic',
    publishedAt: '2026-09-09T15:17:24-04:00',
    location: 'San Francisco, CA',
    reviewedAt: '2026-10-11',
    finding:
      '训练评测基础设施、模型采样路径和 ML 平台均有明确系统工程职责；成熟工程能力仍是核心，不属于零基础入门岗位。',
    taskVerified: true,
    contentHash:
      '425d60a6f987511a5a4cc9bc982d534a7204b123c38e2250f98b9b4df9575295',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4618046005',
    title: 'Tech Lead Manager- MLRE, ML Systems',
    employer: 'Scale AI',
    publishedAt: '2025-10-10T14:00:40-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      '训练评测基础设施、模型采样路径和 ML 平台均有明确系统工程职责；成熟工程能力仍是核心，不属于零基础入门岗位。',
    taskVerified: true,
    contentHash:
      '75c36bb82c2579b0222bc233c853971aae7b59838d36e7d0c7c236db76a0edba',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/9d4d2727-27f3-4a63-857c-a96466130645',
    title: 'Machine Learning Engineer, Core Experimentation',
    employer: 'OpenAI',
    publishedAt: '2026-09-24T20:40:14.837+00:00',
    location: 'Seattle',
    reviewedAt: '2026-10-11',
    finding:
      '实验系统、反滥用模型、应用 ML 研究属于已有机器学习职业的不同场景；不能据 AI 公司招聘认定新职业。',
    taskVerified: true,
    contentHash:
      'cbf63a1160e5aa025551ff76f1f3f52e90cb4bc6f2d3cfb15e5e6573fbe76f63',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5436293008',
    title: 'Staff+ Software Engineer, Account Abuse (Machine Learning)',
    employer: 'Anthropic',
    publishedAt: '2026-09-28T16:31:13-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '实验系统、反滥用模型、应用 ML 研究属于已有机器学习职业的不同场景；不能据 AI 公司招聘认定新职业。',
    taskVerified: true,
    contentHash:
      '1862899208bbd8f93318f4745a5c3092069641789fcadeca3bd947334e79be6f',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4714527005',
    title:
      'Staff/Senior Machine Learning Research Engineer, Intelligent Systems',
    employer: 'Scale AI',
    publishedAt: '2026-07-14T16:14:32-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      '实验系统、反滥用模型、应用 ML 研究属于已有机器学习职业的不同场景；不能据 AI 公司招聘认定新职业。',
    taskVerified: true,
    contentHash:
      '3ec9afb6470f95da490c1978796338667f02b54a03dd673fd62de6dda2fc5c51',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/bce2bcbd-01e6-4afc-9109-d325483aa47e',
    title: 'Product Design Lead, Growth - Codex',
    employer: 'OpenAI',
    publishedAt: '2026-08-18T19:20:37.481+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      'Agent 产品与运营任务真实，但产品战略、设计管理和生态活动是不同岗位。百度生态实习本科在读可申请，仍要求作品、到岗与实习时长。',
    taskVerified: true,
    contentHash:
      '06991e939dd5d79f443e9cf7d60b7c5ad984143c991a132da08174bafd6ea279',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4612403005',
    title: 'Staff Product Manager, Agentic Platform',
    employer: 'Scale AI',
    publishedAt: '2025-10-14T15:48:32-04:00',
    location: 'New York, NY; San Francisco, CA; Washington, DC',
    reviewedAt: '2026-10-11',
    finding:
      'Agent 产品与运营任务真实，但产品战略、设计管理和生态活动是不同岗位。百度生态实习本科在读可申请，仍要求作品、到岗与实习时长。',
    taskVerified: true,
    contentHash:
      '3b5ef7d0bc41a4c94a9910150c008c6e60fde525ca75d802dc2bd2090b986f41',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/34c2ed3f-840f-4a68-9a00-0a0606660abf',
    title: 'Agent Post-Training, Computer Use Research',
    employer: 'OpenAI',
    publishedAt: '2026-06-26T17:42:39.603+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      'Computer Use 操作电脑、多 Agent 训练和 Agent 安全监督原来混在一起，已拆分。电脑操作模型的训练与产品工程任务有原文依据。',
    taskVerified: true,
    contentHash:
      'f79554dfd83ab1122fa561e8d660cfdd3da17a1db29b565e8f730293e6de60d0',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/4017544008',
    title: 'Staff+ Research Scientist, Multi-Agent',
    employer: 'Anthropic',
    publishedAt: '2024-04-22T12:52:37-04:00',
    location: 'San Francisco, CA | New York City, NY | Seattle, WA',
    reviewedAt: '2026-10-11',
    finding:
      'Computer Use 操作电脑、多 Agent 训练和 Agent 安全监督原来混在一起，已拆分。电脑操作模型的训练与产品工程任务有原文依据。',
    taskVerified: true,
    contentHash:
      '11f3abec1d25b858accea0b05beeb70dbb714ab07425db5a400452cffe30b434',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4625271005',
    title: 'Engineering Manager, Agent Oversight',
    employer: 'Scale AI',
    publishedAt: '2025-10-31T12:14:14-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      'Computer Use 操作电脑、多 Agent 训练和 Agent 安全监督原来混在一起，已拆分。电脑操作模型的训练与产品工程任务有原文依据。',
    taskVerified: true,
    contentHash:
      '77a649ff94b638411b5e670d33f693055d3eb0abb110983a399d8ab69893f60b',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/d8794980-1d3f-4d82-8b48-811449b6c492',
    title: 'Training: ML Framework Engineer',
    employer: 'OpenAI',
    publishedAt: '2025-10-29T02:18:26.437+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '模型架构、优化器和训练吞吐任务真实。百度生成式排序面向推荐广告，要求相关专业在读硕博，不能当医学本科直接入口。',
    taskVerified: true,
    contentHash:
      '270a5c464ed3947ca7e2cb1b10c3f57b0f5ac029e9d0dd7ebdf4374727707669',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/4616971008',
    title: 'Research Engineer/Research Scientist, Pre-training',
    employer: 'Anthropic',
    publishedAt: '2025-07-18T17:26:41-04:00',
    location:
      'Remote-Friendly (Travel-Required) | San Francisco, CA | Seattle, WA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '模型架构、优化器和训练吞吐任务真实。百度生成式排序面向推荐广告，要求相关专业在读硕博，不能当医学本科直接入口。',
    taskVerified: true,
    contentHash:
      'fd3e387fb541074b6e072916f04e63b218d51a1fd48e69165f19daeb5a5a3563',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/7322d344-9325-4a92-8445-0a2c4e9272f8',
    title: 'Research Engineer, Retrieval & Search, Applied Engineering',
    employer: 'OpenAI',
    publishedAt: '2024-03-20T21:33:20.763+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      'Anthropic 网络安全评测与 Scale 模型失败诊断确有评测职责。Retrieval 因词内含 eval 被误判，已修正为检索。',
    taskVerified: true,
    contentHash:
      '7e8e776ed8a9219c44dad01322854d42987c9a64572a41aae3c90218b53fa3e1',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5406367008',
    title: 'Cyber Evaluations Engineer',
    employer: 'Anthropic',
    publishedAt: '2026-09-01T17:26:36-04:00',
    location:
      'Remote-Friendly, United States; San Francisco, CA | Washington, DC',
    reviewedAt: '2026-10-11',
    finding:
      'Anthropic 网络安全评测与 Scale 模型失败诊断确有评测职责。Retrieval 因词内含 eval 被误判，已修正为检索。',
    taskVerified: true,
    contentHash:
      '76c18526686e17c9a82e3a93abc45de1adb73dd4dc00d8f2774f3820283a8560',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4728014005',
    title: 'Machine Learning Research Scientist, Evaluations',
    employer: 'Scale AI',
    publishedAt: '2026-08-26T14:51:42-04:00',
    location: 'San Francisco, CA; Seattle, WA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      'Anthropic 网络安全评测与 Scale 模型失败诊断确有评测职责。Retrieval 因词内含 eval 被误判，已修正为检索。',
    taskVerified: true,
    contentHash:
      '9df24df01c944c9f1aa20998b73533b9fde0bad9c8d44257acfc6d2227f20fc8',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/9d48e2e6-41a9-4a90-8b3b-6cc960e95c2f',
    title: 'Software Engineer, Productivity - Inference Runtime',
    employer: 'OpenAI',
    publishedAt: '2026-05-10T17:33:59.627+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '推理部署门禁和云平台发布协调均真实，但工程和 TPM 是不同职业；需按具体岗位看性能、系统和项目经验。',
    taskVerified: true,
    contentHash:
      'c3b8dcb9a996ce4be1902077ea7743e19ef1f3b98c9eaea5bffd6b66bdf241ce',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5201264008',
    title: 'Technical Program Manager, Cloud Inference',
    employer: 'Anthropic',
    publishedAt: '2026-04-28T05:26:08-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '推理部署门禁和云平台发布协调均真实，但工程和 TPM 是不同职业；需按具体岗位看性能、系统和项目经验。',
    taskVerified: true,
    contentHash:
      'bfd181ca3e99f8dc6998d2d0d1dde5c905206027f09ff9c2ddfad2173a08b19d',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/9248eab6-74e0-4940-98eb-ca09b17da532',
    title: 'Software Engineer, AI accelerator Runtime',
    employer: 'OpenAI',
    publishedAt: '2026-08-24T18:51:59.391+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '加速器运行时、TPU 内核涉及底层优化与硬件软件接口；芯片设计 AI 工程已归入此方向，不能归作产品设计。',
    taskVerified: true,
    contentHash:
      'dc8757d2bf995d28d8af4968f3731b2c6584fa3d8abcde2f4ecd2bbc3552ea0e',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/4720576008',
    title: 'TPU Kernel Engineer',
    employer: 'Anthropic',
    publishedAt: '2025-05-22T16:19:35-04:00',
    location: 'San Francisco, CA | New York City, NY | Seattle, WA',
    reviewedAt: '2026-10-11',
    finding:
      '加速器运行时、TPU 内核涉及底层优化与硬件软件接口；芯片设计 AI 工程已归入此方向，不能归作产品设计。',
    taskVerified: true,
    contentHash:
      '0401ae230c7690c91b6a6ef4e26bd0fc89f4cb613f4ef19d532d7d63bf33cfe4',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5101173008',
    title: 'Staff Software Engineer, AI Reliability Engineering',
    employer: 'Anthropic',
    publishedAt: '2026-02-03T06:29:41-05:00',
    location: 'London, UK',
    reviewedAt: '2026-10-11',
    finding:
      'Anthropic AIRE 负责关键服务路径和事故可靠性；Scale Gen AI Operations Planning 负责需求预测和产能计划，二者不能作为同一职业的跨雇主证明。',
    taskVerified: true,
    contentHash:
      '7ee24fe0909ed0c7dfde334209ba2812d3051422e9e2b99299a5380803de7988',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4693449005',
    title: 'Technical Program Manager, Gen AI Operations Planning',
    employer: 'Scale AI',
    publishedAt: '2026-05-08T18:40:37-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      'Anthropic AIRE 负责关键服务路径和事故可靠性；Scale Gen AI Operations Planning 负责需求预测和产能计划，二者不能作为同一职业的跨雇主证明。',
    taskVerified: true,
    contentHash:
      '06afd86c1520d93654edbc1e85055f182c0c21cc37174da91dfdc4db0d9c9772',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/e1cc86e5-b56c-49c0-a4a6-8cf766c27281',
    title: 'Researcher, Agent Safety, Training and Evaluations',
    employer: 'OpenAI',
    publishedAt: '2026-09-03T16:33:13.278+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      'OpenAI 训练与评估不安全 Agent 行为；Scale 构建高风险能力测试、评测框架和数据集。任务证据成立；研究工程能力仍是进入门槛。',
    taskVerified: true,
    contentHash:
      '84f4fb1320afab48a3d9c0429160c86869ba0ca7cc75f3ea0cdc19a99d8ff593',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4677657005',
    title: 'Research Scientist, Frontier Risk Evaluations',
    employer: 'Scale AI',
    publishedAt: '2026-03-25T17:15:14-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      'OpenAI 训练与评估不安全 Agent 行为；Scale 构建高风险能力测试、评测框架和数据集。任务证据成立；研究工程能力仍是进入门槛。',
    taskVerified: true,
    contentHash:
      '493c8ef4f99e9f260c17a7ca44a013a47a5c5095e55b7717c85d8f333988b4d9',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/bfd83255-8491-4c92-be4d-04dd0911cbe6',
    title: 'AI Support Engineer - Singapore (Weekend Shift)',
    employer: 'OpenAI',
    publishedAt: '2026-09-29T17:15:01.186+00:00',
    location: 'Singapore',
    reviewedAt: '2026-10-11',
    finding:
      '原文任务为工单、客户技术故障与产品反馈；属于技术支持的 AI 场景扩展，多个地点和轮班不是多种职业。',
    taskVerified: true,
    contentHash:
      '71a5b12493efc9f2ebb54efa821dd0db3d0686bef28978ab8e167494de225a7c',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/0e76e8eb-cd22-43c8-a9d0-cc35a3b9cb08',
    title: 'IT Audiovisual Operations Engineer',
    employer: 'OpenAI',
    publishedAt: '2026-09-22T20:32:07.670+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '图像、语音等模型产品方向真实；会议室音视频设备运维并非 AI 多模态，已移除。Android、后端、研究和政策岗位不能视为同一种职业。',
    taskVerified: true,
    contentHash:
      'c344f1d870b895fe5803da9ba91395e6a43f32ad86339324a194b0f9dbd55bb8',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5289450008',
    title: 'Staff+ Software Engineer, Enterprise Knowledge Work',
    employer: 'Anthropic',
    publishedAt: '2026-07-02T12:03:44-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '知识检索与企业知识工作是不同任务。公司通用介绍里的 interpretability 不构成这些岗位的知识要求，已修正抽取。',
    taskVerified: true,
    contentHash:
      '6baba7cbf81a8e3def62d4b2c593cc39c4a6924feda60a28130e145a22c5640e',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5432000008',
    title: 'Commercial Legal Specialist, Technical AI Implementation',
    employer: 'Anthropic',
    publishedAt: '2026-09-22T20:23:09-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '合同审阅、红线修改与法律系统集成的 AI 实施岗位；属于法律运营技术扩展，仅一家雇主，不足以确认独立新职业。',
    taskVerified: true,
    contentHash:
      '69458a5edee5d3229c7a94b77aeae522b2045206326aae4d1a2a945bfaa8682a',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4599700005',
    title: 'Senior Infrastructure Software Engineer, Enterprise AI',
    employer: 'Scale AI',
    publishedAt: '2025-08-20T19:23:26-04:00',
    location: 'New York, NY; San Francisco, CA',
    reviewedAt: '2026-10-11',
    finding:
      '多云部署与 Agent 工作流基础设施，已归并到 AI 基础设施，避免单独放大职业数量。',
    taskVerified: true,
    contentHash:
      '1fe4f4bd4a1d3ffcb55d92043d02aaff924e31b27fedc49358844e577a913145',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5407938008',
    title: 'Partnership Manager, AI for Science',
    employer: 'Anthropic',
    publishedAt: '2026-08-28T14:30:30-04:00',
    location: 'San Francisco, CA | New York City, NY',
    reviewedAt: '2026-10-11',
    finding:
      '管理科学实验室合作与 AI for Science 项目，属于科学合作拓展；仅单雇主信号，不能证明独立职业形成。',
    taskVerified: true,
    contentHash:
      '0b574a20c94e4af80fac1fd1392d210dcfe98e7d8d32e56c69fb0d97c1b43c8a',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4675694005',
    title: 'Research Scientist, AI Controls and Monitoring',
    employer: 'Scale AI',
    publishedAt: '2026-03-20T14:48:59-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      '研究运行监控、分层控制和风险干预，已归并到 Agent 安全监督；研究能力要求不能被标题掩盖。',
    taskVerified: true,
    contentHash:
      '89498259f534a37d1f7aab3968a64d754421adec980cd6517b957caf148afe3e',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/7613aca3-9dd8-41cd-b114-06ef4de967a9',
    title: 'Software Engineer, Cooperative AI',
    employer: 'OpenAI',
    publishedAt: '2026-10-05T23:10:27.181+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '原文为平台功能、系统集成与端到端开发，不能仅凭 Cooperative AI 推断多 Agent 研究，已归并应用工程。',
    taskVerified: true,
    contentHash:
      'ea754e17acef29dfd517c6aa46c4092611f2f14b7b6e5bb7651643f0f723149a',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4513943005',
    title: 'Software Engineer, Enterprise AI',
    employer: 'Scale AI',
    publishedAt: '2025-01-07T14:37:44-05:00',
    location: 'New York, NY; San Francisco, CA',
    reviewedAt: '2026-10-11',
    finding:
      '前后端、LLM、可靠性与产品生命周期；要求毕业后全职工程经验 4 年以上，已归并应用工程。',
    taskVerified: true,
    contentHash:
      'ff5f0e9b8e60624bbf75537174b4b1ac8c01afa40429ceecb20f6fc6d7b680f6',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4713608005',
    title: 'Staff Software Engineer, Full Stack - Gen AI ',
    employer: 'Scale AI',
    publishedAt: '2026-07-09T14:54:54-04:00',
    location: 'New York, NY; San Francisco, CA; Seattle, WA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      '跨项目技术负责人、架构和 ML 系统工程；要求毕业后工程经验 7 年以上，已归并应用工程。',
    taskVerified: true,
    contentHash:
      'fa5a46de979732700253420131b5d351cde76ec569393b4e4bc06c390766fada',
  },
  {
    url: 'https://job-boards.greenhouse.io/scaleai/jobs/4282118005',
    title: 'Strategic Projects Lead, Generative AI',
    employer: 'Scale AI',
    publishedAt: '2023-06-13T18:12:59-04:00',
    location: 'San Francisco, CA; New York, NY',
    reviewedAt: '2026-10-11',
    finding:
      '跨团队项目交付、数据标注运营和客户业务；既有项目管理职业在生成式 AI 的扩展，不可凭岗位名认定新职业。',
    taskVerified: true,
    contentHash:
      'a14839372ca3b4c5c1c0cbbb02e063b1f3ed1f2a0ac89dd7d59f61363f41c29f',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/db993e24-ce4f-4f55-9187-403726bcb957',
    title: 'Technical Program Manager, Cloud AI Partnerships',
    employer: 'OpenAI',
    publishedAt: '2026-08-17T22:40:59.308+00:00',
    location: 'San Francisco',
    reviewedAt: '2026-10-11',
    finding:
      '负责云合作伙伴部署、联合技术路线图、发布就绪和跨团队执行；原文要求技术项目管理领导经验、云架构与模型服务理解，属于技术项目管理的 AI 场景扩展。',
    taskVerified: true,
    contentHash:
      'f81638b40fdeb8c67bfbd9fb48c618def2dc7e5b382e35180463ecc5b975c9de',
  },
  {
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5149802008',
    title: 'Transformative AI Research Economist, Economic Research ',
    employer: 'Anthropic',
    publishedAt: '2026-03-11T13:46:00-04:00',
    location: 'San Francisco, CA',
    reviewedAt: '2026-10-11',
    finding:
      '宏观模型、结构估计、情景预测和 Economic Index 数据研究；是经济学研究的新议题，目前只有单雇主样本。',
    taskVerified: true,
    contentHash:
      '4dbe0461982dbd4fd0dea2fff7364389cb3a09873aa087c5de9313e6c0cb71e5',
  },
  {
    url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    id: 'a5d745dd-b2e4-4eff-b10d-23d6e94d302d',
    title: '百度健康AI产品实习生（J106396）',
    employer: '百度',
    reviewedAt: '2026-10-11',
    taskVerified: true,
    finding:
      '需求分析、PRD、Demo 验证和增长分析。明确本科及以上，每周至少 4 天、至少 3 个月；AI 工具深度使用和产品作品有利。医学专业不能替代产品能力。',
    contentHash:
      '59606028d962157fb1d144c81cd1eac4962175f137a7556966fe5d363ef990f0',
  },
  {
    url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    id: 'ef7bf24d-667d-4bec-bdfc-a7cae4dd7bb8',
    title: 'DuMate生态运营实习生（J106312）',
    employer: '百度',
    reviewedAt: '2026-10-11',
    taskVerified: true,
    finding:
      '开发者合作、活动执行和行业调研。本科在读、专业不限；2027 届及以后优先，每周 5 天、至少 4 个月；AI coding 和作品优先。',
    contentHash:
      'c05e6e5fa6f4473b3dbe23711f5e7416b3a668764d2c3cd1c330c556c0759306',
  },
  {
    url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    id: '7de69a33-1575-4b4b-9aa6-86750b3939fc',
    title: '生成式排序模型算法工程师（J106392）',
    employer: '百度',
    reviewedAt: '2026-10-11',
    taskVerified: true,
    finding:
      '推荐广告排序、多模态表征和训练推理实验；要求 2027/2028 届相关专业硕博、Python 与 PyTorch/TensorFlow。医学本科不能按直接入口排序。',
    contentHash:
      '33288b487d85861eb7fab5a917faa5ecafb0c06e5dffb9fb7116506f3b9a0805',
  },
  {
    url: 'https://talent.baidu.com/jobs/list?recruitType=INTERN',
    id: 'bd0f07c8-9087-4499-bc3b-1a57c15aa0cc',
    title: 'AI产品经理实习生（J106390）',
    employer: '百度',
    reviewedAt: '2026-10-11',
    taskVerified: true,
    finding:
      '市场用户调研、需求迭代、项目管理和模型效果分析；期望实习半年，理科相关专业优先，AI 产品经验加分。',
    contentHash:
      '1bb3c42928f87aecab52188211d5c67033853a2765e48670cbbfe269260d30dd',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/4d6a5951-9838-434c-830a-22cb938ea228',
    title: 'Software Engineer, Research - Human Data',
    employer: 'OpenAI',
    location: 'San Francisco',
    publishedAt: '2026-01-23T01:32:42.860+00:00',
    reviewedAt: '2026-10-11',
    contentHash:
      '8f69395b81c71e209be9615498670dd706c2c7261a83b8a15f2ab58d02edc082',
    taskVerified: true,
    finding:
      '构建人类反馈、标注和研究数据工具；属于训练数据工程任务，不能把所有 Data Engineer 都计入此类。',
  },
  {
    url: 'https://jobs.ashbyhq.com/openai/1d7f4747-54a3-4141-a39a-c6e7700e969b',
    title: 'Engineering Manager, Multimodal (API)',
    employer: 'OpenAI',
    location: 'San Francisco',
    publishedAt: '2026-04-20T16:22:08.024+00:00',
    reviewedAt: '2026-10-11',
    contentHash:
      '59e68951ccfc549c46dbe52150b08981d74dcd018a5669f778564c281cfa2cf9',
    taskVerified: true,
    finding:
      '管理多模态 API 产品工程、团队交付与模型能力接入；属于工程管理，不等于多模态算法研究员。',
  },
];

export function reviewFor(job: DiscoveryJob) {
  if (job.stale || !job.contentHash) return undefined;
  return reviews.find(
    (review) =>
      review.url === job.url &&
      (!('id' in review) || review.id === job.id) &&
      review.title === job.title &&
      review.contentHash === job.contentHash,
  );
}
