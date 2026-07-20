class WhaleScorer {


    score(features){


        let score = 0;


        const evidence = [];

        const negativeEvidence = [];



        /*
        Volume Pattern
        */


        if(
            features.totalReceivedUsd > 10000000 ||
            features.totalSentUsd > 10000000
        ){

            score += 0.3;


            evidence.push(
                "high_volume"
            );

        }



        /*
        Average Transfer Size
        */


        if(
            features.avgTransferUsd > 100000
        ){

            score += 0.25;


            evidence.push(
                "large_average_transfer"
            );

        }



        /*
        Concentration Pattern

        Whale thường không phân tán
        quá nhiều như exchange
        */


        if(

            features.topReceiverConcentration > 0.5

        ){

            score += 0.2;


            evidence.push(
                "high_receiver_concentration"
            );

        }



        /*
        Counterparty Pattern

        Ít đối tác hơn exchange
        */


        if(

            features.uniqueReceivers < 100

        ){

            score += 0.15;


            evidence.push(
                "limited_counterparty"
            );

        }



        /*
        Negative Evidence
        */



        if(

            features.activeDays < 3

        ){

            score -= 0.2;


            negativeEvidence.push(
                "new_wallet"
            );

        }



        if(

            features.uniqueReceivers > 10000

        ){

            score -= 0.3;


            negativeEvidence.push(
                "mass_distribution_pattern"
            );

        }




        return {


            score:

                Math.max(

                    0,

                    Math.min(
                        score,
                        1
                    )

                ),



            confidence:

                Math.max(
                    0,
                    score
                ),



            evidence,


            negativeEvidence


        };


    }


}



export default new WhaleScorer();