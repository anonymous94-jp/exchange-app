import fs from "fs/promises";
import path from "path";

export async function loadTokens() {
  const filePath = path.join(process.cwd(), "./config/tokens.json");
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}
