/**
 * Exchange Discovery Service V2
 *
 * Responsible for:
 * - classify wallets
 * - detect exchange behavior
 * - forward blockchain events
 */

import graphBuilderService from "./graph/graphBuilderService.js";


export function processEvent(event) {

    graphBuilderService.processTransfer(event);

}


export function printSummary() {

    const graph =
        graphBuilderService.getSummary();

    console.log("");
    console.log("========== EXCHANGE DISCOVERY V2 ==========");
    console.log("Wallets :", graph.walletCount);
    console.log("Edges   :", graph.edgeCount);

}