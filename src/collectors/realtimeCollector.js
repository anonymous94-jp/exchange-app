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

	  for (const txHash of block.transactions) {

                const receipt =
                    await provider.getTransactionReceipt(txHash);

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

                    // chống lỗi decode
                    if (!log.data || log.data.length < 66) {
                        continue;
                    }
                    let parsed;
                    try {

                        parsed =
                            erc20Interface.parseLog(log);

                    } catch(err) {
                        console.log("Skip invalid Transfer log",log.address);
                        continue;

                    }

                    if (!parsed) {
                        continue;
                    }
                    await handleTransfer({

                                blockNumber,

                                blockTimestamp: Number(block.timestamp),

                                txHash,

                                log,

                                parsed

                            });

                }
        // await graphStorage.saveGraph(true);
		printSummary();

            } 
    } catch (error) {

                console.error(
                    `Block ${blockNumber} Error`,
                    error.message
                );

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

        processQueue();

    });

}
