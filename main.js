(function () {
  "use strict";

  var cfg = window.CONFIG || {};
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------------------
   * 1) Popolare il contenuto da config.js
   * ------------------------------------------------------------------ */
  var displayName = cfg.name && cfg.name.trim() ? cfg.name.trim() : "te";
  document.querySelectorAll('[data-cfg="name"]').forEach(function (el) {
    el.textContent = displayName;
  });
  document.querySelectorAll('[data-cfg="signature"]').forEach(function (el) {
    el.textContent = (cfg.signature && cfg.signature.trim()) || "Tuo fratello";
  });

  var subtitleEl = document.querySelector('[data-cfg="hero-subtitle"]');
  if (subtitleEl) {
    var subtitle = "Oggi si festeggia te.";
    if (cfg.age) subtitle += " Oggi ne compi " + cfg.age + ".";
    subtitleEl.textContent = subtitle;
  }

  var noteEl = document.getElementById("personal-note");
  if (noteEl && cfg.personalNote && cfg.personalNote.trim()) {
    noteEl.textContent = cfg.personalNote.trim();
    noteEl.classList.remove("hidden");
  }

  /* --------------------------------------------------------------------
   * 2) Setup GSAP + ScrollTrigger + Lenis
   * ------------------------------------------------------------------ */
  var hasGsap = typeof gsap !== "undefined";
  if (hasGsap && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  var lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", function () {
      if (hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.update();
    });
    if (hasGsap) {
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
    lenis.stop(); // scroll bloccato finché il sipario non viene aperto
  } else {
    document.body.classList.add("scroll-locked");
  }

  var heroReveals = hasGsap ? gsap.utils.toArray("#hero [data-reveal]") : [];
  var allReveals = hasGsap ? gsap.utils.toArray("[data-reveal]") : [];
  var scrollReveals = allReveals.filter(function (el) {
    return heroReveals.indexOf(el) === -1;
  });

  if (hasGsap) {
    if (prefersReducedMotion) {
      // Nessuna animazione: tutto visibile da subito.
      gsap.set(allReveals, { opacity: 1, y: 0, scale: 1, clearProps: "transform" });
    } else {
      gsap.set(allReveals, { opacity: 0, y: 28 });

      scrollReveals.forEach(function (el) {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });

      // Sezione regalo: pin + crescendo dello scale/opacità sullo scroll.
      var giftTitle = document.querySelector(".gift__title");
      if (giftTitle && typeof ScrollTrigger !== "undefined") {
        gsap.fromTo(
          giftTitle,
          { scale: 0.82, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "#gift",
              start: "top top",
              end: "+=70%",
              scrub: 1,
              pin: true,
            },
          }
        );
      }
    }
  }

  function playHeroIntro() {
    if (!hasGsap) return;
    if (prefersReducedMotion) {
      gsap.set(heroReveals, { opacity: 1, y: 0 });
      return;
    }
    gsap.timeline({ defaults: { ease: "power3.out" } }).to(heroReveals, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.15,
    });
  }

  /* --------------------------------------------------------------------
   * 3) Sipario d'apertura
   * ------------------------------------------------------------------ */
  var curtain = document.getElementById("curtain");
  var curtainBtn = document.getElementById("curtain-btn");
  var dismissed = false;

  function dismissCurtain() {
    if (dismissed || !curtain) return;
    dismissed = true;
    if (curtainBtn) curtainBtn.disabled = true;

    if (!prefersReducedMotion && typeof confetti !== "undefined") {
      confetti({
        particleCount: 70,
        spread: 65,
        startVelocity: 38,
        gravity: 0.9,
        ticks: 220,
        colors: ["#c96f5c", "#e2946a", "#c9a15a", "#f6d9b8"],
        origin: { y: 0.55 },
      });
    }

    function finish() {
      curtain.style.display = "none";
      curtain.setAttribute("aria-hidden", "true");
      if (lenis) {
        lenis.start();
      } else {
        document.body.classList.remove("scroll-locked");
      }
      playHeroIntro();
      if (hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }

    if (hasGsap) {
      var tl = gsap.timeline({ onComplete: finish });
      tl.to(curtain.querySelector(".curtain__inner"), {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
      }).to(curtain, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.1");
    } else {
      finish();
    }
  }

  if (curtainBtn) {
    curtainBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissCurtain();
    });
  }
  if (curtain) {
    curtain.addEventListener("click", dismissCurtain);
    curtain.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismissCurtain();
      }
    });
  }

  window.addEventListener("load", function () {
    if (hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
})();
