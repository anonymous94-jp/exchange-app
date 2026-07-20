import {
    getWallets,
    getEdges
} from "./exchangeDiscoveryServiceV2.js";

/**
 * Phân tích một Wallet
 */
export function analyzeWallet(wallet) {

    const features = {

        chain: wallet.chain,

        address: wallet.address,

        txCount: wallet.txCount,

        tokenCount: wallet.tokens.size,

        uniqueSenders: 0,

        uniqueReceivers: 0,

        depositCount: 0,

        withdrawCount: 0,

        firstSeen: wallet.firstSeen,

        lastSeen: wallet.lastSeen

    };

    const edges = getEdges();

    for (const edge of edges.values()) {

        // Ví nhận
        if (edge.to === wallet.address) {

            features.uniqueSenders++;

        }

        // Ví gửi
        if (edge.from === wallet.address) {

            features.uniqueReceivers++;

        }

    }

    for (const token of wallet.tokens.values()) {

        features.depositCount += token.depositCount;

        features.withdrawCount += token.withdrawCount;

    }

    return features;

}

/**
 * Phân tích toàn bộ Wallet
 */
export function analyzeAll() {

    const result = [];

    const wallets = getWallets();

    for (const wallet of wallets.values()) {

        result.push(

            analyzeWallet(wallet)

        );

    }

    return result;

}
