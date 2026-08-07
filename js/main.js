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
      "I’m sorry, I can’t help with that. I advise on healthcare operations — medical billing / revenue cycle, insurance workflows, performance marketing, and remote staffing.";

    const conversation = [];

    const systemPrompt = [
      "You are Zaidi Consulting Group (ZCG) — speak as the owner/operator and an expert researcher in healthcare revenue cycle, insurance operations, performance marketing, and remote staffing.",
      "Founded 2022. Contact: Connect@zaidiconsultinggroup.com | +1 512.851.9610",
      "",
      "VOICE:",
      "- Use first-person plural (“we”, “our team”). Never say “according to the website”, “based on the site”, or “from our page”.",
      "- Sound like a seasoned consultant: precise, practical, confident, concise.",
      "- Lead with the direct answer, then give short structured detail (bullets).",
      "- For industry topics (prior auth, denials, AEP, etc.), give an expert explanation AND how we help.",
      "- Do not invent pricing, guarantees, or client results.",
      "",
      "SCOPE:",
      "Answer healthcare, insurance, medical billing/RCM, prior authorization, claims/denials, performance marketing/demand gen, remote staffing, and related operations.",
      "If clearly unrelated, reply with the refusal message only.",
    ].join("\n");

    const expertTopics = [
      {
        id: "prior_auth",
        match: /pre[-\s]?auth|prior\s*auth|preauthorization|authorization\s*request|auth\s*referral/i,
        title: "Prior Authorization",
        answer: [
          "**Prior authorization** (also called pre-authorization) is a payer requirement: before certain services, drugs, or procedures are delivered, the provider must get approval that medical necessity criteria are met.",
          "",
          "**Why it matters**",
          "- Missed or late auth is a major cause of denials and write-offs",
          "- Incomplete clinical packets delay care and cash",
          "- Poor tracking creates avoidable AR and patient friction",
          "",
          "**What a strong process looks like**",
          "1. Identify auth-required codes/payers before scheduling",
          "2. Submit complete clinical documentation the first time",
          "3. Track status to approval (or appeal) with clear owners",
          "4. Verify auth is valid on the date of service",
          "5. Tie auth outcomes into denial prevention reporting",
          "",
          "**How we help**",
          "We harden front-end revenue cycle workflows — eligibility, auth readiness, documentation standards, and denial root-cause loops — so fewer claims fail for preventable authorization issues.",
          "",
          "If you share your specialty and payer mix, I can outline a tighter auth checklist for your team.",
        ].join("\n"),
      },
      {
        id: "denials",
        match: /denial|denied\s*claim|reject|write[-\s]?off/i,
        title: "Claim Denials",
        answer: [
          "**Claim denials** happen when a payer refuses payment for a submitted claim. Most are preventable with cleaner front-end and coding controls.",
          "",
          "**Common root causes**",
          "- Eligibility / coverage issues",
          "- Missing or invalid prior authorization",
          "- Coding / modifier errors",
          "- Timely filing misses",
          "- Incomplete clinical or demographic data",
          "",
          "**Our approach**",
          "1. Segment denials by reason and payer",
          "2. Fix the upstream process that created them",
          "3. Standardize appeal playbooks for recoverable dollars",
          "4. Install KPI reporting so leakage is visible weekly",
          "",
          "We treat denials as a process problem first, not just a back-end chase.",
        ].join("\n"),
      },
      {
        id: "billing",
        match: /medical\s*bill|revenue\s*cycle|\brcm\b|claim|collections?|accounts?\s*receivable|\bar\b|coding|cpt|icd|reimburs|eligibility|payer/i,
        title: "Medical Billing / Revenue Cycle",
        answer: [
          "**Medical billing / revenue cycle** is the full path from patient intake to clean payment: eligibility, authorization, coding, claim submission, denial management, and collections.",
          "",
          "**Where we focus**",
          "- Billing accuracy and cleaner claim submission",
          "- Denial reduction and root-cause correction",
          "- Collections / AR discipline",
          "- KPI reporting leadership can trust",
          "- Process documentation and team enablement",
          "",
          "**How engagements usually run**",
          "We assess current leakage points, redesign the workflow, then execute with clear owners and reporting so results hold after the project ends.",
        ].join("\n"),
      },
      {
        id: "marketing",
        match: /performance\s*market|demand\s*gen|lead\s*gen|call\s*gen|pre-?qualified|campaign|attribution|paid\s*media|\bppc\b|aep|medicare|medicaid|\baca\b|final\s*expense/i,
        title: "Performance Marketing",
        answer: [
          "**Performance marketing** for healthcare and insurance is about qualified pipeline — not vanity traffic.",
          "",
          "**What we deliver**",
          "- Channel strategy tied to enrollment/sales outcomes",
          "- Creative testing and conversion optimization",
          "- Attribution and leadership-ready reporting",
          "- Pre-qualified, high-intent inbound calls",
          "",
          "**Core call verticals**",
          "- Medicare",
          "- ACA",
          "- Final Expense",
          "- Custom verticals built around your offer and geography",
          "",
          "For AEP or enrollment spikes, we align creative, qualification rules, and call capacity so volume converts instead of overflowing the team.",
        ].join("\n"),
      },
      {
        id: "staffing",
        match: /remote\s*staff|staffing|healthcare\s*staff|outsourc|\bbpo\b|recruit|virtual\s*assistant|hiring|hire/i,
        title: "Remote Staffing",
        answer: [
          "**Remote staffing** works when roles, handoffs, and accountability are designed before headcount is added.",
          "",
          "**What we build**",
          "- Role design and ownership clarity",
          "- Sourcing, screening, and onboarding support",
          "- Productivity systems and quality controls",
          "- Flexible models for growth or seasonal demand",
          "",
          "We help healthcare and insurance teams scale capacity without losing service quality or operational control.",
        ].join("\n"),
      },
      {
        id: "services",
        match: /services?|what do you (do|offer)|who are you|about zcg|zaidi|overview/i,
        title: "Our Services",
        answer: [
          "We’re **Zaidi Consulting Group**. We help healthcare and insurance organizations improve three connected areas:",
          "",
          "1. **Medical Billing / Revenue Cycle** — cleaner claims, fewer denials, stronger collections",
          "2. **Performance Marketing** — measurable campaigns and pre-qualified high-intent calls",
          "3. **Remote Staffing** — flexible remote teams with clear ownership and quality",
          "",
          "Ask about any one of those and I’ll go deep on process, pitfalls, and how we’d approach it.",
        ].join("\n"),
      },
      {
        id: "contact",
        match: /contact|email|phone|schedule|speak|talk to|follow[- ]?up/i,
        title: "Contact",
        answer: [
          "Reach us directly:",
          "",
          "- **Email:** Connect@zaidiconsultinggroup.com",
          "- **Phone:** +1 512.851.9610",
          "",
          "Or use **Email the team** below and we’ll follow up.",
        ].join("\n"),
      },
      {
        id: "pricing",
        match: /pric|cost|how much|quote|proposal|rate card/i,
        title: "Pricing",
        answer: [
          "Pricing depends on scope, volume, and which service line you need (billing, marketing, staffing, or a mix).",
          "",
          "We don’t publish one-size-fits-all rates because engagements are tailored. Share your goals at **Connect@zaidiconsultinggroup.com** and we’ll scope a practical plan.",
        ].join("\n"),
      },
    ];

    const widget = document.createElement("div");
    widget.className = "chat-widget";
    widget.innerHTML = `
      <div class="chat-panel" id="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title">
        <div class="chat-header">
          <div class="chat-header-copy">
            <div class="chat-header-top">
              <h2 id="chat-title">ZCG Expert Chat</h2>
              <span class="chat-live-pill" aria-hidden="true">Live</span>
            </div>
            <p>Billing · Insurance · Marketing · Staffing</p>
          </div>
          <button class="chat-close" type="button" aria-label="Close chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
        <div class="chat-quick" id="chat-quick" aria-label="Suggested questions">
          <button type="button" data-quick="Tell me about prior authorization">Prior auth</button>
          <button type="button" data-quick="How do you reduce claim denials?">Denials</button>
          <button type="button" data-quick="How does performance marketing and call generation work?">Marketing</button>
          <button type="button" data-quick="How can remote staffing help us scale?">Staffing</button>
        </div>
        <form class="chat-composer" id="chat-form">
          <div class="chat-composer-row chat-composer-main">
            <label class="chat-sr-only" for="chat-message">Your question</label>
            <textarea id="chat-message" name="message" rows="2" placeholder="Ask about prior auth, denials, marketing, staffing..." required></textarea>
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
        .replace(/^\d+\.\s+(.+)$/gm, '<div class="chat-li"><span class="chat-li-mark">•</span><span>$1</span></div>')
        .replace(/^[-•]\s+(.+)$/gm, '<div class="chat-li"><span class="chat-li-mark">•</span><span>$1</span></div>')
        .replace(/\n{2,}/g, '<div class="chat-gap"></div>')
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
      return /(contact|email|phone|schedule|speak (to|with)|talk to|human|follow[- ]?up|zaidi|zcg|service)/i.test(
        t
      );
    };

    const isClearlyOffTopic = (text) => {
      const t = text.trim();
      if (!t) return true;
      if (isGreetingOrMeta(t)) return false;
      if (
        /(health\s*care|healthcare|insurance|medical|bill|billing|revenue|cycle|rcm|claim|denial|collection|coding|cpt|icd|payer|reimburs|medicare|medicaid|\baca\b|aep|final\s*expense|enrollment|marketing|demand|lead|call\s*gen|campaign|attribution|staff|staffing|recruit|outsourc|bpo|clinic|hospital|provider|practice|finance|operations|consult|zaidi|zcg|article|roi|kpi|compliance|hipaa|underwrit|eligibility|prior\s*auth|pre[-\s]?auth|preauthorization|authorization)/i.test(
          t
        )
      ) {
        return false;
      }
      if (
        /(recipe|cook|football|nba|mlb|soccer|movie|netflix|celebrity|joke|horoscope|leetcode|lyrics)/i.test(
          t
        )
      ) {
        return true;
      }
      return false;
    };

    const findExpertTopic = (question) => {
      for (const topic of expertTopics) {
        if (topic.match.test(question)) return topic;
      }
      return null;
    };

    const buildExpertReply = (question) => {
      const lower = question.toLowerCase().trim();
      if (/^(hi|hello|hey|good\s+(morning|afternoon|evening))\b/i.test(lower)) {
        return "Hi — I’m with Zaidi Consulting Group. Ask me about prior authorization, denials, medical billing, performance marketing, or remote staffing, and I’ll give you a clear expert answer.";
      }
      if (/^(thanks|thank you)\b/i.test(lower)) {
        return "Glad to help. What should we dig into next?";
      }

      const topic = findExpertTopic(question);
      if (topic) return topic.answer;

      // Follow-up awareness using last assistant topic keywords
      const lastAssistant = [...conversation].reverse().find((m) => m.role === "assistant")?.content || "";
      if (/more|deeper|explain|how|why|example/i.test(lower) && lastAssistant) {
        const follow = findExpertTopic(lastAssistant);
        if (follow) {
          return (
            follow.answer +
            "\n\nIf you want this applied to your operation, tell me your specialty, monthly claim volume, or growth goal."
          );
        }
      }

      return [
        "I can help with the areas we specialize in:",
        "",
        "- **Prior authorization & revenue cycle**",
        "- **Claim denials and collections**",
        "- **Performance marketing / high-intent calls**",
        "- **Remote staffing for healthcare teams**",
        "",
        "Ask a specific question — for example: “How should a clinic run prior auth?” — and I’ll answer precisely.",
      ].join("\n");
    };

    const chatEndpoint = window.ZCG_CHAT_ENDPOINT || "";

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

    const callWorkerLlm = async (messagesForModel, { stream = true } = {}) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(chatEndpoint, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: stream ? "text/event-stream, application/json" : "application/json",
          },
          body: JSON.stringify({
            model: window.ZCG_CHAT_MODEL || "llama-3.1-8b-instant",
            messages: messagesForModel,
            stream,
            temperature: 0.35,
          }),
        });
        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`LLM HTTP ${response.status}: ${errText.slice(0, 160)}`);
        }
        return response;
      } finally {
        clearTimeout(timer);
      }
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

    const askAssistant = async (question) => {
      status.hidden = true;

      if (isClearlyOffTopic(question)) {
        addBubble(refusalMessage, "bot");
        return;
      }

      const typing = addTyping();
      conversation.push({ role: "user", content: question });

      try {
        // Fast path: expert answers instantly when no private LLM worker is configured.
        // This avoids slow/failing public LLM proxies.
        if (!chatEndpoint) {
          await new Promise((resolve) => setTimeout(resolve, 160));
          const reply = buildExpertReply(question);
          typing.remove();
          addBubble(formatReply(reply), "bot", true);
          conversation.push({ role: "assistant", content: reply });
          if (conversation.length > 24) conversation.splice(0, conversation.length - 24);
          return;
        }

        const messagesForModel = [
          { role: "system", content: systemPrompt },
          ...conversation.slice(-12),
        ];

        let full = "";
        typing.remove();
        const bubble = addBubble("", "bot", true);

        try {
          const response = await callWorkerLlm(messagesForModel, { stream: true });
          full = await readStream(response, (text) => {
            bubble.innerHTML = formatReply(text);
            messages.scrollTop = messages.scrollHeight;
          });
        } catch (_streamErr) {
          try {
            const response = await callWorkerLlm(messagesForModel, { stream: false });
            const data = await response.json();
            full = extractAssistantText(data);
            bubble.innerHTML = formatReply(full);
          } catch (_err) {
            full = "";
          }
        }

        if (!String(full || "").trim()) {
          full = buildExpertReply(question);
          bubble.innerHTML = formatReply(full);
        }

        conversation.push({ role: "assistant", content: String(full).trim() });
        if (conversation.length > 24) conversation.splice(0, conversation.length - 24);
      } catch (err) {
        typing.remove();
        const fallback = buildExpertReply(question);
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
            "Hi — I’m with Zaidi Consulting Group. Ask about prior authorization, denials, medical billing, performance marketing, or remote staffing — I’ll answer as your operator and subject-matter expert.",
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
