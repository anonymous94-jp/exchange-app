import fs from "fs";
import path from "path";
import { Interface, Contract } from "ethers";

const DATA_DIR = path.resolve("data");
const FILE_PATH = path.join(DATA_DIR, "tokenMetadata.json");

const ERC20_ABI = [
    "function symbol() view returns(string)",
    "function name() view returns(string)",
    "function decimals() view returns(uint8)"
];

class TokenMetadataService {

    constructor() {

        this.cache = {};

        this.provider = null;

        this.load();

    }

    setProvider(provider) {

        this.provider = provider;

    }

    get(tokenAddress){

        const key =
            tokenAddress.toLowerCase();


        return this.cache[key] || null;

    }

    load() {

        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        if (!fs.existsSync(FILE_PATH)) {

            fs.writeFileSync(
                FILE_PATH,
                JSON.stringify({}, null, 2)
            );

        }

        this.cache = JSON.parse(
            fs.readFileSync(FILE_PATH)
        );

    }

    save() {
        console.log("Saving metadata...");
        console.log(FILE_PATH);
        fs.writeFileSync(
            FILE_PATH,
            JSON.stringify(this.cache, null, 2)
        );

    }

    async getMetadata(tokenAddress) {

        tokenAddress = tokenAddress.toLowerCase();

        if (this.cache[tokenAddress]) {
            return this.cache[tokenAddress];
        }

        if (!this.provider) {
            throw new Error("Provider not set.");
        }

        const contract =
            new Contract(
                tokenAddress,
                ERC20_ABI,
                this.provider
            );

        const [symbol, name, decimals] =
            await Promise.all([
                contract.symbol(),
                contract.name(),
                contract.decimals()
            ]);

        const metadata = {

            address: tokenAddress,

            symbol,

            name,

            decimals: Number(decimals)

        };

        this.cache[tokenAddress] = metadata;

        this.save();

        return metadata;

    }

    formatAmount(token, amount) {

        const metadata = this.cache[token.toLowerCase()];

        if (!metadata) {
            return amount;
        }


        const decimals =
            Number(metadata.decimals ?? 18);


        return (
            Number(amount) /
            Math.pow(10, decimals)
        );

    }

}

export default new TokenMetadataService();