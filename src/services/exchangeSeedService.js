import fs from "fs/promises";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "./config/exchangeSeeds.json"
);

/**
 * Load toàn bộ Seed
 */
export async function loadSeeds() {

    const data = await fs.readFile(
        filePath,
        "utf8"
    );

    return JSON.parse(data);

}

/**
 * Load Seed theo Exchange
 */
export async function loadSeedsByExchange(exchange) {

    const seeds = await loadSeeds();

    return seeds.filter(

        seed => seed.exchange === exchange

    );

}

/**
 * Load Seed theo Chain
 */
export async function loadSeedsByChain(chain) {

    const seeds = await loadSeeds();

    return seeds.filter(

        seed => seed.chain === chain

    );

}

/**
 * Load Seed theo Exchange + Chain
 */
export async function loadSeedsByExchangeAndChain(
    exchange,
    chain
) {

    const seeds = await loadSeeds();

    return seeds.filter(

        seed =>

            seed.exchange === exchange &&
            seed.chain === chain &&
            seed.verified === true

    );

}
