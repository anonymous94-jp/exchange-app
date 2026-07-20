import { ethers } from "ethers";
import GraphBuilder from "../../graph/graphBuilder.js";

/**
 * Build Graph từ danh sách token transfer
 *
 * @param {string} chain
 * @param {Array} transfers
 *
 * @returns {GraphBuilder}
 */
export function buildGraphFromTransfers(
    chain,
    transfers
) {

    const graph = new GraphBuilder();

    for (const tx of transfers) {

        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();

        if (!from || !to) {
            continue;
        }

        const decimals = Number(
            tx.tokenDecimal ?? 18
        );

        const amount = Number(
            ethers.formatUnits(
                tx.value,
                decimals
            )
        );

        graph.addEdge(
            chain,
            from,
            to,
            amount,
            tx.hash,
            Number(tx.timeStamp)
        );

    }

    return graph;

}
