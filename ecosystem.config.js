module.exports = {
    apps: [
        {
            name: "exchange-app",

            script: "./src/index.js",

            autorestart: false,

            watch: false,

            max_memory_restart: "1300M"
        }
    ]
};