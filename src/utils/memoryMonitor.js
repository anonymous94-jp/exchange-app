const LIMIT_RAM_MB = 1300;

export function getMemoryInfo() {

    const rss =
        process.memoryUsage().rss / 1024 / 1024;

    return {

        exceeded: rss >= LIMIT_RAM_MB,

        rss: rss.toFixed(2),

        limit: LIMIT_RAM_MB

    };

}