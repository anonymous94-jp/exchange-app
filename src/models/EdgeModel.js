export function createEdge({
    chain,
    from,
    to,
    timestamp = Date.now()
}) {

    return {

        from: from.toLowerCase(),

        to: to.toLowerCase(),

        chain,


        createdAt: timestamp,

        updatedAt: timestamp,


        stats: {

            count: 0,

            totalUsd: 0

        },


        activity: {

            firstSeen: timestamp,

            lastSeen: timestamp

        },
        tokens:{},


        lastTransfer:null

    };

}