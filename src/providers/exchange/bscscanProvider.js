import axios from "axios";

const API_KEY = process.env.ETHERSCAN_API_KEY;

const BASE_URL = "https://api.etherscan.io/v2/api";

const CHAIN_ID = "56"; // BNB Smart Chain

export async function getTokenTransfers(
    address,
    page = 1,
    offset = 100
) {

    const { data } = await axios.get(BASE_URL, {

        params: {

            chainid: CHAIN_ID,

            module: "account",

            action: "tokentx",

            address,

            page,

            offset,

            startblock: 0,

            endblock: 99999999,

            sort: "desc",

            apikey: API_KEY

        }

    });

    if (data.status !== "1") {

        console.error("");
        console.error("===== ETHERSCAN API ERROR =====");
        console.error(data);
        console.error("");

        return [];

    }

    return data.result;

}
