import { analyze } from "./src/services/signalService.js";

const metrics = {

    txCount: 12,

    whaleTx: 7,

    normalTx: 5,

    depositAmount: 5000,

    withdrawAmount: 18000,

    transferAmount: 2000,

    exchangeAmount: 0,

    depositUsd: 100000,

    withdrawUsd: 350000,

    transferUsd: 0,

    netFlowAmount: 13000,

    netFlowUsd: 250000

};

console.log(analyze(metrics));
