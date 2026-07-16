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
   * 3) Altezza reale dello schermo, misurata da JS.
   * Le unità *vh possono essere calcolate in modo leggermente diverso a
   * seconda che siano usate in min-height o height, e differire di
   * qualche pixel da un elemento all'altro: basta questo per far spuntare
   * un pezzetto della slide successiva quando lo snap si ferma. Fissiamo
   * quindi un solo valore in px (--app-height), usato ovunque, così
   * #content e ogni sua slide hanno sempre esattamente la stessa altezza.
   * ------------------------------------------------------------------ */
  function setAppHeight() {
    document.documentElement.style.setProperty("--app-height", window.innerHeight + "px");
  }
  setAppHeight();
  var appHeightResizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(appHeightResizeTimer);
    appHeightResizeTimer = setTimeout(setAppHeight, 150);
  });
  window.addEventListener("orientationchange", setAppHeight);

  /* --------------------------------------------------------------------
   * 3b) #content: contenitore di scroll con snap a schermo intero.
   * Lo scroll parte bloccato finché non si apre il sipario (vedi §5).
   * ------------------------------------------------------------------ */
  var hasGsap = typeof gsap !== "undefined";
  var scroller = document.getElementById("content");

  function lockContentScroll() {
    if (scroller) scroller.classList.add("is-locked");
  }
  function unlockContentScroll() {
    if (scroller) scroller.classList.remove("is-locked");
  }
  lockContentScroll();

  /* --------------------------------------------------------------------
   * 3c) Reveal al primo ingresso in vista: una classe CSS ([data-reveal]
   * → .is-visible) fa il lavoro che prima faceva ScrollTrigger; qui si
   * osservano gli elementi (esclusi quelli dell'hero, che compaiono con
   * l'apertura del sipario, vedi playHeroIntro).
   * ------------------------------------------------------------------ */
  var heroReveals = Array.prototype.slice.call(document.querySelectorAll("#hero [data-reveal]"));
  var allReveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var scrollReveals = allReveals.filter(function (el) {
    return heroReveals.indexOf(el) === -1;
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // Nessuna animazione: tutto visibile da subito (lo stile [data-reveal]
    // sotto prefers-reduced-motion mostra comunque i contenuti a schermo).
    allReveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: scroller, rootMargin: "0px 0px -15% 0px", threshold: 0 }
    );
    scrollReveals.forEach(function (el) {
      revealObserver.observe(el);
    });
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
      // src impostato subito ma con preload="none" in HTML: il video da
      // ~27MB non parte a scaricarsi al caricamento della pagina (che
      // rallenterebbe curtain/font/confetti). Il download vero comincia
      // solo quando la sezione si avvicina (vedi storyObserver sotto).
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
        var storyPendingLock = false;
        var storyPrimed = false;
        var contentIsScrolling = false;
        var scrollSettleTimer = null;
        var supportsScrollend = "onscrollend" in window;

        // Il blocco vero e proprio (overflow:hidden su #content, vedi
        // lockContentScroll) va applicato solo a scroll ormai fermo:
        // farlo mentre lo snap-scroll è ancora in corso (il momentum su
        // iOS incluso) interrompe l'animazione a metà, ed è quello che si
        // percepisce come uno "scatto"/blocco proprio all'arrivo sul video.
        function applyStoryLockIfPending() {
          if (storyPendingLock && !storyLocked && !storyDone) {
            storyLocked = true;
            storyVideoSection.classList.add("story-video--active");
            lockContentScroll();
          }
        }

        if (scroller) {
          scroller.addEventListener(
            "scroll",
            function () {
              contentIsScrolling = true;
              if (supportsScrollend) return; // gestito dall'evento scrollend sotto
              clearTimeout(scrollSettleTimer);
              scrollSettleTimer = setTimeout(function () {
                contentIsScrolling = false;
                applyStoryLockIfPending();
              }, 120);
            },
            { passive: true }
          );
          if (supportsScrollend) {
            scroller.addEventListener("scrollend", function () {
              contentIsScrolling = false;
              applyStoryLockIfPending();
            });
          }
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
          unlockContentScroll();
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

        // Due soglie in un solo observer: alla prima comparsa (soglia 0) si
        // avvia il caricamento vero del video, con un margine di anticipo
        // mentre si legge la sezione precedente; al 60% si prepara il
        // blocco della navigazione, applicato solo a scroll fermo (sopra).
        var storyObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && !storyPrimed && !storyDone) {
                storyPrimed = true;
                storyVideo.preload = "auto";
                storyVideo.load();
              }
              if (entry.intersectionRatio >= 0.6 && !storyLocked && !storyDone) {
                storyPendingLock = true;
                if (!contentIsScrolling) applyStoryLockIfPending();
              }
            });
          },
          { root: scroller, threshold: [0, 0.6] }
        );
        storyObserver.observe(storyVideoSection);
      }
    }
  }

  function playHeroIntro() {
    // Entrata scaglionata dei testi dell'hero: uno stagger via transition-delay,
    // stessa idea della timeline GSAP che sostituisce (vedi [data-reveal] in styles.css).
    heroReveals.forEach(function (el, i) {
      if (!prefersReducedMotion) el.style.transitionDelay = i * 0.15 + "s";
      el.classList.add("is-visible");
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
      unlockContentScroll();
      playHeroIntro();
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

})();
