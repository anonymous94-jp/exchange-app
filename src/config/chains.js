export const CHAINS = {
  bsc: {
    name: "BNB Chain",

    rpc: process.env.BSC_RPC,

    // PancakeSwap V2 Factory
    factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",

    // PancakeSwap V2 Router (để dùng sau)
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",

    // Các quote token ưu tiên
    quotes: [
      {
        symbol: "WBNB",
        address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        decimals: 18,
      },
      {
        symbol: "USDT",
        address: "0x55d398326f99059fF775485246999027B3197955",
        decimals: 18,
      },
      {
        symbol: "USDC",
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        decimals: 18,
      },
    ],
  },
};
