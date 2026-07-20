import { loadExchangeWallets }
from "../providers/exchange/jsonProvider.js";

let exchangeMap = new Map();

export async function loadExchanges() {

    const exchanges =  await loadExchangeWallets();
    exchangeMap.clear();

    for (const item of exchanges) {

        if (!item.enabled) continue;

        exchangeMap.set(
            `${item.chain}:${item.address.toLowerCase()}`,
            item
        );

    }

    console.log(
        `Loaded ${exchangeMap.size} exchange wallets`
    );

}
export function findExchange(chain, address) {

    return exchangeMap.get(
        `${chain}:${address.toLowerCase()}`
    ) ?? null;

}
export function getExchangeCount() {

    return exchangeMap.size;

}
