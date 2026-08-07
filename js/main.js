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
      "I’m sorry, I cannot answer that. I can only help with questions about Medical Billing / Revenue Cycle, Performance Marketing & Demand Generation, and Remote Staffing solutions.";

    const conversation = [];

    const serviceKnowledge = {
      company: {
        name: "Zaidi Consulting Group (ZCG)",
        founded: "2022",
        email: "Connect@zaidiconsultinggroup.com",
        phone: "+1 512.851.9610",
        site: "https://www.zaidiconsultinggroup.com",
        summary:
          "Zaidi Consulting Group is a healthcare and business consulting firm focused on Medical Billing / Revenue Cycle Management, Performance Marketing & Demand Generation, and Remote Staffing Solutions.",
      },
      billing: {
        title: "Medical Billing / Revenue Cycle Management",
        path: "/services/revenue-cycle/",
        overview:
          "ZCG helps healthcare providers, insurance organizations, and scaling operators strengthen billing accuracy, reduce denials, accelerate collections, and build reporting/process discipline across the revenue cycle.",
        delivers: [
          "Billing accuracy and claim workflow improvements",
          "Denial reduction and root-cause follow-through",
          "Collections optimization and AR discipline",
          "KPI reporting and performance visibility",
          "Process documentation and team enablement",
        ],
        fits: [
          "Clinics, practice groups, and care organizations",
          "Insurance and benefits operations teams",
          "Growing operators whose revenue processes need structure",
          "Leaders who want clearer financial accountability",
        ],
        approach:
          "Engagements typically start with operational assessment, then move into practical execution—clearer workflows, tighter controls, better reporting, and teams that can sustain results after the project ends.",
      },
      marketing: {
        title: "Performance Marketing / Demand Generation",
        path: "/services/performance-marketing/",
        overview:
          "ZCG builds performance marketing systems that prioritize lead quality, conversion, and ROI. A core capability is pre-qualified, high-intent call generation across established and custom verticals.",
        delivers: [
          "Channel strategy aligned to pipeline goals",
          "Creative testing and conversion optimization",
          "Analytics, attribution, and trusted reporting",
          "Pre-qualified high-intent inbound call generation",
          "AEP and seasonal campaign readiness support",
        ],
        verticals: ["Medicare", "ACA", "Final Expense", "Custom-tailored verticals"],
        fits: [
          "Healthcare marketers accountable for growth",
          "Insurance and agency enrollment/sales teams",
          "Operators who need measurable campaign ROI",
          "Teams preparing for AEP or enrollment surges",
        ],
        approach:
          "We align paid, organic, and lifecycle programs with clear KPIs and disciplined testing so leadership can see what is working and where to invest next.",
      },
      staffing: {
        title: "Remote Staffing Solutions",
        path: "/services/remote-staffing/",
        overview:
          "ZCG helps healthcare and insurance organizations design remote staffing models that extend capacity while protecting quality, ownership, and operating rhythm.",
        delivers: [
          "Workforce and role design",
          "Sourcing, screening, and onboarding support",
          "Productivity systems and handoff structure",
          "Flexible staffing models for growth or seasonal demand",
          "Quality and accountability frameworks for remote teams",
        ],
        fits: [
          "Growing healthcare operations teams",
          "Insurance and agency operators scaling support functions",
          "Leaders building hybrid or distributed models",
          "Teams with uneven or seasonal workload",
        ],
        approach:
          "We focus on practical staffing—not just headcount fills—so remote talent integrates cleanly into workflows and delivers measurable output.",
      },
    };

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
      return /(medical\s*bill|revenue\s*cycle|\brcm\b|claim|denial|collections?|medical\s*cod|cpt\b|icd[- ]?10|accounts?\s*receivable|\bar\b|billing|reimburs|payer|eligibility|prior\s*auth|performance\s*market|demand\s*gen|lead\s*gen|call\s*gen|pre-?qualified\s*call|aep\b|medicare|medicaid|\baca\b|final\s*expense|insurance\s*(lead|call|market|campaign)|paid\s*media|\bppc\b|attribution|campaign\s*(strategy|performance|roi)|remote\s*staff|staffing|healthcare\s*staff|outsourc|\bbpo\b|recruit|virtual\s*assistant|agent\s*(team|staff)|healthcare\s*(ops|operations|finance|business)|health\s*care\s*(ops|operations|finance|business)|provider\s*(group|ops|billing)|medical\s*practice|clinic\s*(billing|staff|ops)|hospital\s*(billing|staff|rcm)|enrollment|underwrit)/i.test(
        t
      );
    };

    const detectIntent = (text) => {
      const t = text.toLowerCase();
      if (/^(thanks|thank you|ok|okay|bye|goodbye)[!?.]*$/i.test(text.trim())) return "thanks";
      if (/^(hi|hello|hey|how are you|good\s+(morning|afternoon|evening))[!?.]*$/i.test(text.trim()))
        return "greeting";
      if (/what can you (do|help with)|who are you|^help[!?.]*$/i.test(t)) return "capabilities";
      if (/contact|email|phone|schedule|speak (to|with)|talk to|human|follow[- ]?up/i.test(t))
        return "contact";
      if (/pric|cost|rate|how much|quote|proposal/i.test(t)) return "pricing";
      if (/aep|open enrollment|medicare advantage season/i.test(t)) return "aep";
      if (
        /medical\s*bill|revenue\s*cycle|\brcm\b|claim|denial|collection|coding|cpt|icd|accounts?\s*receivable|\bar\b|billing|reimburs|payer|eligibility|prior\s*auth/i.test(
          t
        )
      ) {
        return "billing";
      }
      if (
        /performance\s*market|demand\s*gen|lead\s*gen|call\s*gen|pre-?qualified|campaign|attribution|paid\s*media|\bppc\b|\baca\b|final\s*expense|medicare|medicaid|insurance\s*(lead|call|market)/i.test(
          t
        )
      ) {
        return "marketing";
      }
      if (
        /remote\s*staff|staffing|healthcare\s*staff|outsourc|\bbpo\b|recruit|virtual\s*assistant|agent\s*(team|staff)|hire|hiring/i.test(
          t
        )
      ) {
        return "staffing";
      }
      if (/your services|what (services|do you offer)|zaidi|zcg/i.test(t)) return "overview";
      return "overview";
    };

    const bullets = (items) => items.map((item) => `- ${item}`).join("\n");

    const serviceAnswer = (key, question) => {
      const service = serviceKnowledge[key];
      const wantsWho = /who|for whom|ideal|fit/i.test(question);
      const wantsHow = /how|approach|process|work|deliver/i.test(question);
      const wantsWhat = /what|include|offer|cover|service/i.test(question) || (!wantsWho && !wantsHow);

      const parts = [`**${service.title}**`, "", service.overview];

      if (wantsWhat || wantsHow) {
        parts.push("", "**What we typically deliver:**", bullets(service.delivers));
      }
      if (key === "marketing" && service.verticals) {
        parts.push("", "**Call-generation verticals:**", bullets(service.verticals));
      }
      if (wantsWho) {
        parts.push("", "**Best fit for:**", bullets(service.fits));
      }
      if (wantsHow || /approach|process/i.test(question)) {
        parts.push("", "**How we approach it:**", service.approach);
      }

      parts.push(
        "",
        `More detail: ${service.path}`,
        "",
        "If you want a scoped recommendation for your organization, email Connect@zaidiconsultinggroup.com or use “Email the team” below."
      );
      return parts.join("\n");
    };

    const buildLocalAnswer = (question) => {
      const intent = detectIntent(question);
      const c = serviceKnowledge.company;

      if (intent === "greeting") {
        return "Hi — ask me about Medical Billing / Revenue Cycle, Performance Marketing & Demand Generation, or Remote Staffing, and I’ll give you a clear answer.";
      }
      if (intent === "thanks") {
        return "You’re welcome. If you have another question about billing, marketing, or staffing, I’m here.";
      }
      if (intent === "capabilities") {
        return [
          "I can help with Zaidi Consulting Group’s three service areas:",
          "",
          "- **Medical Billing / Revenue Cycle** — billing accuracy, denials, collections, reporting",
          "- **Performance Marketing / Demand Generation** — campaigns, ROI, pre-qualified calls, AEP",
          "- **Remote Staffing** — role design, sourcing, onboarding, productivity systems",
          "",
          "Ask a specific question in those areas and I’ll walk through a practical answer.",
        ].join("\n");
      }
      if (intent === "contact") {
        return [
          `You can reach Zaidi Consulting Group at **${c.email}** or **${c.phone}**.`,
          "",
          "Or open “Email the team” in this chat and leave your email for a follow-up.",
          "",
          "Website contact page: /contact/",
        ].join("\n");
      }
      if (intent === "pricing") {
        return [
          "Pricing depends on scope, volume, and the service mix (billing, marketing, staffing, or a combination).",
          "",
          "We don’t publish one-size-fits-all rates here because engagements are tailored.",
          "",
          `Share your goals with the team at **${c.email}** or use “Email the team” below for a scoped conversation.`,
        ].join("\n");
      }
      if (intent === "aep") {
        return [
          "**AEP campaign readiness** sits inside our Performance Marketing / Demand Generation work.",
          "",
          "Before AEP, teams usually need:",
          "- Clear qualification criteria and offer positioning",
          "- Call handling / enrollment capacity planned for volume spikes",
          "- Creative and channel tests ready to scale what converts",
          "- Tracking so cost-per-qualified-call and conversion stay visible",
          "",
          "ZCG supports pre-qualified high-intent calls (Medicare, ACA, Final Expense, and custom verticals) plus campaign strategy and reporting.",
          "",
          "Details: /services/performance-marketing/",
          "",
          `For AEP planning help, contact **${c.email}**.`,
        ].join("\n");
      }
      if (intent === "billing") return serviceAnswer("billing", question);
      if (intent === "marketing") return serviceAnswer("marketing", question);
      if (intent === "staffing") return serviceAnswer("staffing", question);

      return [
        `**${c.name}** helps healthcare and insurance organizations with three connected service lines:`,
        "",
        "1. **Medical Billing / Revenue Cycle** — cleaner claims, fewer denials, stronger collections",
        "2. **Performance Marketing / Demand Generation** — measurable campaigns and pre-qualified calls",
        "3. **Remote Staffing** — flexible remote teams with clear ownership and quality",
        "",
        "Ask about any one of those and I’ll go deeper. Contact: Connect@zaidiconsultinggroup.com · +1 512.851.9610",
      ].join("\n");
    };

    const fetchSiteSnippet = async (path) => {
      try {
        const url = new URL(path, window.location.origin).href;
        const response = await fetch(url, { credentials: "omit" });
        if (!response.ok) return "";
        const html = await response.text();
        return html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 1200);
      } catch (_err) {
        return "";
      }
    };

    const askAssistant = async (question) => {
      status.hidden = true;

      if (!isOnTopic(question)) {
        addBubble(refusalMessage, "bot");
        return;
      }

      const typing = addTyping();
      conversation.push({ role: "user", content: question });

      try {
        // Small delay so the typing indicator feels natural; no third-party sign-in.
        await new Promise((resolve) => setTimeout(resolve, 280));

        let reply = buildLocalAnswer(question);
        const intent = detectIntent(question);
        const pathByIntent = {
          billing: "/services/revenue-cycle/",
          marketing: "/services/performance-marketing/",
          staffing: "/services/remote-staffing/",
          aep: "/services/performance-marketing/",
        };
        const path = pathByIntent[intent];
        if (path && /detail|more|page|site|exactly|specific/i.test(question)) {
          const snippet = await fetchSiteSnippet(path);
          if (snippet) {
            reply +=
              "\n\nI also pulled the live service page for extra context. If you need a tailored plan, the team can review your current workflows and goals.";
          }
        }

        typing.remove();
        addBubble(formatReply(reply), "bot", true);
        conversation.push({ role: "assistant", content: reply });
        if (conversation.length > 30) conversation.splice(0, conversation.length - 30);
      } catch (err) {
        typing.remove();
        addBubble(
          "I had trouble preparing a reply. Please try again, or email Connect@zaidiconsultinggroup.com.",
          "bot"
        );
        status.hidden = false;
        status.className = "chat-status is-error";
        status.textContent = "Assistant unavailable right now.";
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
            "Hi — I can help with Medical Billing / Revenue Cycle, Performance Marketing & Demand Generation, and Remote Staffing. No sign-up needed — just ask a question.",
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
      body.append("message", lastUser || "Website chat follow-up request");
      body.append("_subject", "Live chat follow-up — Zaidi Consulting Group");
      body.append("Source", "Website chatbox");
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
