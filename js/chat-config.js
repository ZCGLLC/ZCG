// Set this to your Cloudflare Worker URL after deploy, for example:
// window.ZCG_CHAT_ENDPOINT = "https://zcg-chat.<your-subdomain>.workers.dev/chat";
// Until configured, the chat uses on-site knowledge conversation + any public LLM endpoint available.
window.ZCG_CHAT_ENDPOINT = window.ZCG_CHAT_ENDPOINT || "";
window.ZCG_CHAT_MODEL = window.ZCG_CHAT_MODEL || "llama-3.3-70b-versatile";
