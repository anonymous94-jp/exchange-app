import dotenv from "dotenv";

import { startRealtimeCollector } from "./collectors/realtimeCollector.js";
import graphStorage from "./services/graph/graphStorageService.js";
import { getMemoryInfo } from "./utils/memoryMonitor.js";
import graphBuilderService from "./services/graph/graphBuilderService.js";

dotenv.config();

const RAM_LIMIT_MB = 900;

let rotating = false;


async function main() {

    console.log("");
    console.log("================================");
    console.log("Whale Alert Bot Started");
    console.log("================================");

    // await graphStorage.loadGraph();

    graphStorage.scheduleAutoSave(
        60000
    );

    startMemoryMonitor();

    await startRealtimeCollector();

}

function startMemoryMonitor() {

    setInterval(async () => {

        const memory = process.memoryUsage();

        const rssMb =
            memory.rss / 1024 / 1024;

        console.log("========== MEMORY ==========");

        console.log({

            rss:
                `${Math.round(rssMb)} MB`,

            heapUsed:
                `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,

            heapTotal:
                `${Math.round(memory.heapTotal / 1024 / 1024)} MB`

        });

        if (
            rssMb >= RAM_LIMIT_MB &&
            !rotating
        ) {

            rotating = true;

            console.log("");
            console.log("========== RAM LIMIT ==========");
            console.log(`RSS: ${Math.round(rssMb)} MB`);

            try {

                await graphStorage.rotateSnapshot();
                console.log("[MemoryMonitor] Rotation completed.");

            } catch (error) {

                console.error(
                    "[MemoryMonitor] Rotate failed:",
                    error
                );

            } finally {

                rotating = false;

            }

        }

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