class FeatureExtractorService {


    extractWalletFeatures(wallet){


        const features = {


            address:
                wallet.address,


            chain:
                wallet.chain,


            txCount:
                wallet.txCount || 0,


            totalReceivedUsd:
                wallet.totalReceivedUsd || 0,


            totalSentUsd:
                wallet.totalSentUsd || 0,


            netFlowUsd:
                (
                    (wallet.totalReceivedUsd || 0)
                    -
                    (wallet.totalSentUsd || 0)
                ),



            avgTransferUsd:
                this.calculateAverageTransfer(wallet)


        };

        const networkFeatures = this.extractNetworkFeatures(wallet);

        const tokenFeatures = this.extractTokenFeatures(wallet);

        const behaviorFeatures = this.extractBehaviorFeatures(wallet);


        return { ...features, ...networkFeatures, ...tokenFeatures, ...behaviorFeatures };

    }



    calculateAverageTransfer(wallet){


        if(!wallet.txCount){

            return 0;

        }


        return (

            (
                (wallet.totalReceivedUsd || 0)
                +
                (wallet.totalSentUsd || 0)
            )

            /

            wallet.txCount

        );

    }

    extractNetworkFeatures(wallet){


        const counterparty =
            wallet.counterparty || {};



        const uniqueSenders =
            counterparty.uniqueSenders || 0;


        const uniqueReceivers =
            counterparty.uniqueReceivers || 0;



        return {


            uniqueSenders,


            uniqueReceivers,



            senderReceiverRatio:

                uniqueReceivers === 0

                ?

                uniqueSenders

                :

                uniqueSenders / uniqueReceivers,



            topSenderConcentration:

                this.calculateConcentration(
                    counterparty.topSenders
                ),



            topReceiverConcentration:

                this.calculateConcentration(
                    counterparty.topReceivers
                )


        };

    }

    calculateConcentration(list=[]){


        if(list.length===0){

            return 0;

        }


        const total =

            list.reduce(

                (sum,item)=>

                    sum + item.volumeUsd,

                0

            );


        if(total===0){

            return 0;

        }



        return (

            list[0].volumeUsd

            /

            total

        );


    }

    extractTokenFeatures(wallet){


        const tokenStats =
            wallet.tokenStats || {};



        const tokens =
            Object.keys(tokenStats);



        let totalVolume = 0;


        let stablecoinVolume = 0;


        let topToken = null;


        let topVolume = 0;



        const stablecoins = [

            "USDT",

            "USDC",

            "DAI",

            "BUSD"

        ];



        for(const token of tokens){


            const stat =
                tokenStats[token];


            const volume =

                (stat.receivedUsd || 0)

                +

                (stat.sentUsd || 0);



            totalVolume += volume;



            if(
                stablecoins.includes(token)
            ){

                stablecoinVolume += volume;

            }



            if(volume > topVolume){

                topVolume = volume;

                topToken = token;

            }

        }



        return {


            tokenCount:

                tokens.length,



            stablecoinRatio:

                totalVolume === 0

                ?

                0

                :

                stablecoinVolume / totalVolume,



            topToken,


            tokenDiversity:

                tokens.length


        };

    }

    extractBehaviorFeatures(wallet){


        const firstSeen =
            wallet.firstSeen || 0;


        const lastSeen =
            wallet.lastSeen || 0;



        // const activeDays =

        //     firstSeen && lastSeen

        //     ?

        //     Math.max(
        //         1,
        //         (lastSeen-firstSeen)
        //         /
        //         86400
        //     )

        //     :

        //     0;
        const activeDays =

        firstSeen != null &&
        lastSeen != null

        ?

        Math.max(

            1,

            (
                lastSeen - firstSeen
            )
            /
            86400

        )

        :

        0;



        const totalVolume =

            (wallet.totalReceivedUsd || 0)
            +
            (wallet.totalSentUsd || 0);



        return {


            activeDays,


            avgDailyVolume:

                activeDays

                ?

                totalVolume / activeDays

                :

                0,



            avgDailyTx:

                activeDays

                ?

                wallet.txCount / activeDays

                :

                0,



            largeTransferRatio:

                wallet.txCount

                ?

                (
                    wallet.largeTransferCount || 0
                )

                /

                wallet.txCount

                :

                0,


            activityFrequency:

                activeDays

                ?

                wallet.txCount / activeDays

                :

                0

        };


    }



}


export default new FeatureExtractorService();