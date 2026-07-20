import graphStorage from "./graphStorageService.js";


class GraphBuilderService {


    processTransfer(event) {


        const {
            chain,
            from,
            to,
            token,
            amount,
            amountFormatted,
            usdValue,
            txHash,
            timestamp = Date.now()

        } = event;



        //
        // Update sender wallet
        //

        graphStorage.updateWallet({

            chain,

            address: from,

            role: "unknown",

            timestamp

        });



        //
        // Update receiver wallet
        //

        graphStorage.updateWallet({

            chain,

            address: to,

            role: "unknown",

            timestamp

        });



        //
        // Create relationship
        //

        graphStorage.updateEdge({

            chain,

            from,

            to,

            token,

            amount,

            amountFormatted,

            usdValue,

            txHash,

            timestamp

        });

        graphStorage.updateWalletStats({

            chain,

            address: from,

            direction:"out",

            usdValue,

            timestamp

        });


        graphStorage.updateWalletStats({

            chain,

            address: to,

            direction:"in",

            usdValue,

            timestamp

        });

        graphStorage.addWalletActivity({

            chain,

            address: from,

            direction:"out",

            usdValue,

            token,

            timestamp

        });

        graphStorage.addWalletActivity({

            chain,

            address: to,

            direction:"in",

            usdValue,

            token,

            timestamp

        });

        graphStorage.updateCounterparty({

            chain,

            walletAddress:to,

            counterpartyAddress:from,

            direction:"in",

            usdValue

        });         


        graphStorage.updateCounterparty({

            chain,

            walletAddress:from,

            counterpartyAddress:to,

            direction:"out",

            usdValue

        });

        graphStorage.updateTokenStats({

            chain,

            walletAddress: from,

            token,

            direction:"out",

            usdValue

        });


        graphStorage.updateTokenStats({

            chain,

            walletAddress: to,

            token,

            direction:"in",

            usdValue

        });


        return true;

    }

    getSummary() {

    const graph =
        graphStorage.getGraph();

    return {

        walletCount:
            Object.keys(graph.wallets).length,

        edgeCount:
            Object.keys(graph.edges).length

    };

}


}


export default new GraphBuilderService();