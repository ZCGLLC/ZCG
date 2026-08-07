(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const form = document.querySelector("#contact-form");

  const onScroll = () => {
    if (!header || header.classList.contains("solid")) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealEls = document.querySelectorAll(".reveal, .service-row");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  if (form) {
    const success = document.querySelector("#form-success");
    const error = document.querySelector("#form-error");
    const submitBtn = document.querySelector("#contact-submit");
    const endpoint =
      form.getAttribute("action") ||
      "https://formsubmit.co/ajax/Connect@zaidiconsultinggroup.com";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      success?.classList.remove("is-visible");
      if (error) {
        error.hidden = true;
        error.classList.remove("is-visible");
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const originalLabel = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Form submit failed");

        form.reset();
        if (success) {
          success.classList.add("is-visible");
          success.focus?.();
        }
      } catch (_err) {
        if (error) {
          error.hidden = false;
          error.classList.add("is-visible");
          error.focus?.();
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel || "Submit Message";
        }
      }
    });
  }

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(carousel.querySelectorAll(".testimonial"));
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");
    const dotsWrap = carousel.querySelector(".carousel-dots");
    let index = 0;
    let timer;

    const visibleCount = () => {
      if (window.matchMedia("(max-width: 760px)").matches) return 1;
      if (window.matchMedia("(max-width: 900px)").matches) return 2;
      return 3;
    };

    const maxIndex = () => Math.max(0, slides.length - visibleCount());

    const renderDots = () => {
      if (!dotsWrap) return;
      const pages = maxIndex() + 1;
      dotsWrap.innerHTML = "";
      for (let i = 0; i < pages; i += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot" + (i === index ? " is-active" : "");
        dot.setAttribute("aria-label", `Go to review set ${i + 1}`);
        dot.addEventListener("click", () => {
          index = i;
          update();
          restart();
        });
        dotsWrap.appendChild(dot);
      }
    };

    const update = () => {
      index = Math.min(index, maxIndex());
      const slide = slides[0];
      if (!slide || !track) return;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const step = slide.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(-${index * step}px)`;
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".carousel-dot").forEach((dot, i) => {
          dot.classList.toggle("is-active", i === index);
        });
      }
    };

    const next = () => {
      index = index >= maxIndex() ? 0 : index + 1;
      update();
    };

    const prev = () => {
      index = index <= 0 ? maxIndex() : index - 1;
      update();
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(next, 5500);
    };

    prevBtn?.addEventListener("click", () => {
      prev();
      restart();
    });
    nextBtn?.addEventListener("click", () => {
      next();
      restart();
    });

    window.addEventListener("resize", () => {
      renderDots();
      update();
    });

    renderDots();
    update();
    restart();
  }

  const aepStorageKey = "zcg-aep-popup-dismissed";
  const aepEndpoint = "https://formsubmit.co/ajax/Connect@zaidiconsultinggroup.com";
  const aepAutoresponse =
    "Thank you for connecting with Zaidi Consulting Group. AEP is approaching — reply to this email or contact us at Connect@zaidiconsultinggroup.com to claim 10% off your first insurance campaign. We will follow up shortly.";

  const showAepPopup = () => {
    if (sessionStorage.getItem(aepStorageKey) === "1") return;

    const root = document.createElement("div");
    root.className = "aep-popup";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "aep-popup-title");
    root.innerHTML = `
      <button class="aep-popup-backdrop" type="button" aria-label="Dismiss offer"></button>
      <div class="aep-popup-dialog">
        <button class="aep-popup-close" type="button" aria-label="Close">&times;</button>
        <p class="aep-popup-kicker">Annual Enrollment Period</p>
        <h2 id="aep-popup-title">AEP is Approaching</h2>
        <p class="aep-popup-copy">
          Enter email below to receive <strong>10% off</strong> first campaign.
        </p>
        <form class="aep-popup-form" id="aep-popup-form" novalidate>
          <label class="aep-popup-label" for="aep-popup-email">Email</label>
          <input
            id="aep-popup-email"
            class="aep-popup-input"
            type="email"
            name="email"
            placeholder="Enter your email"
            autocomplete="email"
            inputmode="email"
            required
          />
          <button class="btn btn-primary" type="submit" id="aep-popup-submit">
            Get 10% Off
          </button>
          <p class="aep-popup-status" id="aep-popup-status" role="status" hidden></p>
        </form>
      </div>
    `;

    document.body.appendChild(root);

    const close = () => {
      root.classList.remove("is-open");
      document.body.classList.remove("aep-popup-open");
      sessionStorage.setItem(aepStorageKey, "1");
      window.setTimeout(() => root.remove(), 320);
    };

    const form = root.querySelector("#aep-popup-form");
    const emailInput = root.querySelector("#aep-popup-email");
    const submitBtn = root.querySelector("#aep-popup-submit");
    const status = root.querySelector("#aep-popup-status");

    const markSuccess = () => {
      if (!status || !form || !emailInput || !submitBtn) return;
      status.hidden = false;
      status.className = "aep-popup-status is-success";
      status.textContent =
        "Success! Check your email for your 10% off confirmation. We’ll be in touch soon.";
      emailInput.disabled = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitted";
      sessionStorage.setItem(aepStorageKey, "1");
      window.setTimeout(close, 3200);
    };

    const submitViaIframe = (email) =>
      new Promise((resolve, reject) => {
        const frameName = "aep_submit_frame_" + Date.now();
        const iframe = document.createElement("iframe");
        iframe.name = frameName;
        iframe.title = "AEP offer submission";
        iframe.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden;";
        document.body.appendChild(iframe);

        const postForm = document.createElement("form");
        postForm.method = "POST";
        postForm.action = "https://formsubmit.co/Connect@zaidiconsultinggroup.com";
        postForm.target = frameName;
        postForm.style.display = "none";

        const fields = {
          email,
          _subject: "AEP 10% Off Campaign Request",
          Offer: "AEP 10% off first campaign",
          _template: "table",
          _captcha: "false",
          _autoresponse: aepAutoresponse,
          _replyto: email,
        };

        Object.entries(fields).forEach(([name, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          postForm.appendChild(input);
        });

        document.body.appendChild(postForm);

        let settled = false;
        const finish = (ok) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          postForm.remove();
          iframe.remove();
          if (ok) resolve();
          else reject(new Error("iframe submit failed"));
        };

        iframe.addEventListener("load", () => finish(true));
        const timer = window.setTimeout(() => finish(true), 1800);
        postForm.submit();
      });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!emailInput || !submitBtn || !status) return;

      const email = emailInput.value.trim();
      if (!email || !emailInput.checkValidity()) {
        status.hidden = false;
        status.className = "aep-popup-status is-error";
        status.textContent = "Please enter a valid email address.";
        emailInput.focus();
        return;
      }

      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      status.hidden = true;

      const body = new FormData();
      body.append("email", email);
      body.append("_subject", "AEP 10% Off Campaign Request");
      body.append("Offer", "AEP 10% off first campaign");
      body.append("_template", "table");
      body.append("_captcha", "false");
      body.append("_autoresponse", aepAutoresponse);
      body.append("_replyto", email);

      try {
        const response = await fetch(aepEndpoint, {
          method: "POST",
          body,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("ajax failed");
        markSuccess();
      } catch (_err) {
        try {
          await submitViaIframe(email);
          markSuccess();
        } catch (_iframeErr) {
          status.hidden = false;
          status.className = "aep-popup-status is-error";
          status.textContent =
            "We couldn’t send that just now. Please email Connect@zaidiconsultinggroup.com.";
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel || "Get 10% Off";
        }
      }
    });

    root.querySelector(".aep-popup-close")?.addEventListener("click", close);
    root.querySelector(".aep-popup-backdrop")?.addEventListener("click", close);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.classList.contains("is-open")) close();
    });

    window.setTimeout(() => {
      document.body.classList.add("aep-popup-open");
      root.classList.add("is-open");
      emailInput?.focus();
    }, 400);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showAepPopup);
  } else {
    showAepPopup();
  }

  const initChatWidget = () => {
    if (document.querySelector(".chat-widget")) return;

    const refusalMessage =
      "I’m sorry, I cannot answer that. I focus on Zaidi Consulting Group topics — healthcare, insurance, medical billing / revenue cycle, performance marketing, remote staffing, and related content from our website.";

    const conversation = [];
    const siteKnowledge = String(window.ZCG_SITE_KNOWLEDGE || "").slice(0, 45000);

    const systemPrompt = [
      "You are the official conversational AI assistant for Zaidi Consulting Group (ZCG), custom-tailored for https://www.zaidiconsultinggroup.com.",
      "Founded in 2022. Contact: Connect@zaidiconsultinggroup.com | +1 512.851.9610",
      "",
      "PURPOSE:",
      "- Hold natural, multi-turn conversations with website visitors.",
      "- Answer questions about ZCG services, articles, company info, and all website content.",
      "- Help with related healthcare, insurance, medical billing / RCM, performance marketing / demand generation, remote staffing, healthcare finance/operations, AEP, Medicare/ACA/Final Expense, and practical industry context.",
      "",
      "KNOWLEDGE PRIORITY:",
      "1) Prefer official ZCG website content below when answering about ZCG.",
      "2) Use general industry knowledge for related healthcare/insurance/billing/marketing/staffing questions.",
      "3) If you use external/general knowledge beyond the site, say so briefly and keep advice practical (not legal/medical advice).",
      "4) Never invent ZCG client results, pricing, or guarantees. Pricing depends on scope — invite contact.",
      "",
      "STYLE:",
      "- Be analytical, clear, warm, and conversational.",
      "- Remember prior turns and continue the thread naturally.",
      "- Prefer structured answers (short paragraphs + bullets) when helpful.",
      "- Keep replies focused; ask a clarifying question when the request is ambiguous.",
      "",
      "SCOPE / REFUSAL:",
      "- Stay on ZCG + healthcare/insurance/billing/marketing/staffing/finance-operations topics and website content.",
      "- If a question is clearly unrelated (sports scores, entertainment gossip, homework coding, recipes, etc.), reply EXACTLY:",
      refusalMessage,
      "",
      "WEBSITE CONTENT (source of truth for ZCG):",
      siteKnowledge || "(Site knowledge file not loaded — use known ZCG services: Revenue Cycle, Performance Marketing, Remote Staffing.)",
    ].join("\n");

    const widget = document.createElement("div");
    widget.className = "chat-widget";
    widget.innerHTML = `
      <div class="chat-panel" id="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title">
        <div class="chat-header">
          <div class="chat-header-copy">
            <div class="chat-header-top">
              <h2 id="chat-title">ZCG Assistant</h2>
              <span class="chat-live-pill" aria-hidden="true">Live</span>
            </div>
            <p>Healthcare · Insurance · Billing · Marketing · Staffing</p>
          </div>
          <button class="chat-close" type="button" aria-label="Close chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
        <div class="chat-quick" id="chat-quick" aria-label="Suggested questions">
          <button type="button" data-quick="What services does Zaidi Consulting Group offer?">Our services</button>
          <button type="button" data-quick="How does ZCG improve medical billing and reduce claim denials?">Medical billing</button>
          <button type="button" data-quick="How does performance marketing and high-intent call generation work at ZCG?">Marketing</button>
          <button type="button" data-quick="How can remote staffing help a healthcare organization scale?">Staffing</button>
        </div>
        <form class="chat-composer" id="chat-form">
          <div class="chat-composer-row chat-composer-main">
            <label class="chat-sr-only" for="chat-message">Your question</label>
            <textarea id="chat-message" name="message" rows="2" placeholder="Ask anything about our services or healthcare operations..." required></textarea>
            <button class="btn btn-primary" type="submit" id="chat-submit">Send</button>
          </div>
          <details class="chat-handoff">
            <summary>Email the team</summary>
            <div class="chat-handoff-fields">
              <label class="chat-sr-only" for="chat-email">Email</label>
              <input id="chat-email" name="email" type="email" placeholder="you@company.com" autocomplete="email" />
              <button class="btn btn-outline" type="button" id="chat-handoff-btn">Send follow-up</button>
            </div>
          </details>
          <p class="chat-status" id="chat-status" hidden></p>
        </form>
      </div>
      <button class="chat-launcher" type="button" aria-expanded="false" aria-controls="chat-panel">
        <svg class="chat-launcher-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4.5 6.75h15a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H9l-3.75 3v-3H4.5a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Z" />
        </svg>
        <span class="chat-launcher-label">Live chat</span>
      </button>
    `;

    document.body.appendChild(widget);

    const panel = widget.querySelector("#chat-panel");
    const launcher = widget.querySelector(".chat-launcher");
    const closeBtn = widget.querySelector(".chat-close");
    const messages = widget.querySelector("#chat-messages");
    const form = widget.querySelector("#chat-form");
    const emailInput = widget.querySelector("#chat-email");
    const messageInput = widget.querySelector("#chat-message");
    const submitBtn = widget.querySelector("#chat-submit");
    const handoffBtn = widget.querySelector("#chat-handoff-btn");
    const status = widget.querySelector("#chat-status");
    const quickWrap = widget.querySelector("#chat-quick");

    const escapeHtml = (value) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const formatReply = (text) => {
      const escaped = escapeHtml(String(text || "").trim());
      return escaped
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^### (.+)$/gm, '<div class="chat-md-h">$1</div>')
        .replace(/^## (.+)$/gm, '<div class="chat-md-h">$1</div>')
        .replace(/^- (.+)$/gm, "<div>• $1</div>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>");
    };

    const addBubble = (text, who, asHtml = false) => {
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble is-" + who;
      if (asHtml) bubble.innerHTML = text;
      else bubble.textContent = text;
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    };

    const addTyping = () => {
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble is-bot is-typing";
      bubble.innerHTML = "<span></span><span></span><span></span>";
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    };

    const isGreetingOrMeta = (text) => {
      const t = text.trim();
      if (
        /^(hi|hello|hey|how are you|good\s+(morning|afternoon|evening)|thanks|thank\s+you|ok|okay|bye|goodbye|help|what can you (do|help with)|who are you)[!?.]*$/i.test(
          t
        )
      ) {
        return true;
      }
      return /(contact|email|phone|schedule|speak (to|with)|talk to|human|follow[- ]?up|zaidi|zcg|website|article|service)/i.test(
        t
      );
    };

    const isClearlyOffTopic = (text) => {
      const t = text.trim();
      if (!t) return true;
      if (isGreetingOrMeta(t)) return false;
      // Allow anything that looks related to ZCG / healthcare / insurance / business ops.
      if (
        /(health\s*care|healthcare|insurance|medical|bill|billing|revenue|cycle|rcm|claim|denial|collection|coding|cpt|icd|payer|reimburs|medicare|medicaid|\baca\b|aep|final\s*expense|enrollment|marketing|demand|lead|call\s*gen|campaign|attribution|staff|staffing|recruit|outsourc|bpo|clinic|hospital|provider|practice|finance|operations|consult|zaidi|zcg|article|website|roi|kpi|compliance|hipaa|underwrit|eligibility|prior\s*auth)/i.test(
          t
        )
      ) {
        return false;
      }
      // Clearly unrelated domains
      if (
        /(recipe|cook|football|nba|mlb|soccer|movie|netflix|celebrity|joke|horoscope|crypto\s*meme|python\s*game|leetcode|homework unrelated|weather in|lyrics)/i.test(
          t
        )
      ) {
        return true;
      }
      // Ambiguous: let the tailored LLM decide using system scope rules.
      return false;
    };

    const chatEndpoints = [
      window.ZCG_CHAT_ENDPOINT,
      "https://text.pollinations.ai/openai",
    ].filter(Boolean);

    const retrieveSiteContext = (question, limit = 3200) => {
      const knowledge = String(window.ZCG_SITE_KNOWLEDGE || "");
      if (!knowledge) return "";
      const words = (question.toLowerCase().match(/[a-z0-9]{4,}/g) || []).filter(
        (w, i, arr) => arr.indexOf(w) === i
      );
      const parts = knowledge.split("### ").filter(Boolean);
      const scored = parts
        .map((part) => {
          const low = part.toLowerCase();
          let score = 0;
          for (const w of words) if (low.includes(w)) score += 1;
          return { score, part: part.slice(0, 1600) };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      const joined = scored.map((item) => "### " + item.part).join("\n\n");
      return joined.slice(0, limit);
    };

    const buildLocalConversationalReply = (question) => {
      const ctx = retrieveSiteContext(question, 2800);
      const prior = conversation
        .slice(-4)
        .map((m) => m.role.toUpperCase() + ": " + m.content)
        .join("\n");
      const lower = question.toLowerCase();
      const lines = [];

      if (/^(hi|hello|hey)\b/i.test(question.trim())) {
        return "Hi — I’m the ZCG assistant. Ask me about our website, healthcare consulting, insurance operations, medical billing, performance marketing, or remote staffing, and we can keep the conversation going.";
      }
      if (/thank/i.test(lower) && lower.length < 40) {
        return "You’re welcome. What else would you like to explore — billing, marketing, staffing, or something from our articles?";
      }
      if (/contact|email|phone|schedule|follow[- ]?up/i.test(lower)) {
        return "You can reach Zaidi Consulting Group at **Connect@zaidiconsultinggroup.com** or **+1 512.851.9610**. You can also use “Email the team” in this chat, or visit /contact/.";
      }
      if (/pric|cost|how much|quote/i.test(lower)) {
        return "Pricing depends on scope, volume, and which services you need (billing, marketing, staffing, or a mix). We don’t publish fixed public rates. Share your goals at **Connect@zaidiconsultinggroup.com** and the team can scope a tailored plan.";
      }

      lines.push("Here’s a clear take based on Zaidi Consulting Group’s website and services:");
      lines.push("");

      if (/denial|claim|billing|revenue|rcm|collection|coding/i.test(lower)) {
        lines.push("**Medical Billing / Revenue Cycle**");
        lines.push("ZCG helps clinics and healthcare operators improve billing accuracy, reduce denials, strengthen collections, and install reporting/process discipline. Engagements usually start with assessment, then move into practical workflow fixes and team enablement.");
      } else if (/market|campaign|aep|medicare|aca|call|demand|lead/i.test(lower)) {
        lines.push("**Performance Marketing / Demand Generation**");
        lines.push("ZCG focuses on measurable growth — channel strategy, creative testing, attribution, and pre-qualified high-intent calls across Medicare, ACA, Final Expense, and custom verticals, including AEP readiness.");
      } else if (/staff|remote|hiring|recruit|outsourc/i.test(lower)) {
        lines.push("**Remote Staffing**");
        lines.push("ZCG designs remote staffing models with clear roles, sourcing/onboarding support, and productivity systems so healthcare/insurance teams can scale capacity without losing quality.");
      } else if (/article|insight|blog/i.test(lower)) {
        lines.push("**Articles & insights**");
        lines.push("Our /articles/ library covers denials, collections, call campaigns, marketing ROI, and remote team design. Ask about a topic and I’ll pull the most relevant points.");
      } else {
        lines.push("**Zaidi Consulting Group** supports healthcare and insurance organizations with Medical Billing / RCM, Performance Marketing & Demand Generation, and Remote Staffing.");
      }

      if (ctx) {
        lines.push("");
        lines.push("From our site content:");
        // keep short excerpt bullets
        const excerpt = ctx
          .replace(/### /g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 700);
        lines.push(excerpt);
      }

      if (prior) {
        lines.push("");
        lines.push("I’m keeping our thread in mind — ask a follow-up and I’ll go deeper on the same topic.");
      }

      lines.push("");
      lines.push("Next step: tell me your organization type and goal, or email **Connect@zaidiconsultinggroup.com**.");
      return lines.join("\n");
    };

    const extractAssistantText = (data) => {
      if (!data) return "";
      if (typeof data === "string") return data;
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content.map((part) => (typeof part === "string" ? part : part?.text || "")).join("");
      }
      return data?.choices?.[0]?.delta?.content || data?.content || "";
    };

    const callLlm = async (messagesForModel, { stream = true, endpoint } = {}) => {
      const url = endpoint || chatEndpoints[0];
      const isWorker = /workers\.dev|ZCG_CHAT|\/chat$/i.test(url) || Boolean(window.ZCG_CHAT_ENDPOINT && url === window.ZCG_CHAT_ENDPOINT);
      const body = {
        model: window.ZCG_CHAT_MODEL || (isWorker ? "llama-3.3-70b-versatile" : "openai"),
        messages: messagesForModel,
        stream,
        temperature: 0.45,
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: stream ? "text/event-stream, application/json" : "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`LLM HTTP ${response.status}: ${errText.slice(0, 180)}`);
      }
      return response;
    };

    const readStream = async (response, onChunk) => {
      if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
        const data = await response.json();
        const text = extractAssistantText(data);
        if (text) onChunk(text, true);
        return text;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";
        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const piece =
              json?.choices?.[0]?.delta?.content ||
              json?.choices?.[0]?.message?.content ||
              "";
            if (piece) {
              full += piece;
              onChunk(full, false);
            }
          } catch (_err) {
            // ignore partial JSON frames
          }
        }
      }
      return full;
    };

    const fetchFreshSiteContext = async (question) => {
      const t = question.toLowerCase();
      let path = "";
      if (/revenue|billing|denial|claim|rcm|collection/.test(t)) path = "/services/revenue-cycle/";
      else if (/market|call|aep|medicare|aca|demand|campaign/.test(t))
        path = "/services/performance-marketing/";
      else if (/staff|remote|hiring|recruit/.test(t)) path = "/services/remote-staffing/";
      else if (/article|insight|blog/.test(t)) path = "/articles/";
      else if (/contact|email|phone|schedule/.test(t)) path = "/contact/";
      if (!path) return "";
      try {
        const response = await fetch(new URL(path, window.location.origin).href, {
          credentials: "omit",
        });
        if (!response.ok) return "";
        const html = await response.text();
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 2500);
        return text ? `\n\nLIVE PAGE CONTEXT (${path}):\n${text}` : "";
      } catch (_err) {
        return "";
      }
    };

    const askAssistant = async (question) => {
      status.hidden = true;

      if (isClearlyOffTopic(question)) {
        addBubble(refusalMessage, "bot");
        return;
      }

      const typing = addTyping();
      conversation.push({ role: "user", content: question });

      try {
        const fresh = await fetchFreshSiteContext(question);
        const retrieved = retrieveSiteContext(question);
        const compactSystem = [
          systemPrompt.split("WEBSITE CONTENT")[0].trim(),
          "",
          "RELEVANT WEBSITE EXCERPTS:",
          retrieved || "(Use known ZCG services and prior conversation.)",
          fresh,
        ]
          .join("\n")
          .slice(0, 9000);

        const messagesForModel = [
          { role: "system", content: compactSystem },
          ...conversation.slice(-12),
        ];

        let full = "";
        let answered = false;
        typing.remove();
        const bubble = addBubble("", "bot", true);

        for (const endpoint of chatEndpoints) {
          try {
            const response = await callLlm(messagesForModel, { stream: true, endpoint });
            full = await readStream(response, (text) => {
              bubble.innerHTML = formatReply(text);
              messages.scrollTop = messages.scrollHeight;
            });
            if (String(full || "").trim()) {
              answered = true;
              break;
            }
          } catch (_streamErr) {
            try {
              const response = await callLlm(messagesForModel, { stream: false, endpoint });
              const data = await response.json();
              full = extractAssistantText(data);
              if (String(full || "").trim()) {
                bubble.innerHTML = formatReply(full);
                answered = true;
                break;
              }
            } catch (_jsonErr) {
              // try next endpoint
            }
          }
        }

        if (!answered) {
          full = buildLocalConversationalReply(question);
          bubble.innerHTML = formatReply(full);
        }

        conversation.push({ role: "assistant", content: String(full).trim() });
        if (conversation.length > 24) conversation.splice(0, conversation.length - 24);
      } catch (err) {
        typing.remove();
        const fallback = buildLocalConversationalReply(question);
        addBubble(formatReply(fallback), "bot", true);
        conversation.push({ role: "assistant", content: fallback });
        console.error(err);
      }
    };

    const setOpen = (open) => {
      panel.classList.toggle("is-open", open);
      launcher.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-modal", String(open));
      if (open) {
        if (!messages.dataset.ready) {
          addBubble(
            "Hi — I’m the ZCG assistant. Ask me anything about our website, healthcare consulting, insurance operations, medical billing, performance marketing, or remote staffing. No sign-up needed.",
            "bot"
          );
          messages.dataset.ready = "1";
        }
        messageInput?.focus();
      }
    };

    launcher?.addEventListener("click", () => {
      setOpen(!panel.classList.contains("is-open"));
    });
    closeBtn?.addEventListener("click", () => setOpen(false));

    quickWrap?.querySelectorAll("button[data-quick]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const value = btn.getAttribute("data-quick") || "";
        if (!value || submitBtn.disabled) return;
        addBubble(value, "user");
        submitBtn.disabled = true;
        await askAssistant(value);
        submitBtn.disabled = false;
      });
    });

    messageInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form?.requestSubmit();
      }
    });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!messageInput || !submitBtn) return;
      const question = messageInput.value.trim();
      if (!question || submitBtn.disabled) return;
      addBubble(question, "user");
      messageInput.value = "";
      submitBtn.disabled = true;
      submitBtn.textContent = "Thinking...";
      await askAssistant(question);
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
      messageInput.focus();
    });

    handoffBtn?.addEventListener("click", async () => {
      if (!emailInput || !status) return;
      const email = emailInput.value.trim();
      const transcript = conversation
        .slice(-8)
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");
      const lastUser = [...conversation].reverse().find((m) => m.role === "user")?.content || "";
      if (!email || !emailInput.checkValidity()) {
        status.hidden = false;
        status.className = "chat-status is-error";
        status.textContent = "Enter a valid email for follow-up.";
        emailInput.focus();
        return;
      }

      handoffBtn.disabled = true;
      handoffBtn.textContent = "Sending...";
      const body = new FormData();
      body.append("email", email);
      body.append("message", transcript || lastUser || "Website chat follow-up request");
      body.append("_subject", "Live chat follow-up — Zaidi Consulting Group");
      body.append("Source", "ZCG LLM chatbox");
      body.append("_template", "table");
      body.append("_captcha", "false");
      body.append("_replyto", email);

      try {
        const response = await fetch(
          "https://formsubmit.co/ajax/Connect@zaidiconsultinggroup.com",
          {
            method: "POST",
            body,
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("handoff failed");
        status.hidden = false;
        status.className = "chat-status is-success";
        status.textContent = "Sent — our team will follow up by email.";
        addBubble("Thanks — I shared your conversation request with the ZCG team.", "bot");
      } catch (_err) {
        status.hidden = false;
        status.className = "chat-status is-error";
        status.textContent = "Couldn’t send follow-up. Email Connect@zaidiconsultinggroup.com.";
      } finally {
        handoffBtn.disabled = false;
        handoffBtn.textContent = "Send follow-up";
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  };


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();
