module.exports = {
  apps: [
    {
      name: "dance-academy-chatbot",
      script: "src/server.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      exp_backoff_restart_delay: 200,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
