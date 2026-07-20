class DexScreenerProvider {

    async fetchPrice(chain, token) {

        token = token.toLowerCase();

        const url =
            `https://api.dexscreener.com/latest/dex/tokens/${token}`;

        const response = await fetch(url);

        const CHAIN_MAP = {
            ethereum: "ethereum",
            bsc: "bsc",
            base: "base",
            arbitrum: "arbitrum",
            optimism: "optimism",
            polygon: "polygon",
            avalanche: "avalanche",
            solana: "solana"
        };

        if (!response.ok) {
            throw new Error(`DexScreener HTTP ${response.status}`);
        }

        const data = await response.json();

        // if (!data.pairs || data.pairs.length === 0) {
        //     return null;
        // }

        const targetChain = CHAIN_MAP[chain];

        const pairs = data.pairs.filter(
            p => p.chainId === targetChain
        );

        if (pairs.length === 0) {
            return null;
        }

        // Chọn pair có thanh khoản cao nhất
        const bestPair = data.pairs.reduce((best, current) => {

            const bestLiquidity =
                Number(best?.liquidity?.usd || 0);

            const currentLiquidity =
                Number(current?.liquidity?.usd || 0);

            return currentLiquidity > bestLiquidity
                ? current
                : best;

        });

        const price = Number(bestPair.priceUsd);

        if (!Number.isFinite(price)) {
            return null;
        }

        return price;
    }
}

export default new DexScreenerProvider();