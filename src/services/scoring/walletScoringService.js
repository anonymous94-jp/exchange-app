import exchangeScorer from "./exchangeScorer.js";
import whaleScorer from "./whaleScorer.js";

class WalletScoringService {


    analyze(features){


        const exchangeResult =

            exchangeScorer.score(features);

        const whaleResult =

            whaleScorer.score(features);



        return {


            wallet: features.address,


            classifications:{


                exchange:exchangeResult.score,
                whale:whaleResult.score

            },


            evidence:{


                exchange:exchangeResult.evidence,
                whale:whaleResult.evidence

            },

            negativeEvidence:{

                exchange:exchangeResult.negativeEvidence,
                whale:whaleResult.negativeEvidence

            },


            confidence:{


                exchange:exchangeResult.confidence,
                whale:whaleResult.confidence

            }


        };


    }


}


export default new WalletScoringService();