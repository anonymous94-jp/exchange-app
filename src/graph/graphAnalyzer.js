export default class GraphAnalyzer {

    constructor(graphBuilder) {

        this.graph = graphBuilder;

    }

    /**
     * Lấy danh sách neighbor theo số lần giao dịch
     *
     * @param {string} chain
     * @param {string} address
     * @param {number} limit
     *
     * @returns {Array}
     */
    getTopNeighbors(
        chain,
        address,
        limit = 10
    ) {

        const neighbors =
            this.graph.getNeighbors(
                chain,
                address
            );

        const result = [];

        for (const [nodeKey, edge] of neighbors) {

            result.push({

                node: nodeKey,

                count: edge.count,

                volume: edge.volume,

                firstSeen: edge.firstSeen,

                lastSeen: edge.lastSeen

            });

        }

        result.sort(

            (a, b) => b.count - a.count

        );

        return result.slice(0, limit);

    }

}
