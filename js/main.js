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

  const loadPuter = () =>
    new Promise((resolve, reject) => {
      if (window.puter?.ai?.chat) {
        resolve(window.puter);
        return;
      }
      const existing = document.querySelector('script[data-puter="1"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.puter), { once: true });
        existing.addEventListener("error", () => reject(new Error("Puter failed to load")), {
          once: true,
        });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.async = true;
      script.dataset.puter = "1";
      script.onload = () => resolve(window.puter);
      script.onerror = () => reject(new Error("Puter failed to load"));
      document.head.appendChild(script);
    });

  const initChatWidget = () => {
    if (document.querySelector(".chat-widget")) return;

    const refusalMessage =
      "I’m sorry, I cannot answer that. I can only help with questions about Medical Billing / Revenue Cycle, Performance Marketing & Demand Generation, and Remote Staffing solutions.";

    const knowledge = `
You are the live AI assistant for Zaidi Consulting Group (ZCG), a healthcare and business consulting firm founded in 2022.
Website: https://www.zaidiconsultinggroup.com
Contact: Connect@zaidiconsultinggroup.com | +1 512.851.9610

STRICT SCOPE — answer ONLY topics in these areas:
1) Medical Billing / Revenue Cycle Management — billing accuracy, denials, collections, coding, claims, AR, reimbursement, payer workflows, reporting, process documentation, team enablement.
2) Performance Marketing / Demand Generation — channel strategy, creative testing, analytics, attribution, pre-qualified high-intent call generation (Medicare, ACA, Final Expense, and related verticals), AEP campaigns.
3) Remote Staffing / Healthcare Staffing — role design, sourcing/screening/onboarding, productivity systems, flexible staffing models for healthcare organizations.
Also allowed: brief greetings, and contact/scheduling questions about ZCG for the services above.
Related healthcare business/finance questions are allowed ONLY when they clearly support the three service areas above.

HARD REFUSAL RULE:
If a question is outside this scope (entertainment, sports, politics, recipes, general coding, homework, personal advice, unrelated news, or anything not tied to the services above), reply with EXACTLY this sentence and nothing else:
"${refusalMessage}"
Do not answer off-topic questions partially. Do not invent workarounds.

GUIDELINES:
- Be analytical, clear, and practical. Prefer structured reasoning over vague claims.
- Use the knowledge above first for ZCG service questions.
- For current market facts, regulations, benchmarks, or research inside scope, use web_search and/or fetch tools and cite briefly.
- Use fetch_site_page for live ZCG page wording when helpful.
- Keep replies concise (usually 2–6 short paragraphs or bullets). No fluff.
- Do not invent client results or pricing. Pricing depends on scope; invite them to contact the team.
- Relevant pages: /services/revenue-cycle/, /services/performance-marketing/, /services/remote-staffing/, /articles/, /contact/.
`.trim();

    const history = [{ role: "system", content: knowledge }];

    const siteTools = [
      {
        type: "function",
        function: {
          name: "fetch_site_page",
          description:
            "Fetch readable text from a Zaidi Consulting Group website page (path or full ZCG URL).",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description:
                  "Site path like /services/revenue-cycle/ or a full https://www.zaidiconsultinggroup.com URL",
              },
            },
            required: ["path"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "fetch_url",
          description:
            "Attempt to fetch readable text from a public HTTPS URL for research. Prefer web_search for broad external research.",
          parameters: {
            type: "object",
            properties: {
              url: { type: "string", description: "Public HTTPS URL to fetch" },
            },
            required: ["url"],
          },
        },
      },
    ];

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
            <p>Medical Billing · Performance Marketing · Remote Staffing</p>
          </div>
          <button class="chat-close" type="button" aria-label="Close chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
        <div class="chat-quick" id="chat-quick" aria-label="Suggested questions">
          <button type="button" data-quick="What does your Medical Billing / Revenue Cycle Management service include?">Medical Billing</button>
          <button type="button" data-quick="How does Performance Marketing and demand generation work at ZCG?">Performance Marketing</button>
          <button type="button" data-quick="How can Remote Staffing help a healthcare organization scale?">Remote Staffing</button>
        </div>
        <form class="chat-composer" id="chat-form">
          <div class="chat-composer-row chat-composer-main">
            <label class="chat-sr-only" for="chat-message">Your question</label>
            <textarea id="chat-message" name="message" rows="2" placeholder="Ask about billing, marketing, or staffing..." required></textarea>
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
      const escaped = escapeHtml(text.trim());
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
      return /(contact|email|phone|schedule|speak (to|with)|talk to|human|follow[- ]?up|zaidi consulting|\bzaidi\b|\bzcg\b|your services|what (services|do you offer))/i.test(
        t
      );
    };

    const isOnTopic = (text) => {
      const t = text.trim();
      if (!t) return false;
      if (isGreetingOrMeta(t)) return true;
      // Strict allowlist: Medical Billing / RCM, Performance Marketing / Demand Gen, Remote Staffing,
      // plus closely related healthcare business & finance wording.
      return /(medical\s*bill|revenue\s*cycle|\brcm\b|claim|denial|collections?|medical\s*cod|cpt\b|icd[- ]?10|accounts?\s*receivable|\bar\b|billing|reimburs|payer|eligibility|prior\s*auth|performance\s*market|demand\s*gen|lead\s*gen|call\s*gen|pre-?qualified\s*call|aep\b|medicare|medicaid|\baca\b|final\s*expense|insurance\s*(lead|call|market|campaign)|paid\s*media|\bppc\b|attribution|campaign\s*(strategy|performance|roi)|remote\s*staff|staffing|healthcare\s*staff|outsourc|\bbpo\b|recruit|virtual\s*assistant|agent\s*(team|staff)|healthcare\s*(ops|operations|finance|business)|health\s*care\s*(ops|operations|finance|business)|provider\s*(group|ops|billing)|medical\s*practice|clinic\s*(billing|staff|ops)|hospital\s*(billing|staff|rcm)|enrollment|underwrit)/i.test(
        t
      );
    };

    const needsWebSearch = (text) =>
      /(latest|current|today|news|regulation|cms|benchmark|market|trend|statistic|data|research|compare|202[4-9]|aep dates|open enrollment|external|source|study|according|what is|how does|vs\.?|versus)/i.test(
        text
      );

    const extractText = (response) => {
      if (response == null) return "";
      if (typeof response === "string") return response;
      if (typeof response?.message?.content === "string") return response.message.content;
      if (Array.isArray(response?.message?.content)) {
        return response.message.content
          .map((part) => (typeof part === "string" ? part : part?.text || ""))
          .join("");
      }
      if (typeof response?.text === "string") return response.text;
      if (typeof response?.content === "string") return response.content;
      return String(response);
    };

    const htmlToText = (html) =>
      html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 9000);

    const isAllowedUrl = (urlString) => {
      try {
        const url = new URL(urlString, window.location.origin);
        if (url.protocol !== "https:" && url.protocol !== "http:") return false;
        const host = url.hostname.toLowerCase();
        return (
          host === window.location.hostname ||
          host === "www.zaidiconsultinggroup.com" ||
          host === "zaidiconsultinggroup.com" ||
          host === "zcgllc.github.io" ||
          host.endsWith(".gov") ||
          host.endsWith(".edu") ||
          host.includes("cms.gov") ||
          host.includes("healthcare.gov")
        );
      } catch (_err) {
        return false;
      }
    };

    const runTool = async (name, args) => {
      try {
        if (name === "fetch_site_page") {
          const path = String(args?.path || "").trim();
          if (!path) return "Missing path.";
          const url = new URL(path, window.location.origin).href;
          if (!isAllowedUrl(url)) return "That URL is not allowed for site fetch.";
          const response = await fetch(url, { credentials: "omit" });
          if (!response.ok) return `Failed to fetch page (${response.status}).`;
          return htmlToText(await response.text()) || "No readable text found.";
        }
        if (name === "fetch_url") {
          const url = String(args?.url || "").trim();
          if (!url || !isAllowedUrl(url)) {
            return "URL not allowed. Prefer web_search for general external research, or a .gov/.edu/ZCG URL.";
          }
          const response = await fetch(url, { credentials: "omit" });
          if (!response.ok) return `Failed to fetch URL (${response.status}).`;
          return htmlToText(await response.text()) || "No readable text found.";
        }
        return `Unknown tool: ${name}`;
      } catch (err) {
        return `Tool error: ${err?.message || "request failed"}`;
      }
    };

    const collectStream = async (response, onText) => {
      let full = "";
      const toolCalls = [];
      if (response && typeof response[Symbol.asyncIterator] === "function") {
        for await (const part of response) {
          if (part?.type === "tool_use" || part?.name) {
            toolCalls.push(part);
            continue;
          }
          const chunk =
            part?.text ||
            (part?.type === "text" ? part.text : "") ||
            part?.message?.content ||
            "";
          if (!chunk) continue;
          full += chunk;
          if (onText) onText(full);
        }
        return { full, toolCalls };
      }
      full = extractText(response);
      if (onText && full) onText(full);
      return { full, toolCalls };
    };

    const askAssistant = async (question) => {
      status.hidden = true;

      if (!isOnTopic(question)) {
        addBubble(refusalMessage, "bot");
        return;
      }

      const typing = addTyping();

      try {
        const puter = await loadPuter();
        history.push({ role: "user", content: question });

        const useSearch = needsWebSearch(question);
        const model = useSearch ? "openai/gpt-5.3-chat" : "gpt-5.4-nano";
        const tools = useSearch
          ? [{ type: "web_search" }, ...siteTools]
          : siteTools;

        const chatOnce = async (messages, opts) => {
          try {
            return await puter.ai.chat(messages, opts);
          } catch (_err) {
            const prompt =
              knowledge +
              "\n\nConversation so far:\n" +
              messages
                .filter((m) => m.role !== "system")
                .map((m) => {
                  if (m.role === "tool") return `TOOL(${m.name || "result"}): ${m.content}`;
                  return `${String(m.role).toUpperCase()}: ${m.content || ""}`;
                })
                .join("\n") +
              "\nASSISTANT:";
            return puter.ai.chat(prompt, opts);
          }
        };

        let options = { model, stream: true, temperature: 0.35, tools };
        let response;
        try {
          response = await chatOnce(history, options);
        } catch (_err) {
          options = { model: "gpt-5.4-nano", stream: true, temperature: 0.35, tools: siteTools };
          response = await chatOnce(history, options);
        }

        typing.remove();
        const bubble = addBubble("", "bot", true);
        let { full, toolCalls } = await collectStream(response, (text) => {
          bubble.innerHTML = formatReply(text);
          messages.scrollTop = messages.scrollHeight;
        });

        // Resolve custom tool calls (site/URL fetch), then ask the model again.
        if (toolCalls.length) {
          bubble.innerHTML = formatReply(full || "Researching…");
          const followMessages = history.slice();
          for (const call of toolCalls) {
            const name = call.name || call?.function?.name || "";
            const args =
              call.input ||
              (typeof call?.function?.arguments === "string"
                ? JSON.parse(call.function.arguments || "{}")
                : call?.function?.arguments || {});
            const result = await runTool(name, args);
            followMessages.push({
              role: "assistant",
              tool_calls: [
                {
                  id: call.id || `tool_${Date.now()}`,
                  type: "function",
                  function: { name, arguments: JSON.stringify(args || {}) },
                },
              ],
            });
            followMessages.push({
              role: "tool",
              tool_call_id: call.id || `tool_${Date.now()}`,
              name,
              content: result,
            });
          }
          const followUp = await chatOnce(followMessages, {
            model: options.model,
            stream: true,
            temperature: 0.35,
          });
          const second = await collectStream(followUp, (text) => {
            bubble.innerHTML = formatReply(text);
            messages.scrollTop = messages.scrollHeight;
          });
          full = second.full || full;
        }

        if (!full.trim()) {
          bubble.textContent =
            "I couldn’t generate a reply just now. Please try again, or email Connect@zaidiconsultinggroup.com.";
        } else {
          history.push({ role: "assistant", content: full.trim() });
          // Keep history bounded for long sessions.
          if (history.length > 24) {
            history.splice(1, history.length - 21);
          }
        }
      } catch (err) {
        typing.remove();
        addBubble(
          "I had trouble connecting to the live assistant. Please try again in a moment, or email Connect@zaidiconsultinggroup.com. If a sign-in prompt appears, complete it to continue the AI chat.",
          "bot"
        );
        status.hidden = false;
        status.className = "chat-status is-error";
        status.textContent = "Live assistant unavailable right now.";
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
            "Hi — I can help with Medical Billing / Revenue Cycle, Performance Marketing & Demand Generation, and Remote Staffing. Ask a question in those areas and I’ll walk through a clear answer.",
            "bot"
          );
          messages.dataset.ready = "1";
          loadPuter().catch(() => {});
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
      const lastUser = [...history].reverse().find((m) => m.role === "user")?.content || "";
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
      body.append("message", lastUser || "Website chat follow-up request");
      body.append("_subject", "Live chat follow-up — Zaidi Consulting Group");
      body.append("Source", "Live AI chatbox");
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
        handoffBtn.textContent = "Email the team";
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
