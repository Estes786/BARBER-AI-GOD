// PM2 Ecosystem Config for BARBER-AI-GOD
// Development environment - DO NOT use in production!

module.exports = {
  apps: [
    {
      name: 'barber-ai-god',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=barber-ai-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        CLOUDFLARE_API_TOKEN: 'uumF6E8IRrLhgzM7yQlG-Np5FxNMIH6_rv0peDBQ'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ]
}
