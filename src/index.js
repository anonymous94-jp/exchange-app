import dotenv from "dotenv";

import { startRealtimeCollector } from "./collectors/realtimeCollector.js";
import graphStorage from "./services/graph/graphStorageService.js";

dotenv.config();


async function main() {

    console.log("");
    console.log("================================");
    console.log("Whale Alert Bot Started");
    console.log("================================");

    await graphStorage.loadGraph();

    graphStorage.scheduleAutoSave(
        60000
    );

    startMemoryMonitor();

    await startRealtimeCollector();

}

function startMemoryMonitor() {

    setInterval(() => {

        const memory = process.memoryUsage();

        console.log("========== MEMORY ==========");

        console.log({
            rss:
                `${Math.round(memory.rss / 1024 / 1024)} MB`,

            heapUsed:
                `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,

            heapTotal:
                `${Math.round(memory.heapTotal / 1024 / 1024)} MB`
        });

    }, 60 * 1000);

}


main()
    .catch(error => {

        console.error(
            "Fatal Error:",
            error
        );

        process.exit(1);

    });