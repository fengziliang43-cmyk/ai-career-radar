# 私有服务器部署

2026-10-11 已部署： https://quant.liang111.top/careers/ ，发布版 `20261011-final`。沿用既有量化站 HTTPS 与 BasicAuth；密码不进入源码。未修改 DNS、账号文件、其他站点或量化服务。

## 运行与边界

- 静态文件：`/srv/ai-career-radar/current/public/`；发行目录由 root 管理。网页不包含运行源码、环境文件或 sourcemap。
- `ai-career-radar.service` 只监听 `127.0.0.1:18991`。动态用户、严格文件系统、无额外能力、384 MB 内存上限、25% CPU 上限。
- 状态目录 `/var/lib/ai-career-radar` 由 systemd 映射至 private 目录；目录 0700，状态文件 0600，Nginx 用户不能直接读取。
- 页面、RSC、静态资源和接口均继承认证。刷新要求相同 Origin 和专用请求头，拒绝请求正文与任意 URL；接口限速、限制并发，共用 5 分钟缓存。
- 仅访问代码中固定 HTTPS 信源；不跟随重定向，不关闭证书检查，不向信源转发用户密码或 Cookie。服务器用压缩 curl 获取，响应上限 20 MB，OpenAI 最长 45 秒，其他源 15 秒。
- 服务启动时刷新一次；打开页面时检查 6 小时缓存，页面可见时每 6 小时检查，切回页面补查，也可手动更新。没有周期后台定时更新。
- CSP 使用内联脚本哈希，禁止内联事件、嵌入框架和外部连接；同时设置 no-store、noindex、nosniff 和权限限制。

## 构建及检查

在 `site/` 执行 `RADAR_BASE_PATH=/careers pnpm build`，再运行 `node scripts/export-server.mjs <全新目标目录>`。导出器验证资源引用并生成 SHA256SUMS。发布前校验全部文件、运行测试和类型检查，Nginx 配置需先通过 `nginx -t`。

2026-10-11 验收：8 项测试通过，类型、定向 lint、构建通过；30 文件哈希通过。实际服务器刷新 5/5 成功，28 个方向、464 条岗位。匿名 HTML/RSC/资源/API 为 401；跨站 POST 403、带正文 POST 400、查询参数与源码路径 404。同发布包加真实服务器数据的浏览器渲染、筛选、详情和缓存提示通过。已有密码未向助手提供，因此未验收登录后的外部线上浏览器画面。

## 回滚本次部署

备份保留在 `/home/admin/career-radar-stage-20261011/quant.before.conf`。以下操作恢复原有量化站配置并停止本次服务，保留发行包和状态：

```sh
sudo cp /home/admin/career-radar-stage-20261011/quant.before.conf /etc/nginx/sites-available/quant.liang111.top
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl disable --now ai-career-radar
```

回滚前先核对量化站配置是否有本次之后的新修改，避免覆盖新工作。
