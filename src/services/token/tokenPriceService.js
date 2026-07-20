import { formatUnits } from "ethers";

import tokenMetadataService from "../token/tokenMetadataService.js";
import { getDexTokenInfo } from "../../providers/dexscreenerProvider.js";

class TokenPriceService {

    async getUsdValue(chain, token, rawAmount) {

        try {

            const metadata =
                await tokenMetadataService.getMetadata(token);

            const dexInfo =
                await getDexTokenInfo(
                    chain,
                    token
                );

            if (!dexInfo) {
                return 0;
            }

            const amount = Number(
                formatUnits(
                    rawAmount,
                    metadata.decimals
                )
            );

            return amount * dexInfo.priceUsd;

        } catch (err) {

            console.error(
                "[TokenPriceService]",
                err.message
            );

            return 0;

        }

    }

}

export default new TokenPriceService();