export function analyze(metrics) {

    const reasons = [];

    let score = 50;

    //--------------------------------------------------
    // Minimum Data Check
    //--------------------------------------------------

    const MIN_TX = 5;
    const MIN_USD_VOLUME = 1000;

    const totalUsd =
        metrics.depositUsd +
        metrics.withdrawUsd +
        metrics.transferUsd;

    if (
        metrics.txCount < MIN_TX &&
        totalUsd < MIN_USD_VOLUME
    ) {

        return {

            signal: "WAITING",

            score: 0,

            reasons: [

                `Waiting for more data`,

                `Transactions : ${metrics.txCount}/${MIN_TX}`,

                `USD Volume : $${totalUsd.toFixed(2)} / $${MIN_USD_VOLUME}`

            ]

        };

    }

    //--------------------------------------------------
    // Net Flow USD
    //--------------------------------------------------

    if (metrics.netFlowUsd > 0) {

        score += 20;

        reasons.push("Net USD Outflow");

    }

    else if (metrics.netFlowUsd < 0) {

        score -= 20;

        reasons.push("Net USD Inflow");

    }

    //--------------------------------------------------
    // Deposit / Withdraw
    //--------------------------------------------------

    if (metrics.withdrawUsd > metrics.depositUsd) {

        score += 15;

        reasons.push("Withdraw > Deposit");

    }

    else if (metrics.depositUsd > metrics.withdrawUsd) {

        score -= 15;

        reasons.push("Deposit > Withdraw");

    }

    //--------------------------------------------------
    // Whale Activity
    //--------------------------------------------------

    if (metrics.whaleTx >= 5) {

        score += 15;

        reasons.push("Many Whale Transactions");

    }

    else if (metrics.whaleTx >= 2) {

        score += 5;

        reasons.push("Some Whale Transactions");

    }

    else {

        score -= 10;

        reasons.push("No Whale Activity");

    }

    //--------------------------------------------------
    // Strong USD Flow
    //--------------------------------------------------

    if (metrics.netFlowUsd >= 100000) {

        score += 10;

        reasons.push("Strong USD Outflow");

    }

    if (metrics.netFlowUsd <= -100000) {

        score -= 10;

        reasons.push("Strong USD Inflow");

    }

    //--------------------------------------------------
    // Very Large Volume
    //--------------------------------------------------

    if (totalUsd >= 1000000) {

        score += 10;

        reasons.push("Very High Volume");

    }

    //--------------------------------------------------
    // Clamp Score
    //--------------------------------------------------

    score = Math.max(0, Math.min(score, 100));

    //--------------------------------------------------
    // Final Signal
    //--------------------------------------------------

    let signal = "NEUTRAL";

    if (score >= 80) {

        signal = "STRONG_ACCUMULATION";

    }

    else if (score >= 65) {

        signal = "ACCUMULATION";

    }

    else if (score <= 20) {

        signal = "STRONG_DISTRIBUTION";

    }

    else if (score <= 35) {

        signal = "DISTRIBUTION";

    }

    //--------------------------------------------------
    // Return
    //--------------------------------------------------

    return {

        signal,

        score,

        reasons

    };

}
