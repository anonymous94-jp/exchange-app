import axios from "axios";

try {
  const res = await axios.get("https://api.telegram.org/bot8820760636:AAH5-wbuesSUUV6Sllm-NmhkJkrZqmjqcHc/getMe");
  console.log(res.status);
} catch (e) {
  console.log(e);
}
