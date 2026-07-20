class ExchangeScorer {



    score(features){


        let score = 0;


        const evidence = [];

        const negativeEvidence = [];
        



        /*
        Network Pattern
        */


        if(
            features.uniqueSenders > 10000
        ){

            score += 0.3;


            evidence.push(
                "high_unique_senders"
            );

        }



        if(
            features.uniqueReceivers > 5000
        ){

            score += 0.2;


            evidence.push(
                "high_unique_receivers"
            );

        }



        /*
        Token Pattern
        */


        if(
            features.stablecoinRatio > 0.7
        ){

            score += 0.2;


            evidence.push(
                "stablecoin_dominant"
            );

        }




        /*
        Activity Pattern
        */


        if(
            features.activeDays > 180
        ){

            score += 0.15;


            evidence.push(
                "long_activity"
            );

        }




        if(
            features.activityFrequency > 100
        ){

            score += 0.15;


            evidence.push(
                "high_activity_frequency"
            );

        }

        if(
            features.uniqueSenders < 10 &&
            features.uniqueReceivers < 10
        ){
            score -= 0.3;

            negativeEvidence.push(
                "low_counterparty_activity"
            );
        }


        if(
            features.activeDays < 7
        ){
            score -= 0.2;

            negativeEvidence.push(
                "new_wallet"
            );
        }


        if(
            features.totalReceivedUsd > 0 &&
            features.totalSentUsd === 0
        ){
            score -= 0.15;

            negativeEvidence.push(
                "one_direction_flow"
            );
        }

        if(

            features.uniqueSenders > 10000 &&

            features.uniqueReceivers > 10000 &&

            features.stablecoinRatio < 0.3 &&

            features.totalReceivedUsd === features.totalSentUsd

        ){

            score -= 0.4;


            negativeEvidence.push(
                "bridge_like_flow"
            );

        }



        // return {


        //     score:

        //         Math.min(
        //             score,
        //             1
        //         ),



        //     confidence:

        //         evidence.length / 5,



        //     evidence


        // };
        return {

            score: Math.max(
                0,
                Math.min(score,1)
            ),

            confidence:
                // evidence.length / 5,
                Math.max(0,score),

            evidence,

            negativeEvidence

        };


    }


}



export default new ExchangeScorer();