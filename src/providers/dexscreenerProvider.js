import axios from "axios";

const CACHE_TIME = 60 * 1000;

const cache = new Map();

export async function getDexTokenInfo(chain, tokenAddress) {

    const key =
        `${chain}:${tokenAddress}`.toLowerCase();

    const cached = cache.get(key);

    if (
        cached &&
        Date.now() - cached.time < CACHE_TIME
    ) {
        return cached.data;
    }

    try {

        const url =
            `https://api.dexscreener.com/tokens/v1/${chain}/${tokenAddress}`;

        const { data } = await axios.get(url, {
            timeout: 10000
        });

        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        data.sort((a, b) =>
            Number(b.liquidity?.usd || 0) -
            Number(a.liquidity?.usd || 0)
        );

        const pair = data[0];

        const result = {

            source: "DexScreener",

            chain,

            dex: pair.dexId,

            pairAddress: pair.pairAddress,

            url: pair.url,

            priceUsd: Number(pair.priceUsd || 0),

            liquidityUsd: Number(
                pair.liquidity?.usd || 0
            ),

            fdv: Number(pair.fdv || 0),

            marketCap: Number(
                pair.marketCap || 0
            ),

            volume: {

                m5: Number(pair.volume?.m5 || 0),

                h1: Number(pair.volume?.h1 || 0),

                h6: Number(pair.volume?.h6 || 0),

                h24: Number(pair.volume?.h24 || 0)

            },

            txns: {

                m5: pair.txns?.m5 ?? {},

                h1: pair.txns?.h1 ?? {},

                h6: pair.txns?.h6 ?? {},

                h24: pair.txns?.h24 ?? {}

            },

            priceChange: pair.priceChange ?? {},

            baseToken: pair.baseToken,

            quoteToken: pair.quoteToken,

            pairCreatedAt: pair.pairCreatedAt

        };

        cache.set(key, {

            time: Date.now(),

            data: result

        });

        return result;

    } catch (err) {

        console.error(
            "[DexScreener]",
            err.message
        );

        return null;

    }

}

export function clearDexCache() {

    cache.clear();

}