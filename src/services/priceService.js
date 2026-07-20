import { getDexTokenInfo } from "../providers/dexscreenerProvider.js";

export async function getTokenPrice(chain, tokenAddress) {

    const info = await getDexTokenInfo(
        chain,
        tokenAddress
    );

    if (!info) {
        return null;
    }

    return info;

}
