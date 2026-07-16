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
   * 2) Audio: musica di sottofondo (file da config.js) con fallback
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
   * 3) Setup GSAP + ScrollTrigger + Lenis
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
   * 4) La nostra storia: immersione nel video.
   * Quando la sezione arriva a schermo intero, la navigazione si blocca
   * e compare l'invito a toccare per avviare il video (un tocco reale è
   * l'unico modo per garantire l'audio ovunque, autoplay incluso non lo
   * è su mobile). Mentre il video suona, la musica di sottofondo tace.
   * Alla fine (o se si sceglie di saltare) tutto riprende come prima.
   * ------------------------------------------------------------------ */
  var storyVideoSection = document.getElementById("story-video-section");
  var storyVideo = document.getElementById("story-video");
  var storyVideoPlayBtn = document.getElementById("story-video-play");
  var storyVideoSkipBtn = document.getElementById("story-video-skip");

  if (storyVideoSection && storyVideo) {
    if (!cfg.storyVideo || !cfg.storyVideo.src) {
      storyVideoSection.remove();
    } else {
      storyVideo.src = cfg.storyVideo.src;
      if (cfg.storyVideo.poster) storyVideo.poster = cfg.storyVideo.poster;

      if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        // Nessun blocco dello scroll: il video resta un elemento normale,
        // con i controlli nativi per guardarlo quando si vuole.
        storyVideo.controls = true;
        storyVideoPlayBtn.remove();
        storyVideoSkipBtn.remove();
      } else {
        var storyLocked = false;
        var storyDone = false;

        function lockScroll() {
          if (lenis) lenis.stop();
          else document.body.classList.add("scroll-locked");
        }
        function unlockScroll() {
          if (lenis) lenis.start();
          else document.body.classList.remove("scroll-locked");
        }

        // Fullscreen reale del browser: va richiesto dentro un gesto utente
        // (il tocco su "play"), altrimenti i browser lo rifiutano. Su iOS
        // Safari i div non supportano il Fullscreen API: si ricade sul
        // fullscreen nativo del tag <video> (con i controlli nativi di iOS).
        function enterFullscreen() {
          var request =
            storyVideoSection.requestFullscreen ||
            storyVideoSection.webkitRequestFullscreen ||
            storyVideoSection.msRequestFullscreen;
          if (request) {
            try {
              var result = request.call(storyVideoSection);
              if (result && typeof result.catch === "function") result.catch(function () {});
            } catch (err) {}
          } else if (storyVideo.webkitEnterFullscreen) {
            try {
              storyVideo.webkitEnterFullscreen();
            } catch (err) {}
          }
        }
        function exitFullscreen() {
          var fsElement =
            document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
          var exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
          if (fsElement && exit) {
            try {
              var result = exit.call(document);
              if (result && typeof result.catch === "function") result.catch(function () {});
            } catch (err) {}
          }
        }

        function finishStory() {
          if (storyDone) return;
          storyDone = true;
          storyVideoSection.classList.remove("story-video--active", "story-video--playing");
          storyVideo.pause();
          exitFullscreen();
          unlockScroll();
          if (bgMusic && bgMusic.src) bgMusic.play().catch(function () {});
        }

        storyVideoPlayBtn.addEventListener("click", function () {
          storyVideoSection.classList.add("story-video--playing");
          if (bgMusic && !bgMusic.paused) bgMusic.pause();
          storyVideo.play().catch(function () {});
          enterFullscreen();
        });
        storyVideoSkipBtn.addEventListener("click", finishStory);
        storyVideo.addEventListener("ended", finishStory);
        // iOS Safari: quando si esce dal fullscreen nativo del video
        // (es. tasto "Fine"), si considera la storia conclusa.
        storyVideo.addEventListener("webkitendfullscreen", finishStory);

        var storyObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && !storyLocked && !storyDone) {
                storyLocked = true;
                storyVideoSection.classList.add("story-video--active");
                lockScroll();
              }
            });
          },
          { threshold: 0.6 }
        );
        storyObserver.observe(storyVideoSection);
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
   * 5) Sipario d'apertura: apertura del pacco regalo
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
