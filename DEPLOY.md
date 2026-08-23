# 天子牌局：葵影 · 阿里云部署说明

本项目是 Node.js 单进程应用（房间和对局存在内存里），适合部署到阿里云 ECS。不要用 PM2 cluster 多进程，否则房间对不上。

## 一、服务器准备

1. 买一台 ECS（建议 CentOS 7/8、Alibaba Cloud Linux 或 Ubuntu 22.04）
2. 安全组放行：
   - **22**（SSH）
   - **80**（网站，走 Nginx 时）
   - 若暂时不用 Nginx，再放行 **3000**
3. 用 SSH 登录服务器

## 二、安装 Node.js 与 Nginx

Ubuntu / Debian：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
```

CentOS / Alibaba Cloud Linux：

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs nginx
sudo npm install -g pm2
```

确认版本：

```bash
node -v
npm -v
```

需要 Node 16 或以上。

## 三、上传项目

在你自己的电脑上，把整个 `poker` 目录（不要带 `node_modules`）传到服务器，例如 `/opt/poker`。

可以用 WinSCP、FinalShell，或在项目目录执行：

```bash
scp -r . root@你的公网IP:/opt/poker
```

服务器上：

```bash
cd /opt/poker
npm install --omit=dev
```

## 四、推荐方式：Nginx + PM2（80 端口）

1. 复制 Nginx 配置：

```bash
sudo cp /opt/poker/deploy/nginx.conf.example /etc/nginx/conf.d/poker.conf
```

2. 把配置里的 `your-domain.com` 改成你的域名；没有域名就改成公网 IP。

3. 检查并启动：

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

4. 用 PM2 启动游戏（监听本机 3000，对外由 Nginx 转发）：

```bash
cd /opt/poker
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. 浏览器访问：`http://你的公网IP/` 或 `http://你的域名/`

## 五、简便方式：直接开放 3000 端口

不装 Nginx 时，把 `ecosystem.config.js` 里的 `HOST` 改成 `0.0.0.0`，然后：

```bash
cd /opt/poker
HOST=0.0.0.0 PORT=3000 pm2 start server/index.js --name poker
```

浏览器访问：`http://你的公网IP:3000/`

Windows 服务器可用：

```bat
set HOST=0.0.0.0
set PORT=3000
node server\index.js
```

## 六、HTTPS（可选）

有域名后，可用阿里云免费证书，或 certbot：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 七、常用运维命令

```bash
pm2 status
pm2 logs tianzi-poker
pm2 restart tianzi-poker
```

健康检查：`http://你的公网IP/health` 应返回 `{"ok":true,"status":"up"}`

用户数据和头像存在：

- `server/data/users.json`
- `server/data/uploads/avatars/`

换机器部署时把这两个一起拷走。

## 八、注意

- 必须 **4 个不同账号** 才能开一局
- 房间在内存中，**重启服务会清空未结束的房间**
- 阿里云安全组没放行 80/3000 时，外网打不开
- Windows 服务器请用 PowerShell 安装 [Node.js LTS](https://nodejs.org/)，再用 `pm2` 或「任务计划程序」保活
