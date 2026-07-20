import dotenv from "dotenv";

dotenv.config();

async function main() {

    const address = process.argv[2];

    if (!address) {

        console.log(
            "Usage: node tools/discoverExchange.js <wallet>"
        );

        process.exit(1);

    }

    console.log("Seed Wallet :", address);

}

main();
