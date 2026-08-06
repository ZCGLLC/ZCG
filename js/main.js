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
        <h2 id="aep-popup-title">AEP is Approaching.</h2>
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
})();
