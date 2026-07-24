import dotenv from "dotenv";
import {
    WebSocketProvider,
    Interface,
    id
} from "ethers";

import tokenPriceService from "../services/token/tokenPriceService.js";
import tokenMetadataService from "../services/token/tokenMetadataService.js";

import {
    addEvent
} from "../services/eventStore.js";

import {
    processEvent
} from "../services/exchangeDiscoveryServiceV2.js";

import graphStorageService from "../services/graph/graphStorageService.js";

dotenv.config();

const provider =
    new WebSocketProvider(
        process.env.BNB_WSS
    );

tokenMetadataService.setProvider(provider);

const erc20Interface =
    new Interface([
        "event Transfer(address indexed from,address indexed to,uint256 value)"
    ]);

const TRANSFER_TOPIC =
    id("Transfer(address,address,uint256)");

/* =======================
   Runtime Stats
======================= */

let latestBlock = 0;
let currentBlock = 0;
let transfer10s = 0;
let skippedTransfer = 0;
let parsedTransfer = 0;

let lastTransferAt = Date.now();

/* =======================
   HeartBeat
======================= */

setInterval(() => {

    const mem =
        process.memoryUsage().rss / 1024 / 1024;

    const walletCount =
        Object.keys(graphStorageService.graph.wallets).length;

    const edgeCount =
        Object.keys(graphStorageService.graph.edges).length;

    const now = new Date().toISOString();

    console.log(`
    ========== Collector 10S ${now} ==========
    Latest   : ${latestBlock}
    Current  : ${currentBlock}
    Lag      : ${latestBlock - currentBlock}

    Transfer/s : ${Math.round(transfer10s / 10)}

    Wallets : ${walletCount}
    Edges   : ${edgeCount}

    Skipped : ${skippedTransfer}

    Memory  : ${mem.toFixed(0)} MB
    ===============================
    `);

    transfer10s = 0;
    skippedTransfer = 0;

}, 10000);

setInterval(() => {

    const idle = Date.now() - lastTransferAt;

    if (idle > 30000) {

        console.error(
            `[WATCHDOG] No transfer received for ${Math.round(idle/1000)}s`
        );

    }

},5000);


async function handleTransfer(log) {

    transfer10s++;

    let parsed;
    try {
        if (
            log.topics.length !== 3 ||
            !log.data ||
            log.data.length !== 66
        ) {

            skippedTransfer++;
            return;

        }

        parsed = erc20Interface.parseLog(log);
        parsedTransfer++;
    }catch (err) {
        skippedTransfer++;
        return;
    }

    const event = {

        chain: "bsc",

        type: "TOKEN_TRANSFER",

        blockNumber: log.blockNumber,

        txHash: log.transactionHash,

        timestamp: Date.now(),

        token: log.address.toLowerCase(),

        from: parsed.args.from.toLowerCase(),

        to: parsed.args.to.toLowerCase(),

        amount: parsed.args.value.toString()

    };

    latestBlock = Math.max(latestBlock, log.blockNumber);
    lastTransferAt = Date.now();

    try {

        addEvent(event);
        processEvent(event);

    } catch (err) {

        skippedTransfer++;
        console.error(
            `[HandleTransfer Error] Block=${log.blockNumber} 
            Tx=${log.transactionHash}
            error message=${err.shortMessage}`
        );
        return;

    }

}

export function startRealtimeCollector() {

    console.log("================================");
    console.log("Realtime Log Collector Started");
    console.log("================================");

    provider.on(
        {
            topics: [
                TRANSFER_TOPIC
            ]
        },
        handleTransfer
    );

}