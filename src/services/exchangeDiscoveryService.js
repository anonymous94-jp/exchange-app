import { getTokenTransfers } from "../providers/exchange/bscscanProvider.js";
import { buildGraphFromTransfers } from "./graphService.js";
import GraphAnalyzer from "../graph/graphAnalyzer.js";

/**
 * Discover candidate wallets từ một Seed
 */
async function discoverFromSeed(seed) {

    console.log("================================");
    console.log(`Exchange : ${seed.exchange}`);
    console.log(`Chain    : ${seed.chain}`);
    console.log(`Wallet   : ${seed.address}`);
    console.log("================================");

    // 1. Lấy transaction
    const transfers = await getTokenTransfers(seed.address);

    console.log(`Transfers : ${transfers.length}`);

    if (transfers.length === 0) {
        return [];
    }

    // 2. Build Graph
    const graph = buildGraphFromTransfers(
        seed.chain,
        transfers
    );

    console.log(
        `Nodes : ${graph.getNodeCount()}`
    );

    console.log(
        `Edges : ${graph.getEdgeCount()}`
    );

    // 3. Analyze
    const analyzer = new GraphAnalyzer(graph);

    const neighbors = analyzer.getTopNeighbors(
        seed.chain,
        seed.address,
        20
    );

    // 4. Convert Candidate
    return neighbors.map(item => ({

        exchange: seed.exchange,

        chain: seed.chain,

        sourceSeed: seed.address,

        address: item.node.replace(
            `${seed.chain}:`,
            ""
        ),

        txCount: item.count,

        volume: item.volume

    }));

}

/**
 * Discover toàn bộ Seed
 */
export async function discoverExchange(seeds) {

    const candidates = [];

    for (const seed of seeds) {

        const result =
            await discoverFromSeed(seed);

        candidates.push(...result);

    }

    return candidates;

}
