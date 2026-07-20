import fs from "fs/promises";
import path from "path";

export async function loadExchangeWallets() {

    const filePath = path.join(
        process.cwd(),
        "./config/exchanges.json"
    );

    const data = await fs.readFile(
        filePath,
        "utf8"
    );

    return JSON.parse(data);

}
