# 服务器部署

线上入口：`https://quant.liang111.top/careers/`。沿用量化站已有的 HTTPS 与 BasicAuth，密码不进源码。**每次替换线上版本前先问良**（见项目 `AGENTS.md`）。

## 服务器布局

| 内容 | 位置 |
|---|---|
| 版本目录 | `/srv/ai-career-radar/releases/<版本号>/`，`/srv/ai-career-radar/current` 指向当前版本 |
| 静态页面 | `current/public/`，由 nginx 直接提供 |
| 接口服务 | systemd `ai-career-radar.service`，运行 `current/server.mjs`，只监听 `127.0.0.1:18991` |
| 运行状态 | `/var/lib/ai-career-radar/`（`state.json`、`history.json`，目录 0700、文件 0600） |
| nginx | `/etc/nginx/snippets/ai-career-radar-locations.conf`（被 quant.liang111.top 的 server 块 include）、`/etc/nginx/conf.d/ai-career-radar-limits.conf` |

整个 `site/` 就是发布包：没有构建步骤，也没有依赖。服务进程运行期间每小时检查一次，数据超过 24 小时自动刷新；页面打开时数据超过 6 小时也会刷新；手动刷新 5 分钟内共用结果。

## 发布

在本机 `site/` 目录：

```sh
node --test
VERSION=$(date +%Y%m%d)-v2
tar -czf "/tmp/ai-career-radar-$VERSION.tar.gz" --exclude .local --exclude work --exclude test --exclude .DS_Store .
shasum -a 256 "/tmp/ai-career-radar-$VERSION.tar.gz"
```

上传到服务器 `/home/admin/` 后：

```sh
set -eu
VERSION=<同上>
RELEASE=/srv/ai-career-radar/releases/$VERSION
PREVIOUS=$(readlink -f /srv/ai-career-radar/current)

# 1. 解包并检查
sudo mkdir -p "$RELEASE"
sudo tar -xzf "/home/admin/ai-career-radar-$VERSION.tar.gz" -C "$RELEASE"
sudo find "$RELEASE" -type d -exec chmod 755 {} +
sudo find "$RELEASE" -type f -exec chmod 644 {} +
sudo -u www-data test -r "$RELEASE/public/index.html"

# 2. 备份旧配置
STAGE=/home/admin/career-radar-stage-$VERSION
mkdir -p "$STAGE"
echo "$PREVIOUS" > "$STAGE/previous-release"
sudo cp /etc/systemd/system/ai-career-radar.service "$STAGE/service.before"
sudo cp /etc/nginx/snippets/ai-career-radar-locations.conf "$STAGE/locations.before.conf"
sudo cp /etc/nginx/conf.d/ai-career-radar-limits.conf "$STAGE/limits.before.conf"

# 3. 切换版本、服务与 nginx
sudo ln -sfn "$RELEASE" /srv/ai-career-radar/current
sudo install -m 644 "$RELEASE/deploy/ai-career-radar.service" /etc/systemd/system/ai-career-radar.service
sudo install -m 644 "$RELEASE/deploy/nginx-locations.conf" /etc/nginx/snippets/ai-career-radar-locations.conf
sudo install -m 644 "$RELEASE/deploy/nginx-limits.conf" /etc/nginx/conf.d/ai-career-radar-limits.conf
sudo systemd-analyze verify /etc/systemd/system/ai-career-radar.service
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl restart ai-career-radar
sudo systemctl reload nginx
```

## 验收

```sh
# 匿名访问一律 401
for p in /careers/ /careers/app.js /careers/api/state /careers/api/refresh; do
  curl -s --resolve quant.liang111.top:443:127.0.0.1 -o /dev/null -w "%{http_code} $p\n" "https://quant.liang111.top$p"
done
# 服务只在回环地址监听；启动 5 秒后会自动读取一次职位
sudo ss -lntp | grep 18991
sudo journalctl -u ai-career-radar -n 20 --no-pager
sudo ls -l /var/lib/ai-career-radar/
```

然后用浏览器登录 `https://quant.liang111.top/careers/`，确认职业簇列表、展开详情、刷新按钮和「最近 7 天」都正常。

## 回滚

```sh
STAGE=/home/admin/career-radar-stage-<版本号>
sudo ln -sfn "$(cat "$STAGE/previous-release")" /srv/ai-career-radar/current
sudo install -m 644 "$STAGE/service.before" /etc/systemd/system/ai-career-radar.service
sudo install -m 644 "$STAGE/locations.before.conf" /etc/nginx/snippets/ai-career-radar-locations.conf
sudo install -m 644 "$STAGE/limits.before.conf" /etc/nginx/conf.d/ai-career-radar-limits.conf
sudo nginx -t && sudo systemctl daemon-reload && sudo systemctl restart ai-career-radar && sudo systemctl reload nginx
```

旧版（Codex 版，`20261011-final`）的状态文件 `/var/lib/ai-career-radar/.local/radar-refresh.json` 新版不读也不删，回滚后旧版照常可用。

## 历史

- 2026-10-11 首次部署 Codex 版 `20261011-final`（`bd2916f` 之前的提交里有当时的部署脚本与说明）。
- 2026-10-11 Claude 重写为零依赖版本：页面变为纯静态文件，接口改为 `api/state` 与 `api/refresh`，服务进程内每天自动刷新一次。
