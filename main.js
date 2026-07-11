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
    if (cfg.age) subtitle += " Oggi ne compi " + cfg.age + " anni.";
    subtitleEl.textContent = subtitle;
  }

  var noteEl = document.getElementById("personal-note");
  if (noteEl && cfg.personalNote && cfg.personalNote.trim()) {
    noteEl.textContent = cfg.personalNote.trim();
    noteEl.classList.remove("hidden");
  }

  var teaseSection = document.getElementById("tease-section");
  var teaseLines = Array.isArray(cfg.teaseLines) ? cfg.teaseLines.filter(Boolean) : [];
  if (teaseSection) {
    if (teaseLines.length) {
      var teaseEyebrowEl = teaseSection.querySelector('[data-cfg="tease-eyebrow"]');
      if (teaseEyebrowEl) teaseEyebrowEl.textContent = cfg.teaseEyebrow || "";
      var teaseLinesEl = document.getElementById("tease-lines");
      teaseLines.forEach(function (line, i) {
        var span = document.createElement("span");
        span.className = "line" + (i === teaseLines.length - 1 ? " line--soft" : "");
        span.setAttribute("data-reveal", "");
        span.textContent = line;
        teaseLinesEl.appendChild(span);
      });
    } else {
      teaseSection.remove();
    }
  }

  /* --------------------------------------------------------------------
   * 2) Carosello foto/video (Atto III, capitolo 02)
   * ------------------------------------------------------------------ */
  var carouselSlides = [];
  var carouselTrack = document.getElementById("carousel-track");
  var carouselCounter = document.getElementById("carousel-counter");

  function initCarousel() {
    var moments = Array.isArray(cfg.moments) ? cfg.moments.filter(Boolean) : [];
    if (!carouselTrack || !moments.length) {
      var carouselSection = document.querySelector(".stack-slide--carousel");
      if (carouselSection) carouselSection.remove();
      return;
    }

    moments.forEach(function (m) {
      var slide = document.createElement("div");
      slide.className = "carousel__slide";

      var media;
      if (m.type === "video") {
        media = document.createElement("video");
        media.src = m.src;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.setAttribute("preload", "metadata");
      } else {
        media = document.createElement("img");
        media.src = m.src;
        media.alt = m.caption || "";
        media.loading = "lazy";
      }
      slide.appendChild(media);

      if (m.caption) {
        var cap = document.createElement("p");
        cap.className = "carousel__caption";
        cap.textContent = m.caption;
        slide.appendChild(cap);
      }
      carouselTrack.appendChild(slide);
    });

    carouselSlides = Array.prototype.slice.call(carouselTrack.children);

    function updateCarousel() {
      if (!carouselTrack.clientWidth) return;
      var idx = Math.round(carouselTrack.scrollLeft / carouselTrack.clientWidth);
      idx = Math.max(0, Math.min(carouselSlides.length - 1, idx));
      if (carouselCounter) {
        carouselCounter.textContent = String(idx + 1).padStart(2, "0") + " / " + String(carouselSlides.length).padStart(2, "0");
      }
      carouselSlides.forEach(function (s, i) {
        var video = s.querySelector("video");
        if (!video) return;
        if (i === idx) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }

    var scrollTimer = null;
    carouselTrack.addEventListener(
      "scroll",
      function () {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(updateCarousel, 80);
      },
      { passive: true }
    );

    var prevBtn = document.getElementById("carousel-prev");
    var nextBtn = document.getElementById("carousel-next");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        carouselTrack.scrollBy({ left: -carouselTrack.clientWidth, behavior: "smooth" });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        carouselTrack.scrollBy({ left: carouselTrack.clientWidth, behavior: "smooth" });
      });
    }

    updateCarousel();
  }
  initCarousel();

  /* --------------------------------------------------------------------
   * 3) Suono: campanellino sintetizzato (Web Audio, nessun file da caricare)
   * ------------------------------------------------------------------ */
  var SOUND_KEY = "un-viaggio-insieme:suono";
  var soundEnabled = true;
  try {
    var storedSound = window.localStorage.getItem(SOUND_KEY);
    if (storedSound !== null) soundEnabled = storedSound === "on";
  } catch (e) {
    /* localStorage non disponibile: si resta sul default (on) */
  }

  var audioCtx = null;
  function playChime() {
    if (!soundEnabled || prefersReducedMotion) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();

      var now = audioCtx.currentTime;
      var notes = [523.25, 659.25, 783.99, 1046.5]; // do-mi-sol-do, arpeggio luminoso
      notes.forEach(function (freq, i) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        var start = now + i * 0.09;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.55);
      });
    } catch (e) {
      /* il suono e' un plus, non deve mai bloccare l'apertura del regalo */
    }
  }

  var soundToggle = document.getElementById("sound-toggle");
  var soundToggleLabel = document.getElementById("sound-toggle-label");
  function refreshSoundToggleUI() {
    if (!soundToggle) return;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute("aria-label", soundEnabled ? "Disattiva il suono" : "Attiva il suono");
    if (soundToggleLabel) soundToggleLabel.textContent = soundEnabled ? "suono on" : "suono off";
  }
  refreshSoundToggleUI();
  if (soundToggle) {
    soundToggle.addEventListener("click", function (e) {
      e.stopPropagation(); // e' dentro #curtain: non deve far partire l'apertura del regalo
      soundEnabled = !soundEnabled;
      try {
        window.localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
      } catch (e) {
        /* nessun salvataggio persistente disponibile, non e' bloccante */
      }
      refreshSoundToggleUI();
    });
  }

  /* --------------------------------------------------------------------
   * 4) Setup GSAP + ScrollTrigger + Lenis
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

  /* --------------------------------------------------------------------
   * 5) Atto III — sequenza cinematica "sticky-stack"
   * Ogni .stack-slide resta incollata (CSS position:sticky) mentre si
   * scrolla la sua altezza extra; qui animiamo solo il CONTENUTO interno
   * (scala/opacità) in base al progresso di scroll di quella slide.
   * ------------------------------------------------------------------ */
  if (hasGsap && typeof ScrollTrigger !== "undefined") {
    var stackSlides = gsap.utils.toArray(".stack-slide[data-stack]");
    stackSlides.forEach(function (slide) {
      var word = slide.querySelector(".stack-slide__word");
      var caps = gsap.utils.toArray(slide.querySelectorAll(".stack-slide__cap"));
      var animatedEls = (word ? [word] : []).concat(caps);
      if (!animatedEls.length) return;

      if (prefersReducedMotion) {
        gsap.set(animatedEls, { opacity: 1, scale: 1, y: 0 });
        return;
      }

      gsap.set(caps, { opacity: 0, y: 10 });
      if (word) gsap.set(word, { opacity: 0, scale: 0.72 });

      var tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      if (word) tl.to(word, { opacity: 1, scale: 1, duration: 0.3 }, 0);
      tl.to(caps, { opacity: 1, y: 0, duration: 0.2, stagger: 0.05 }, 0.05);
      tl.to({}, { duration: 0.35 }); // dwell: resta leggibile
      if (word) tl.to(word, { opacity: 0.85, scale: 1.05, duration: 0.25, ease: "power1.in" });
      tl.to(caps, { opacity: 0, duration: 0.2 }, "<");

      // Il pannello resta "incollato" (CSS sticky) solo per la prima metà
      // dell'altezza del wrapper (l'altra metà è lo scroll naturale che lo
      // scopre): la scrub-animation deve coprire esattamente quella finestra,
      // altrimenti il contenuto smette di essere leggibile prima che l'exit finisca.
      ScrollTrigger.create({
        trigger: slide,
        start: "top top",
        end: function () {
          return "+=" + slide.offsetHeight / 2;
        },
        scrub: 0.4,
        animation: tl,
      });
    });
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
   * 6) Sipario d'apertura: apertura del pacco regalo
   * ------------------------------------------------------------------ */
  var curtain = document.getElementById("curtain");
  var curtainBtn = document.getElementById("curtain-btn");
  var giftboxLid = document.getElementById("giftbox-lid");
  var dismissed = false;

  function dismissCurtain() {
    if (dismissed || !curtain) return;
    dismissed = true;
    if (curtainBtn) curtainBtn.disabled = true;

    playChime();

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
      var curtainTextEls = curtain.querySelectorAll(".curtain__eyebrow, .curtain__title");
      if (giftboxLid) {
        tl.to(giftboxLid, { rotation: -100, y: -18, x: -6, transformOrigin: "50% 100%", duration: 0.45, ease: "back.in(1.4)" }, 0);
        tl.to(curtainBtn, { y: 10, opacity: 0, duration: 0.35, ease: "power2.in" }, 0.1);
      }
      tl.to(curtainTextEls, { opacity: 0, y: -16, duration: 0.35, ease: "power2.in" }, 0);
      tl.to(curtain, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.05");
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
