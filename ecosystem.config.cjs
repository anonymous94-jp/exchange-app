module.exports = {
    apps: [
        {
            name: "exchange-app",

            cwd: "/root/exchange-app",

            script: "./src/index.js",

            autorestart: true,

            max_restarts: 100,

            min_uptime: "10s",

            restart_delay: 5000,

            watch: false,

            max_memory_restart: "1100M"
        }
    ]
};