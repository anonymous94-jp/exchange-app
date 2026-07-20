import { getTokenPrice } from "./services/priceService.js";

const result = await getTokenPrice(
    "bsc",
    "0xa37eded373c5cdf88644db7c6b89f222e756afb2"
);

console.log(result);
