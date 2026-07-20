export function createWallet({
    chain,
    address,
    role = "unknown",
    timestamp = Date.now()
}) {

    return {

        address: address.toLowerCase(),

        chain,

        role,


        createdAt: timestamp,

        updatedAt: timestamp,


        stats: {

            txCount: 0,

            firstSeen: timestamp,

            lastSeen: timestamp

        },


        flow: {

            totalReceivedUsd: 0,

            totalSentUsd: 0

        },


        activity: {

            activeDays: 0

        },

        counterparty: {

        uniqueSenders:0,

        uniqueReceivers:0,

        topSenders:[],

        topReceivers:[]

        },

        tokenStats: {},

        firstSeen:null,

        lastSeen:null,

        largeTransferCount:0,

        classification: {

            exchange: {
                score: 0,
                confidence: 0,
                updatedAt: null
            },

            whale: {
                score: 0,
                confidence: 0,
                updatedAt: null
            }

        },

        recentActivity: []

    };

}