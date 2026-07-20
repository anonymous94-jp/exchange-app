import dotenv from "dotenv";

dotenv.config();

const config = {
  telegram: {
    token: process.env.BOT_TOKEN,
    chatId: process.env.CHAT_ID,
  },

  bnb: {
    rpc: process.env.BNB_RPC,
    wss: process.env.BNB_WSS,
  },
};

export default config;
