import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { createWallet } from "../../models/WalletModel.js";
import { createEdge } from "../../models/EdgeModel.js";
import tokenMetadataService from "../token/tokenMetadataService.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR =path.join(__dirname, "../../../data");
const GRAPH_PATH = path.join(DATA_DIR, "exchangeGraph.json");
const SNAPSHOT_DIR = path.join(DATA_DIR, "snapshots");

function createGraph() {

    return {

        version: 1,

        updatedAt: null,

        wallets: {},

        edges: {}

    };

}

class GraphStorageService {
    constructor() {

        this.graph = createGraph();

        this.dirty = false;
        this.saveInterval = null;
        this.currentGraphPath = null;

        if (!fs.existsSync(SNAPSHOT_DIR)) {

            fs.mkdirSync(
                SNAPSHOT_DIR,
                { recursive: true }
            );

        }
    }

    async loadGraph() {
        try {
            const exists = await fs.pathExists(GRAPH_PATH);

            if (!exists) {
                console.log("[GraphStorage] No graph found. Creating new graph...");
                await this.saveGraph();
                return this.graph;
            }

            this.graph = await fs.readJson(GRAPH_PATH);

            console.log(
                `[GraphStorage] Loaded ${Object.keys(this.graph.wallets).length} wallets`
            );

            return this.graph;
        } catch (err) {
            console.error("[GraphStorage] Load error:", err);
            return this.graph;
        }
    }

    async saveGraph(force = false) {

        if (!force && !this.dirty) return;

        if (!this.currentGraphPath) {

            this.createNewSnapshot();

        }

        try {
            this.graph.updatedAt = new Date().toISOString();

            await fs.ensureDir(path.dirname(SNAPSHOT_DIR));

            // await fs.writeJson(GRAPH_PATH, this.graph, {
            //     spaces: 2
            // });
            await fs.writeJson(this.currentGraphPath, this.graph, {
                spaces: 2
            });

            this.dirty = false;

            console.log(
                `[GraphStorage] Saved (${Object.keys(this.graph.wallets).length} wallets)`
            );
        } catch (err) {
            console.error("[GraphStorage] Save error:", err);
        }
    }

    getSnapshotFileName() {

        const now =
            new Date();

        const yyyy =
            now.getFullYear();

        const MM =
            String(now.getMonth() + 1)
                .padStart(2, "0");

        const dd =
            String(now.getDate())
                .padStart(2, "0");

        const hh =
            String(now.getHours())
                .padStart(2, "0");

        const mm =
            String(now.getMinutes())
                .padStart(2, "0");

        const ss =
            String(now.getSeconds())
                .padStart(2, "0");

        return path.join(

            SNAPSHOT_DIR,

            `exchangeGraph_${yyyy}-${MM}-${dd}_${hh}-${mm}-${ss}.json`

        );

    }

    createNewSnapshot() {

        const file =
            this.getSnapshotFileName();

        this.currentGraphPath = file;

        console.log(
            `[Snapshot] New session -> ${file}`
        );

        return file;

    }

    resetGraph() {

        console.log(
            "[GraphStorage] Reset graph..."
        );

        this.graph = createGraph();

        this.dirty = false;

        this.currentGraphPath = null;

    }

    async rotateSnapshot() {

        console.log("[GraphStorage] Rotating snapshot...");

        await this.saveGraph(true);

        this.resetGraph();

        if (global.gc) {

            global.gc();

        }

    }

    updateWallet({
    chain,
    address,
    role = "unknown",
    timestamp = Date.now()
    }) {

        const key = `${chain}:${address.toLowerCase()}`;

        let wallet = this.graph.wallets[key];


        if (!wallet) {

            wallet = createWallet({
                chain,
                address,
                role,
                timestamp
            });

            this.graph.wallets[key] = wallet;

        } else {

            wallet.updatedAt = timestamp;

            wallet.role = role;

        }


        this.dirty = true;

        return wallet;

    }

    updateEdge({
    chain,
    from,
    to,
    token,
    amount = 0,
    amountFormatted = 0,
    usdValue = 0,
    txHash,
    timestamp = Date.now()
    }) {


        const key =
            `${chain}:${from.toLowerCase()}->${to.toLowerCase()}`;


        let edge = this.graph.edges[key];


        if (!edge) {

            edge = createEdge({
                chain,
                from,
                to,
                timestamp
            });

            this.graph.edges[key] = edge;

        }


        edge.updatedAt = timestamp;

        const tokenKey = `${chain}:${token.toLowerCase()}`;


        if(!edge.tokens){

            edge.tokens={};

        }



        if(!edge.tokens[tokenKey]){

            edge.tokens[tokenKey]={

                token,

                txCount:0,

                amountRaw:"0",

                amountFormatted:0,

                volumeUsd:0,

                firstSeen:timestamp,

                lastSeen:timestamp

            };

        }


        const tokenFlow =
            edge.tokens[tokenKey];

        tokenFlow.txCount++;


        tokenFlow.amountRaw =
        (
            BigInt(tokenFlow.amountRaw)
            +
            BigInt(amount)
        ).toString();


        tokenFlow.amountFormatted +=
            Number(amountFormatted || 0);


        tokenFlow.volumeUsd +=
            Number(usdValue);


        tokenFlow.lastSeen =
            timestamp;


        edge.stats.count++;

        // edge.stats.totalAmount += Number(amount);

        edge.stats.totalUsd += Number(usdValue);


        edge.lastTransfer = {

            token,

            amount,

            amountFormatted,

            usd: usdValue,

            txHash,

            timestamp

        };


        this.dirty = true;


        return edge;

    }

    updateWalletStats({
    chain,
    address,
    direction,
    usdValue = 0,
    timestamp = Date.now()
    }) {


        const key =
            `${chain}:${address.toLowerCase()}`;


        const wallet =
            this.graph.wallets[key];


        if (!wallet) {

            throw new Error(
                `Wallet not found: ${key}`
            );

        }


        wallet.stats.txCount++;

        wallet.stats.lastSeen = timestamp;


        if (direction === "in") {

            wallet.flow.totalReceivedUsd += usdValue;

        }


        if (direction === "out") {

            wallet.flow.totalSentUsd += usdValue;

        }


        wallet.updatedAt = timestamp;


        return wallet;

    }

    addWalletActivity({

    chain,

    address,

    direction,

    usdValue = 0,

    token = null,

    timestamp = Date.now()

    }) {


        const key =
            `${chain}:${address.toLowerCase()}`;


        const wallet =
            this.graph.wallets[key];


        if (!wallet) {

            throw new Error(
                `Wallet not found: ${key}`
            );

        }


        wallet.recentActivity.push({

            timestamp,

            direction,

            usdValue,

            token

        });


        const MAX_ACTIVITY = 100;


        if(wallet.recentActivity.length > MAX_ACTIVITY){

            wallet.recentActivity =
                wallet.recentActivity.slice(
                    -MAX_ACTIVITY
                );

        }


        wallet.updatedAt = timestamp;


        return wallet;

    }

    updateCounterparty({

    chain,

    walletAddress,

    counterpartyAddress,

    direction,

    usdValue = 0

    }) {


        const walletKey =
            `${chain}:${walletAddress.toLowerCase()}`;


        const wallet =
            this.graph.wallets[walletKey];


        if (!wallet) {

            throw new Error(
                `Wallet not found ${walletKey}`
            );

        }


        const counterparty =
            counterpartyAddress.toLowerCase();



        if (direction === "in") {


            this.updateSender(
                wallet,
                counterparty,
                usdValue
            );


        }



        if (direction === "out") {


            this.updateReceiver(
                wallet,
                counterparty,
                usdValue
            );


        }


        wallet.updatedAt = Date.now();


        return wallet;

    }

    updateSender(
    wallet,
    sender,
    usdValue
    ) {


        let item =
            wallet.counterparty.topSenders
            .find(
                x => x.address === sender
            );



        if (!item) {


            wallet.counterparty.uniqueSenders++;


            item = {

                address: sender,

                count:0,

                volumeUsd:0

            };


            wallet.counterparty.topSenders.push(item);

        }



        item.count++;

        item.volumeUsd += usdValue;



        this.sortTopCounterparty(
            wallet.counterparty.topSenders
        );


    }

    updateReceiver(
    wallet,
    receiver,
    usdValue
    ) {


        let item =
            wallet.counterparty.topReceivers
            .find(
                x => x.address === receiver
            );



        if (!item) {


            wallet.counterparty.uniqueReceivers++;


            item = {

                address: receiver,

                count:0,

                volumeUsd:0

            };


            wallet.counterparty.topReceivers.push(item);

        }



        item.count++;

        item.volumeUsd += usdValue;



        this.sortTopCounterparty(
            wallet.counterparty.topReceivers
        );


    }

    updateTokenStats({

    chain,

    walletAddress,

    token,

    direction,

    usdValue=0

    }) {


        const key =
            `${chain}:${walletAddress.toLowerCase()}`;


        const wallet =
            this.graph.wallets[key];


        if(!wallet){

            throw new Error(
                `Wallet not found ${key}`
            );

        }



        const symbol =
            token.toUpperCase();



        if(!wallet.tokenStats[symbol]){


            wallet.tokenStats[symbol]={

                receivedUsd:0,

                sentUsd:0,

                txCount:0

            };


        }



        const stat =
            wallet.tokenStats[symbol];



        stat.txCount++;



        if(direction==="in"){

            stat.receivedUsd += usdValue;

        }



        if(direction==="out"){

            stat.sentUsd += usdValue;

        }



        wallet.updatedAt =
            Date.now();


        this.dirty=true;


    }

    sortTopCounterparty(list){

        list.sort(
            (a,b)=>
                b.volumeUsd - a.volumeUsd
        );

        const MAX_TOP = 20;

        if(list.length > MAX_TOP){

            list.splice(
                MAX_TOP
            );

        }

    }

    getWallet(address) {
        return this.graph.wallets[address];
    }

    getGraph() {
        return this.graph;
    }

    async exportGraph(filePath) {
        await fs.writeJson(filePath, this.graph, {
            spaces: 2
        });
    }

    async importGraph(filePath) {
        this.graph = await fs.readJson(filePath);
        this.dirty = true;
        await this.saveGraph(true);
    }

    scheduleAutoSave(interval = 5 * 60 * 1000) {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }

        this.saveInterval = setInterval(() => {
            this.saveGraph();
        }, interval);

        console.log(
            `[GraphStorage] Auto save every ${interval / 1000}s`
        );
    }

    async shutdown() {
        console.log("[GraphStorage] Shutdown...");
        await this.saveGraph(true);

        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
    }
}

export default new GraphStorageService();
