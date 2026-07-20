import { ethers } from "ethers";

import provider from "../adapters/bnb/provider.js";

import { loadTokens } from "../services/tokenService.js";

import {
    loadExchanges,
    findExchange,
getExchangeCount
} from "../services/exchangeService.js";

import {
    addEvent,
    getMetrics
} from "../services/metricsService.js";

import { analyze } from "../services/signalService.js";

import { getTokenPrice } from "../services/priceService.js";

const CHAIN = "bsc";

const ERC20_TRANSFER_TOPIC = ethers.id(
    "Transfer(address,address,uint256)"
);

const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

const WHALE_THRESHOLD = 10000;

const tokenCache = new Map();

async function getTokenInfo(tokenAddress) {

    tokenAddress = tokenAddress.toLowerCase();

    if (tokenCache.has(tokenAddress)) {
        return tokenCache.get(tokenAddress);
    }

    const contract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        provider
    );

    const [decimals, symbol] = await Promise.all([
        contract.decimals(),
        contract.symbol()
    ]);

    const info = {
        decimals,
        symbol
    };

    tokenCache.set(tokenAddress, info);

    return info;

}

async function handleTransfer(log, tokenAddress) {

    try {

        const iface = new ethers.Interface([
            "event Transfer(address indexed from,address indexed to,uint256 value)"
        ]);

        const parsed = iface.parseLog(log);

        const from = parsed.args.from.toLowerCase();
        const to = parsed.args.to.toLowerCase();
        const value = parsed.args.value;

        const token = await getTokenInfo(tokenAddress);

        const amount = Number(
            ethers.formatUnits(
                value,
                token.decimals
            )
        );

	let priceUsd = 0;
	let usdValue = 0;

	try {

    		const price = await getTokenPrice(
        	CHAIN,
        	tokenAddress
    	);

    	if (price) {

        	priceUsd = Number(price.priceUsd || 0);

        	usdValue = amount * priceUsd;

    	}

	} catch (err) {

    		console.log("Price Error:", err.message);

	}

        //----------------------------------
        // Whale
        //----------------------------------

        const whale = amount >= WHALE_THRESHOLD;

        //----------------------------------
        // Exchange
        //----------------------------------

        const fromExchange = findExchange(
            CHAIN,
            from
        );

        const toExchange = findExchange(
            CHAIN,
            to
        );

        let flow = "TRANSFER";

        if (fromExchange && !toExchange) {

            flow = "WITHDRAW";

        } else if (!fromExchange && toExchange) {

            flow = "DEPOSIT";

        } else if (fromExchange && toExchange) {

            flow = "EXCHANGE";

        }

        //----------------------------------
        // Metrics
        //----------------------------------

	addEvent({

	    symbol: token.symbol,

	    chain: CHAIN,

	    txHash: log.transactionHash,

	    from,

	    to,

	    amount,

	    priceUsd,

	    usdValue,

	    flow,

	    whale

	});
        const metrics = getMetrics(
            token.symbol
        );

	const signal = analyze(metrics);

        //----------------------------------
        // Console
        //----------------------------------

        console.log("");
        console.log("======================================");
        console.log("Token :", token.symbol);
        console.log("Amount:", amount);
	console.log("Price :", `$${priceUsd}`);

	console.log("Value :", `$${usdValue.toFixed(2)}`);
        console.log("Type  :", whale ? "🐋 WHALE" : "NORMAL");
        console.log("Flow  :", flow);

        console.log(
            "From  :",
            fromExchange
                ? fromExchange.name
                : from
        );

        console.log(
            "To    :",
            toExchange
                ? toExchange.name
                : to
        );

        console.log(
            "Tx    :",
            log.transactionHash
        );

        console.log("");
        console.log("========== METRICS ==========");

        console.log(metrics);

	console.log("");
	console.log("========== SIGNAL ==========");
	console.log("Signal :", signal.signal);
	console.log("Score  :", signal.score);

	if (signal.reasons.length > 0) {

    		console.log("Reasons:");

    		for (const reason of signal.reasons) {

        		console.log(" -", reason);

    		}

	}
    } catch (err) {

        console.error(
            "Transfer Error:",
            err.message
        );

    }

}

async function start() {

    const tokens = await loadTokens();

    await loadExchanges();
    console.log(getExchangeCount());
    console.log(
        `Watching ${tokens.length} token(s)...`
    );

    for (const token of tokens) {

        const address =
            token.address.toLowerCase();

        provider.on(

            {

                address,

                topics: [
                    ERC20_TRANSFER_TOPIC
                ]

            },

            async (log) => {

                await handleTransfer(
                    log,
                    address
                );

            }

        );

    }

}

start();
