const WINDOW_MS = 5 * 60 * 1000;

const events = [];

export function addEvent(event) {

    events.push({

        ...event,

        timestamp: Date.now()

    });

    cleanup();

}

function cleanup() {

    const now = Date.now();

    while (

        events.length &&

        now - events[0].timestamp > WINDOW_MS

    ) {

        events.shift();

    }

}

export function getMetrics(symbol) {

    cleanup();

    const metrics = {

    	// Exchange transaction count
    	txCount: 0,

    	depositTxCount: 0,

    	withdrawTxCount: 0,

    	whaleTx: 0,

    	normalTx: 0,

    	// Amount
    	depositAmount: 0,

    	withdrawAmount: 0,

    	transferAmount: 0,

    	exchangeAmount: 0,

    	// USD
    	depositUsd: 0,

    	withdrawUsd: 0,

    	transferUsd: 0

    };

    for (const e of events) {

        if (e.symbol !== symbol) {

            continue;

        }

	if (
    	  e.flow === "DEPOSIT" ||
    	  e.flow === "WITHDRAW"
	) {

   	   metrics.txCount++;

    	  if (e.whale) {

        	metrics.whaleTx++;

    	  } else {

        	metrics.normalTx++;

    	  }

	}
        switch (e.flow) {

            case "DEPOSIT":

		metrics.depositTxCount++;
                metrics.depositAmount += e.amount;

                metrics.depositUsd += e.usdValue ?? 0;

                break;

            case "WITHDRAW":

		metrics.withdrawTxCount++;
                metrics.withdrawAmount += e.amount;

                metrics.withdrawUsd += e.usdValue ?? 0;

                break;

            case "EXCHANGE":

                metrics.exchangeAmount += e.amount;

                break;

            default:

                metrics.transferAmount += e.amount;

                metrics.transferUsd += e.usdValue ?? 0;

        }

    }

    metrics.netFlowAmount =
        metrics.withdrawAmount -
        metrics.depositAmount;

    metrics.netFlowUsd =
        metrics.withdrawUsd -
        metrics.depositUsd;

    return metrics;

}
