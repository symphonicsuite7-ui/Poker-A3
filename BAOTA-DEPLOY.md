# 宝塔部署快速说明

## 1. 上传并解压

在宝塔文件管理中创建 `/www/wwwroot/tianzi-poker`，上传本压缩包并解压到该目录。

## 2. 安装依赖并启动

宝塔安装 Node.js 20 LTS，然后在终端执行：

```bash
cd /www/wwwroot/tianzi-poker
npm ci --omit=dev --registry=https://registry.npmmirror.com
pm2 start ecosystem.config.js
pm2 save
```

检查服务：

```bash
curl http://127.0.0.1:3000/health
pm2 logs tianzi-poker
```

## 3. 添加网站和反向代理

在宝塔中添加网站，然后为该网站添加反向代理，目标 URL 填写 `http://127.0.0.1:3000`。

确认 Nginx 代理配置包含：

```nginx
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_read_timeout 60s;
client_max_body_size 6m;
```

最后在网站的 SSL 页面申请 Let's Encrypt 证书并开启强制 HTTPS。

## 4. 数据备份

账号和上传图片位于 `server/data/`。后续更新程序时不要覆盖该目录，并定期备份它。

本项目的房间在内存中，PM2 必须保持单实例 fork 模式，不能开启 cluster。
