import {
    loadExchanges,
    findExchange
} from "./src/services/exchangeService.js";

await loadExchanges();

console.log(

    findExchange(

        "bsc",

        "0x1111111111111111111111111111111111111111"

    )

);

console.log(

    findExchange(

        "bsc",

        "0x9999999999999999999999999999999999999999"

    )

);
