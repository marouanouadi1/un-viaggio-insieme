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
    el.textContent = (cfg.signature && cfg.signature.trim()) || "I tuoi fratelli";
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
   * 2) La nostra storia: timeline verticale (config.timeline)
   * Crea le tappe nel DOM. La meccanica di scroll (linea + aeroplanino)
   * viene agganciata più avanti, dopo che GSAP/ScrollTrigger sono pronti.
   * ------------------------------------------------------------------ */
  var timelineVideos = [];

  function buildTimelineNodes() {
    var stops = Array.isArray(cfg.timeline) ? cfg.timeline.filter(Boolean) : [];
    var section = document.getElementById("timeline-section");
    var nodesEl = document.getElementById("timeline-nodes");
    if (!nodesEl || !stops.length) {
      if (section) section.remove();
      return false;
    }

    stops.forEach(function (stop, i) {
      var side = stop.side === "left" || stop.side === "right" ? stop.side : (i % 2 === 0 ? "left" : "right");

      var node = document.createElement("article");
      node.className = "timeline__node timeline__node--" + side;
      node.setAttribute("data-reveal", "");

      var dot = document.createElement("span");
      dot.className = "timeline__dot";
      dot.setAttribute("aria-hidden", "true");
      node.appendChild(dot);

      var card = document.createElement("div");
      card.className = "timeline__card";

      if (stop.date) {
        var dateEl = document.createElement("p");
        dateEl.className = "timeline__date";
        dateEl.textContent = stop.date;
        card.appendChild(dateEl);
      }
      if (stop.title) {
        var titleEl = document.createElement("h3");
        titleEl.className = "timeline__title-text";
        titleEl.textContent = stop.title;
        card.appendChild(titleEl);
      }
      if (stop.text) {
        var textEl = document.createElement("p");
        textEl.className = "timeline__text";
        textEl.textContent = stop.text;
        card.appendChild(textEl);
      }

      var media = Array.isArray(stop.media) ? stop.media.filter(Boolean) : [];
      media.forEach(function (m) {
        var mediaWrap = document.createElement("div");
        mediaWrap.className = "timeline__media";

        var el;
        if (m.type === "video") {
          el = document.createElement("video");
          el.src = m.src;
          el.muted = true;
          el.loop = true;
          el.playsInline = true;
          el.setAttribute("preload", "metadata");
          timelineVideos.push(el);
        } else {
          el = document.createElement("img");
          el.src = m.src;
          el.alt = m.caption || stop.title || "";
          el.loading = "lazy";
        }
        mediaWrap.appendChild(el);

        if (m.caption) {
          var cap = document.createElement("p");
          cap.className = "timeline__caption";
          cap.textContent = m.caption;
          mediaWrap.appendChild(cap);
        }
        card.appendChild(mediaWrap);
      });

      node.appendChild(card);
      nodesEl.appendChild(node);
    });

    // Video: partono solo quando la tappa è visibile, altrimenti in pausa.
    if (timelineVideos.length) {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.play().catch(function () {});
              } else {
                entry.target.pause();
              }
            });
          },
          { threshold: 0.35 }
        );
        timelineVideos.forEach(function (v) { io.observe(v); });
      } else {
        timelineVideos.forEach(function (v) { v.play().catch(function () {}); });
      }
    }

    return true;
  }

  var timelineExists = buildTimelineNodes();

  /* --------------------------------------------------------------------
   * 3) Audio: musica di sottofondo (file da config.js) con fallback
   * su una breve melodia generata al volo, se non è stato indicato un file.
   * L'audio è sempre attivo: non c'è un controllo per disattivarlo.
   * ------------------------------------------------------------------ */
  var bgMusic = document.getElementById("bg-music");

  function startBackgroundMusic() {
    if (!bgMusic || !cfg.music || !cfg.music.src) return false;
    try {
      bgMusic.src = cfg.music.src;
      bgMusic.loop = true;
      bgMusic.volume = typeof cfg.music.volume === "number" ? cfg.music.volume : 0.55;
      // Se il percorso in config.js è sbagliato o il file non esiste, l'audio
      // non parte in silenzio: suoniamo comunque la melodia di riserva.
      bgMusic.addEventListener(
        "error",
        function onError() {
          bgMusic.removeEventListener("error", onError);
          playChime();
        },
        { once: true }
      );
      var playPromise = bgMusic.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          /* autoplay bloccato dal browser: non deve mai impedire l'apertura del regalo */
        });
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  var audioCtx = null;
  function playChime() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();

      var now = audioCtx.currentTime;

      function note(freq, start, dur, type, peak) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = type || "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(peak || 0.15, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      }

      // Motivo festoso: arpeggio ascendente (do-mi-sol-do) seguito da un
      // accordo maggiore a più voci che chiude in modo luminoso, più una
      // piccola scintilla acuta finale.
      var arp = [523.25, 659.25, 783.99, 1046.5];
      arp.forEach(function (freq, i) {
        note(freq, i * 0.08, 0.35, "triangle", 0.14);
      });
      [783.99, 987.77, 1174.66].forEach(function (freq) {
        note(freq, 0.34, 0.85, "sine", 0.09);
      });
      note(2093, 0.42, 0.4, "triangle", 0.06);
    } catch (e) {
      /* il suono e' un plus, non deve mai bloccare l'apertura del regalo */
    }
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
   * 5) La nostra storia: meccanica di scroll della timeline.
   * Un unico ScrollTrigger scrubbato lega, all'avanzare dello scroll:
   * - il "disegno" della linea di volo (altezza della spine-fill 0% → 100%)
   * - la discesa dell'aeroplanino lungo la spine, con una leggera
   *   oscillazione orizzontale e un piccolo "bank" rotatorio, per dare
   *   l'idea del volo.
   * ------------------------------------------------------------------ */
  function setupTimelineScroll() {
    var path = document.getElementById("timeline-path");
    var plane = document.getElementById("timeline-plane");
    var spineFill = document.getElementById("timeline-spine-fill");
    if (!path || !plane) return;

    var PLANE_SIZE = 38; // deve combaciare con la larghezza in styles.css

    if (prefersReducedMotion || !hasGsap || typeof ScrollTrigger === "undefined") {
      if (spineFill) spineFill.style.height = "100%";
      plane.style.display = "none";
      return;
    }

    ScrollTrigger.create({
      trigger: path,
      start: "top center",
      end: "bottom center",
      scrub: 0.5,
      onUpdate: function (self) {
        var progress = self.progress;
        var travel = Math.max(path.offsetHeight - PLANE_SIZE, 0);
        var y = progress * travel;
        var sway = Math.sin(progress * Math.PI * 6) * 14;
        var rot = Math.cos(progress * Math.PI * 6) * 10;
        plane.style.setProperty("--plane-y", y + "px");
        plane.style.setProperty("--plane-x", sway + "px");
        plane.style.setProperty("--plane-rot", rot + "deg");
        if (spineFill) spineFill.style.height = progress * 100 + "%";
      },
    });

    // L'altezza della timeline dipende dalle immagini/video: ricalcoliamo
    // quando ognuno di questi ha finito di caricarsi.
    path.querySelectorAll("img").forEach(function (img) {
      if (!img.complete) {
        img.addEventListener(
          "load",
          function () {
            if (hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
          },
          { once: true }
        );
      }
    });
  }

  if (timelineExists) setupTimelineScroll();

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

    // Musica sempre attiva: se c'è un file configurato parte quella,
    // altrimenti suona la melodia di riserva generata al volo.
    var musicStarted = startBackgroundMusic();
    if (!musicStarted) playChime();

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
