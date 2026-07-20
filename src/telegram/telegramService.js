import axios from "axios";
import config from "../config/env.js";

export async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: config.telegram.chatId,
      text,
    });

    console.log("Telegram sent:", response.data.ok);
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error("Telegram API Error:", err.response.data);
    } else {
      console.error("Network Error:", err.message);
    }
    throw err;
  }
}
