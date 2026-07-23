import dotenv from "dotenv";
import { WebSocketProvider, id, Interface, } from "ethers";
import {
    addEvent,
    size
} from "../services/eventStore.js";
import {
    processEvent,
    printSummary
} from "../services/exchangeDiscoveryServiceV2.js";

import tokenPriceService from "../services/token/tokenPriceService.js";

import tokenMetadataService from "../services/token/tokenMetadataService.js";

// import graphStorage from "../services/graph/graphStorageService.js";

dotenv.config();

const provider = new WebSocketProvider(
    process.env.BNB_WSS
);

tokenMetadataService.setProvider(provider);

const TRANSFER_TOPIC = id("Transfer(address,address,uint256)");

const erc20Interface = new Interface([
    "event Transfer(address indexed from,address indexed to,uint256 value)"
]);

// Queue
const blockQueue = [];

// Tránh chạy nhiều worker cùng lúc
let processing = false;

const RECEIPT_BATCH_SIZE = 10;

const ERROR_SKIP_BLOCKS = 10;

async function handleTransfer({
    blockNumber,
    blockTimestamp,
    txHash,
    log,
    parsed
}) {

    const rawAmount = parsed.args.value.toString();


    const amountFormatted =
        await tokenMetadataService.formatAmount(
            log.address.toLowerCase(),
            rawAmount
        );

    const event = {

        chain: "bsc",

        type: "TOKEN_TRANSFER",

        blockNumber,

        timestamp: blockTimestamp,

        txHash,

        token: log.address.toLowerCase(),

        from: parsed.args.from.toLowerCase(),

        to: parsed.args.to.toLowerCase(),

        amount: parsed.args.value.toString(),
        
        amountFormatted,
        usdValue: 0

    };

    event.usdValue =
        await tokenPriceService.getUsdValue(
            event.chain,
            event.token,
            event.amount
        );


    console.log({

        token: event.token,

        amount: event.amount,

        amountFormatted: event.amountFormatted,

        usdValue: event.usdValue

    });
	addEvent(event);
	processEvent(event);

	}

async function processQueue() {

    if (processing) {

        return;

    }

    processing = true;

    while (blockQueue.length > 0) {

        const blockNumber = blockQueue.shift();

        console.log({
            queue: blockQueue.length,
            processing,
            currentBlock: blockNumber
        });

        try {

            const block =
                await provider.getBlock(blockNumber);

            console.log("");
            console.log("================================");
            console.log(`Block : ${blockNumber}`);
            console.log(`Transactions : ${block.transactions.length}`);
            console.log(`Queue : ${blockQueue.length}`);

	   if (block.transactions.length === 0) {
    		continue;
	   }

        for (
            let i = 0;
            i < block.transactions.length;
            i += RECEIPT_BATCH_SIZE
        ) {

            const txBatch =
                block.transactions.slice(
                    i,
                    i + RECEIPT_BATCH_SIZE
                );

            const receiptBatch =
                await Promise.all(
                    txBatch.map(txHash => getReceipt(txHash))
                );

            for (let j = 0; j < receiptBatch.length; j++) {

                const receipt = receiptBatch[j];
                const txHash = txBatch[j];

                if (!receipt) {
                    continue;
                }

                if (receipt.logs.length === 0) {
                    continue;
                }

                for (const log of receipt.logs) {

                    if (log.topics.length === 0) {
                        continue;
                    }

                    if (log.topics[0] !== TRANSFER_TOPIC) {
                        continue;
                    }

                    if (!log.data || log.data.length < 66) {
                        continue;
                    }

                    let parsed;

                    try {

                        parsed =
                            erc20Interface.parseLog(log);

                    } catch {

                        console.log(
                            "Skip invalid Transfer log",
                            log.address
                        );

                        continue;
                    }

                    if (!parsed) {
                        continue;
                    }

                    await handleTransfer({

                        blockNumber,

                        blockTimestamp:
                            Number(block.timestamp),

                        txHash,

                        log,

                        parsed

                    });

                }

            }

            printSummary();

        }
    } catch (error) {

             const message =error?.error?.message || error?.message || "";

            // // Chainstack Archive Error
            if (
                message.includes("Archive") ||
                message.includes("-32002")
            ) {

                console.error(
                    `Block ${blockNumber} Error`,
                    error.message
                );

                // bỏ qua thêm 5 block trong queue
                for (
                    let i = 0;
                    i < ERROR_SKIP_BLOCKS &&
                    blockQueue.length > 0;
                    i++
                ) {
                    blockQueue.shift();
                }

                console.warn(
                    `[Skip ${ERROR_SKIP_BLOCKS} blocks after error]`
                );

                continue;
            }

            }

        }

    processing = false;

}

export async function startRealtimeCollector() {

    console.log("");
    console.log("================================");
    console.log("Realtime Collector Started");
    console.log("================================");

    provider.on("block", (blockNumber) => {

        // Tránh block trùng
        if (blockQueue.includes(blockNumber)) {
            return;

        }

        blockQueue.push(blockNumber);

        console.log(
            `[Receive] Block ${blockNumber} | Queue=${blockQueue.length}`
        );

        processQueue();

    });

}

async function getReceipt(txHash) {

    try {

        return await provider.getTransactionReceipt(txHash);

    } catch (err) {

        const retry =
            err?.error?.data?.try_again_in;

        // Rate limit
        if (retry) {

            const retryMs =
                Math.ceil(parseFloat(retry));

            console.warn(
                `[Receipt RPS] wait ${retryMs}ms`
            );

            await new Promise(resolve =>
                setTimeout(resolve, retryMs)
            );

            try {

                return await provider.getTransactionReceipt(txHash);

            } catch {

                return null;

            }

        }

        console.warn(
            `[Receipt Error] ${txHash}`
        );

        return null;

    }

}