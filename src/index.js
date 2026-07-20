import dotenv from "dotenv";

import { startRealtimeCollector } from "./collectors/realtimeCollector.js";
import graphStorage from "./services/graph/graphStorageService.js";
import { getMemoryInfo } from "./utils/memoryMonitor.js";
import graphBuilderService from "./services/graph/graphBuilderService.js";

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

function formatRuntime(seconds) {

    const h =
        Math.floor(seconds / 3600);

    const m =
        Math.floor((seconds % 3600) / 60);

    return `${h}h ${m}m`;

}

function startMemoryMonitor() {

    setInterval(async() => {

        const memory = process.memoryUsage();
        const info = getMemoryInfo();
        const summary = graphBuilderService.getSummary();

        console.log("");
        console.log("========== COLLECTOR STATUS ==========");

        console.log(
            "Runtime :",
            formatRuntime(process.uptime())
        );

        console.log(
            "Wallets :",
            summary.walletCount
        );

        console.log(
            "Edges   :",
            summary.edgeCount
        );

        console.log(
            "RSS     :",
            `${Math.round(memory.rss / 1024 / 1024)} MB`
        );

        console.log(
            "Heap    :",
            `${Math.round(memory.heapUsed / 1024 / 1024)} MB / ${Math.round(memory.heapTotal / 1024 / 1024)} MB`
        );

        if (info.exceeded) {

            console.log("");
            console.log("================================");
            console.log("RAM LIMIT REACHED");
            console.log("Saving graph...");
            console.log("================================");

            await graphStorage.saveGraph(true);

            console.log("Graph saved.");

            process.exit(0);

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