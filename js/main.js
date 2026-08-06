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

    const faqReplies = [
      {
        keys: ["revenue", "rcm", "billing", "denial", "collections", "claim"],
        reply:
          "Our Revenue Cycle Management work helps improve billing accuracy, reduce denials, and strengthen collections. You can learn more on our Revenue Cycle page, or leave your email and question below and our team will follow up.",
      },
      {
        keys: ["marketing", "call", "campaign", "aep", "medicare", "aca", "lead"],
        reply:
          "Performance Marketing at ZCG focuses on channel strategy, creative testing, analytics, and pre-qualified high-intent calls across different verticals. Share your question with your email and we’ll get back to you.",
      },
      {
        keys: ["staff", "staffing", "remote", "hire", "talent", "workforce"],
        reply:
          "Our Remote Staffing Solutions help healthcare organizations design roles, source talent, and manage quality for distributed teams. Send your question with your email and a teammate will reach out.",
      },
      {
        keys: ["price", "pricing", "cost", "quote", "rate"],
        reply:
          "Pricing depends on scope, volume, and timeline. Leave your email and a short note about what you need, and we’ll follow up with next steps.",
      },
      {
        keys: ["contact", "talk", "call me", "human", "team"],
        reply:
          "Happy to connect you with the team. Add your email below with your question, or visit the Contact Us page anytime.",
      },
    ];

    const widget = document.createElement("div");
    widget.className = "chat-widget";
    widget.innerHTML = `
      <div class="chat-panel" id="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>
        <div class="chat-header">
          <div>
            <h2 id="chat-title">Chat with ZCG</h2>
            <p>Ask a question — we’ll help or connect you with our team.</p>
          </div>
          <button class="chat-close" type="button" aria-label="Close chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
        <div class="chat-quick" id="chat-quick">
          <button type="button" data-quick="Tell me about Revenue Cycle Management">Revenue Cycle</button>
          <button type="button" data-quick="Tell me about Performance Marketing">Performance Marketing</button>
          <button type="button" data-quick="Tell me about Remote Staffing">Remote Staffing</button>
          <button type="button" data-quick="I want to talk with your team">Talk to the team</button>
        </div>
        <form class="chat-composer" id="chat-form">
          <div>
            <label for="chat-email">Email</label>
            <input id="chat-email" name="email" type="email" placeholder="you@company.com" autocomplete="email" required />
          </div>
          <div>
            <label for="chat-message">Your question</label>
            <div class="chat-composer-row">
              <textarea id="chat-message" name="message" rows="2" placeholder="Type your question..." required></textarea>
              <button class="btn btn-primary" type="submit" id="chat-submit">Send</button>
            </div>
          </div>
          <p class="chat-status" id="chat-status" hidden></p>
        </form>
      </div>
      <button class="chat-launcher" type="button" aria-expanded="false" aria-controls="chat-panel">
        <svg class="chat-launcher-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4.5 6.75h15a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H9l-3.75 3v-3H4.5a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Z" />
        </svg>
        <span class="chat-launcher-label">Chat with us</span>
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
    const status = widget.querySelector("#chat-status");
    const quickWrap = widget.querySelector("#chat-quick");

    const addBubble = (text, who) => {
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble is-" + who;
      bubble.textContent = text;
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
    };

    const findFaqReply = (text) => {
      const lower = text.toLowerCase();
      const match = faqReplies.find((item) => item.keys.some((key) => lower.includes(key)));
      return (
        match?.reply ||
        "Thanks for your question. Share your email (if you haven’t already) and send your message — our team will follow up by email shortly."
      );
    };

    const setOpen = (open) => {
      panel.hidden = !open;
      panel.classList.toggle("is-open", open);
      launcher.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-modal", String(open));
      if (open) {
        if (!messages.dataset.ready) {
          addBubble(
            "Hi — welcome to Zaidi Consulting Group. Ask about Revenue Cycle, Performance Marketing, Remote Staffing, or leave any question for our team.",
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
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-quick") || "";
        if (messageInput) messageInput.value = value;
        addBubble(findFaqReply(value), "bot");
        messageInput?.focus();
      });
    });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!emailInput || !messageInput || !submitBtn || !status) return;

      const email = emailInput.value.trim();
      const question = messageInput.value.trim();
      if (!email || !emailInput.checkValidity()) {
        status.hidden = false;
        status.className = "chat-status is-error";
        status.textContent = "Please enter a valid email address.";
        emailInput.focus();
        return;
      }
      if (!question) {
        status.hidden = false;
        status.className = "chat-status is-error";
        status.textContent = "Please type your question.";
        messageInput.focus();
        return;
      }

      addBubble(question, "user");
      const original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      status.hidden = true;

      const body = new FormData();
      body.append("email", email);
      body.append("message", question);
      body.append("_subject", "Website chat question — Zaidi Consulting Group");
      body.append("Source", "Website chatbox");
      body.append("_template", "table");
      body.append("_captcha", "false");
      body.append("_replyto", email);
      body.append(
        "_autoresponse",
        "Thanks for contacting Zaidi Consulting Group. We received your question and will follow up shortly. — ZCG Team"
      );

      try {
        const response = await fetch(
          "https://formsubmit.co/ajax/Connect@zaidiconsultinggroup.com",
          {
            method: "POST",
            body,
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("Chat submit failed");

        addBubble(findFaqReply(question), "bot");
        addBubble(
          "Your question was sent to our team. We’ll reply to " + email + " soon.",
          "bot"
        );
        status.hidden = false;
        status.className = "chat-status is-success";
        status.textContent = "Message sent. Check your email for a confirmation.";
        messageInput.value = "";
      } catch (_err) {
        status.hidden = false;
        status.className = "chat-status is-error";
        status.textContent =
          "We couldn’t send that just now. Please email Connect@zaidiconsultinggroup.com.";
        addBubble(
          "I couldn’t send that through chat just now. Please email Connect@zaidiconsultinggroup.com and we’ll help right away.",
          "bot"
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = original || "Send";
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
