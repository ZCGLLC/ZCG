import { SITE_KNOWLEDGE } from "./knowledge.js";

const SYSTEM_PROMPT = `You are the official conversational AI assistant for Zaidi Consulting Group (ZCG), custom-tailored for https://www.zaidiconsultinggroup.com.

Company: Zaidi Consulting Group (founded 2022)
Contact: Connect@zaidiconsultinggroup.com | +1 512.851.9610

Core services:
1) Medical Billing / Revenue Cycle Management — billing accuracy, denial reduction, collections, AR, coding support, reporting, process documentation, team enablement.
2) Performance Marketing / Demand Generation — channel strategy, creative testing, analytics/attribution, pre-qualified high-intent call generation (Medicare, ACA, Final Expense, custom verticals), AEP campaign support.
3) Remote Staffing Solutions — role design, sourcing/screening/onboarding, productivity systems, flexible remote teams for healthcare and insurance organizations.

Your job:
- Hold natural, multi-turn conversations.
- Answer questions about ALL website content (services, articles, contact, company).
- Answer related healthcare, insurance, medical billing, performance marketing, remote staffing, and healthcare finance/operations questions.
- Prefer ZCG website knowledge below for company-specific answers.
- Use broader industry knowledge when helpful for related topics, and note when advice is general (not legal/medical advice).
- Be analytical, clear, warm, and practical.
- Never invent client results, guarantees, or fixed pricing. Pricing depends on scope — invite contact.
- If a question is clearly unrelated to ZCG/healthcare/insurance/billing/marketing/staffing/website content, reply: "I’m sorry, I cannot answer that. I focus on Zaidi Consulting Group topics — healthcare, insurance, medical billing / revenue cycle, performance marketing, remote staffing, and related website content."

WEBSITE KNOWLEDGE:
${SITE_KNOWLEDGE}`;

function corsHeaders(origin, allowed) {
  const list = (allowed || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ok = origin && list.includes(origin) ? origin : list[0] || "*";
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json({ ok: true, service: "zcg-chat" }, 200, headers);
    }

    if (request.method !== "POST" || (url.pathname !== "/" && url.pathname !== "/chat")) {
      return json({ error: "Not found" }, 404, headers);
    }

    if (!env.GROQ_API_KEY) {
      return json({ error: "Chat API is not configured yet." }, 503, headers);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (_err) {
      return json({ error: "Invalid JSON body" }, 400, headers);
    }

    const incoming = Array.isArray(payload?.messages) ? payload.messages : [];
    const cleaned = incoming
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
      return json({ error: "Send messages ending with a user turn." }, 400, headers);
    }

    const wantStream = Boolean(payload?.stream);
    const body = {
      model: payload?.model || "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 900,
      stream: wantStream,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleaned],
    };

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return json(
        { error: "Upstream model error", detail: errText.slice(0, 400) },
        502,
        headers
      );
    }

    if (wantStream && upstream.body) {
      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    const data = await upstream.json();
    return json(data, 200, headers);
  },
};
