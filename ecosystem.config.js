/**
 * PM2 进程配置（阿里云 ECS 推荐）
 * 房间状态存在内存中，只能单进程，不要改成 cluster
 */
module.exports = {
  apps: [
    {
      name: 'poker',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
      },
    },
  ],
};
