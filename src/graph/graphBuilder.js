export default class GraphBuilder {

    constructor() {

        // Lưu toàn bộ Node
        this.nodes = new Map();

        // Lưu toàn bộ Edge
        // key: fromNode
        // value: Map(toNode -> EdgeInfo)
        this.edges = new Map();

    }

    /**
     * Sinh key duy nhất cho node
     */
    createNodeKey(chain, address) {

        return `${chain.toLowerCase()}:${address.toLowerCase()}`;

    }

    /**
     * Thêm Node
     */
    addNode(chain, address) {

        const key = this.createNodeKey(chain, address);

        if (!this.nodes.has(key)) {

            this.nodes.set(key, {
                chain: chain.toLowerCase(),
                address: address.toLowerCase(),
                firstSeen: Date.now(),
                lastSeen: Date.now()
            });

        } else {

            const node = this.nodes.get(key);

            node.lastSeen = Date.now();

        }

        return key;

    }

    /**
     * Thêm Edge
     */
    addEdge(
        chain,
        from,
        to,
        amount = 0,
        txHash = "",
        timestamp = Date.now()
    ) {

        const fromKey = this.addNode(chain, from);

        const toKey = this.addNode(chain, to);

        if (!this.edges.has(fromKey)) {

            this.edges.set(fromKey, new Map());

        }

        const neighbors = this.edges.get(fromKey);

        if (!neighbors.has(toKey)) {

            neighbors.set(toKey, {

                count: 0,

                volume: 0,

                firstSeen: timestamp,

                lastSeen: timestamp,

                txHashes: []

            });

        }

        const edge = neighbors.get(toKey);

        edge.count++;

        edge.volume += amount;

        edge.lastSeen = timestamp;

        if (txHash && edge.txHashes.length < 100) {

            edge.txHashes.push(txHash);

        }

    }

    /**
     * Có Node hay không
     */
    hasNode(chain, address) {

        const key = this.createNodeKey(chain, address);

        return this.nodes.has(key);

    }

    /**
     * Có Edge hay không
     */
    hasEdge(chain, from, to) {

        const fromKey = this.createNodeKey(chain, from);

        const toKey = this.createNodeKey(chain, to);

        return this.edges.get(fromKey)?.has(toKey) ?? false;

    }

    /**
     * Lấy Node
     */
    getNode(chain, address) {

        const key = this.createNodeKey(chain, address);

        return this.nodes.get(key);

    }

    /**
     * Lấy Neighbor
     */
    getNeighbors(chain, address) {

        const key = this.createNodeKey(chain, address);

        return this.edges.get(key) ?? new Map();

    }

    /**
     * Tổng số Node
     */
    getNodeCount() {

        return this.nodes.size;

    }

    /**
     * Tổng số Edge
     */
    getEdgeCount() {

        let total = 0;

        for (const neighbors of this.edges.values()) {

            total += neighbors.size;

        }

        return total;

    }

    /**
     * Lấy toàn bộ Node
     */
    getNodes() {

        return this.nodes;

    }

    /**
     * Lấy toàn bộ Edge
     */
    getEdges() {

        return this.edges;

    }

    /**
     * Xóa Graph
     */
    clear() {

        this.nodes.clear();

        this.edges.clear();

    }

}
