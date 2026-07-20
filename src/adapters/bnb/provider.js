import { ethers } from "ethers";
import config from "../../config/env.js";

const provider = new ethers.WebSocketProvider(config.bnb.wss);

export default provider;
