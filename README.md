# Zaidi Consulting Group

Professional website for Zaidi Consulting Group.

## Pages

- **Home** (`/`) — brand introduction and service overview
- **Our Services** (`/services/`) — Revenue Cycle Management, Performance Marketing, Remote Staffing Solutions
- **Articles** (`/articles/`) — latest industry updates and insights
- **Contact Us** (`/contact/`) — contact details and inquiry form

## Run locally

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Live site

- https://www.zaidiconsultinggroup.com
- https://zcgllc.github.io/ZCG/

## Publish on GitHub Pages

The site deploys automatically to GitHub Pages from `main` via GitHub Actions.

## Live chat (ZCG assistant)

The website chatbox is a Zaidi-tailored assistant for healthcare, insurance, medical billing, performance marketing, remote staffing, and all on-site content. Visitors do **not** need to sign up.

To enable the full LLM backend (recommended):

1. Create a free Groq key at https://console.groq.com/keys
2. Create a free Cloudflare account and API token with Workers edit permission
3. Add GitHub Actions secrets on this repo:
   - `GROQ_API_KEY`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Run **Deploy ZCG Chat Worker** (or push a change under `workers/zcg-chat/`)
5. Put the worker URL into `js/chat-config.js`:

```js
window.ZCG_CHAT_ENDPOINT = "https://zcg-chat.<your-subdomain>.workers.dev/chat";
```
