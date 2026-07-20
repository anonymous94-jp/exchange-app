import provider from "./adapters/bnb/provider.js";

console.log("🔌 Connecting to BNB Chain...");

provider.on("block", (blockNumber) => {
  console.log("🟢 New Block:", blockNumber);
});
