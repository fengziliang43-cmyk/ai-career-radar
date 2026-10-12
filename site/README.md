# AI 新职业雷达 · 网站

一页三块：「最近 7 天」→「13 个职业簇」→「职业簇之外的 AI 岗位」。职业簇的研究判断是主体，固定招聘来源的在招岗位挂在各簇下面当证据，并且每天记一笔历史。规则见项目 [`AGENTS.md`](../AGENTS.md)。

## 运行

只需要 Node 22 或更新版本，没有依赖、没有构建步骤。

```sh
node server.mjs                 # http://127.0.0.1:3001/ ，哨塔也用这条命令启停
node server.mjs --refresh-once  # 只刷新一次职位数据后退出
node --test                     # 全部测试
```

参数：`--host`（只允许回环地址）、`--port`、`--origin`（允许发起刷新的页面地址，可多次）、`--state-dir`（默认 `.local/`）、`--no-auto-refresh`。服务器上的写法见 `deploy/ai-career-radar.service`。

## 目录

| 路径 | 内容 |
|---|---|
| `public/index.html`、`styles.css`、`app.js` | 页面。浏览器原生 ES 模块，只加载同源资源 |
| `public/data/clusters.js` | 13 个职业簇的研究快照，只从 `watchlist.md` 与已发布报告同步 |
| `public/data/rules.js` | 岗位归类规则：排除哪些职能、标题怎么对应职业簇、未归类岗位怎么分组 |
| `public/shared/radar.js` | 浏览器和服务器共用的纯函数：归类、合并同职位、算“新”、生成页面数据 |
| `server.mjs` | 入口：静态文件、两个接口、每天自动刷新 |
| `server/sources.mjs` | 21 个固定来源的白名单、解析和分页读取（Ashby、Greenhouse、Lever、腾讯、美团、网易、百度） |
| `server/refresh.mjs` | 刷新：合并新旧岗位、失败来源沿用旧数据、写历史 |
| `server/store.mjs` | `.local/state.json`（当前岗位）与 `.local/history.json`（每日计数） |
| `server/app.mjs` | 请求处理与防护（只收本机连接、固定 Host/Origin、刷新需专用请求头） |
| `deploy/` | 服务器部署、nginx 与回滚说明 |
| `test/` | `node --test` 用的测试 |

## 数据怎么来

1. 刷新时读取 21 个固定来源的完整公开职位列表（清单见 `../sources/registry.md`；网易每页最多 200 条，要读十几页，其余一到三次请求），只保留标题、链接、地区、部门、发布日期和职责段里的技能词，不保存职位正文。
2. 销售、市场、招聘、财务、法务等职能直接丢弃；非 AI 公司（国内大厂、百度、Databricks）只保留标题带 AI 信号的岗位。
3. 页面按标题把岗位归到职业簇（`rules.js`），一个岗位可以属于多个簇；同一职位在不同城市的招聘合并成一行。
4. 每个岗位记第一次出现的时间。某个来源第一次读取成功的那一刻是它的基线，之后才出现的岗位才标“新”。
5. 每次刷新后按 UTC 日期写一行历史（同一天覆盖），趋势线和“清零”提醒都从这里来。改归类规则不会重算过去的历史。

## 常见修改

- **研究更新**：先改报告和 `watchlist.md`，再同步 `public/data/clusters.js`，跑 `node --test`。
- **某个岗位归错了**：改 `public/data/rules.js`，在 `test/radar.test.mjs` 的标题用例里加一条，跑测试，再打开页面看那个职业簇。
- **加信源**：先在 `sources/registry.md` 登记并经良确认，再加到 `server/sources.mjs`，补解析测试。新来源第一次读取的岗位算基线，不会被标成“新”；历史每行记着当天用了哪些来源，来源变化后趋势线从变化那天重新起算。
