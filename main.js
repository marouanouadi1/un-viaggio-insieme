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
   * 2) La nostra storia: racconto a zigzag (config.timeline)
   * La sequenza alterna:
   * - "capitoli": tappe consecutive con la propria linea a zigzag
   *   (creata qui come struttura; il percorso vero e proprio viene
   *   disegnato più avanti, quando GSAP/ScrollTrigger sono pronti).
   * - "momenti": pause a schermo intero (testo e/o foto/video).
   * ------------------------------------------------------------------ */
  var timelineVideos = [];
  var SVG_NS = "http://www.w3.org/2000/svg";

  function buildTimelineStopNode(stop, indexInChapter) {
    var side = stop.side === "left" || stop.side === "right" ? stop.side : (indexInChapter % 2 === 0 ? "left" : "right");

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
    return node;
  }

  function buildTimelineMoment(item) {
    var hasMedia = !!(item.media && item.media.src);
    var hasText = !!((item.title && item.title.trim()) || (item.text && item.text.trim()));

    var el = document.createElement("div");
    el.className = "timeline__moment" + (!hasMedia ? " timeline__moment--text" : "");
    el.setAttribute("data-reveal", "");

    if (hasMedia) {
      var mediaWrap = document.createElement("div");
      mediaWrap.className = "timeline__moment__media";

      var mediaEl;
      if (item.media.type === "video") {
        mediaEl = document.createElement("video");
        mediaEl.src = item.media.src;
        mediaEl.muted = true;
        mediaEl.loop = true;
        mediaEl.playsInline = true;
        mediaEl.setAttribute("preload", "metadata");
        timelineVideos.push(mediaEl);
      } else {
        mediaEl = document.createElement("img");
        mediaEl.src = item.media.src;
        mediaEl.alt = item.title || "";
        mediaEl.loading = "lazy";
      }
      mediaWrap.appendChild(mediaEl);
      el.appendChild(mediaWrap);

      var scrim = document.createElement("div");
      scrim.className = "timeline__moment__scrim";
      scrim.setAttribute("aria-hidden", "true");
      el.appendChild(scrim);
    }

    if (hasText) {
      var content = document.createElement("div");
      content.className = "timeline__moment__content";
      if (item.title) {
        var titleEl = document.createElement("h3");
        titleEl.className = "timeline__moment__title";
        titleEl.textContent = item.title;
        content.appendChild(titleEl);
      }
      if (item.text) {
        var textEl = document.createElement("p");
        textEl.className = "timeline__moment__text";
        textEl.textContent = item.text;
        content.appendChild(textEl);
      }
      el.appendChild(content);
    }

    return el;
  }

  function buildTimelineChapter(stops) {
    var chapter = document.createElement("div");
    chapter.className = "timeline__chapter";

    // La linea a zigzag ha bisogno di almeno due pallini da collegare:
    // con una sola tappa, il capitolo mostra solo la tappa, senza linea.
    var hasPath = stops.length >= 2;
    if (hasPath) {
      var svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("class", "timeline__chapter-svg");
      svg.setAttribute("aria-hidden", "true");

      var bgPath = document.createElementNS(SVG_NS, "path");
      bgPath.setAttribute("class", "timeline__chapter-line-bg");
      bgPath.setAttribute("fill", "none");
      bgPath.setAttribute("stroke", "var(--terracotta)");
      bgPath.setAttribute("stroke-width", "3");
      bgPath.setAttribute("stroke-linecap", "round");
      bgPath.setAttribute("stroke-dasharray", "2 11");

      var fillPath = document.createElementNS(SVG_NS, "path");
      fillPath.setAttribute("class", "timeline__chapter-line-fill");
      fillPath.setAttribute("fill", "none");
      fillPath.setAttribute("stroke", "var(--terracotta-deep)");
      fillPath.setAttribute("stroke-width", "3");
      fillPath.setAttribute("stroke-linecap", "round");

      svg.appendChild(bgPath);
      svg.appendChild(fillPath);
      chapter.appendChild(svg);

      var plane = document.createElement("div");
      plane.className = "timeline__plane";
      plane.setAttribute("aria-hidden", "true");
      plane.innerHTML =
        '<svg class="timeline__plane-icon" viewBox="0 0 64 64">' +
        '<path d="M32 58 L58 8 L32 20 L6 8 Z" fill="var(--white-warm)" stroke="var(--terracotta-deep)" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M32 58 L32 20 L6 8 Z" fill="var(--cream-deep)"/>' +
        "</svg>";
      chapter.appendChild(plane);
    }

    var nodesEl = document.createElement("div");
    nodesEl.className = "timeline__nodes";
    stops.forEach(function (stop, i) {
      nodesEl.appendChild(buildTimelineStopNode(stop, i));
    });
    chapter.appendChild(nodesEl);

    return { el: chapter, hasPath: hasPath };
  }

  function buildTimelineSequence() {
    var items = Array.isArray(cfg.timeline) ? cfg.timeline.filter(Boolean) : [];
    var section = document.getElementById("timeline-section");
    var mount = document.getElementById("timeline-sequence");
    if (!mount || !items.length) {
      if (section) section.remove();
      return [];
    }

    var chapters = [];
    var currentStops = [];

    function flushChapter() {
      if (!currentStops.length) return;
      var built = buildTimelineChapter(currentStops);
      mount.appendChild(built.el);
      if (built.hasPath) chapters.push(built.el);
      currentStops = [];
    }

    items.forEach(function (item) {
      if (item.type === "moment") {
        flushChapter();
        mount.appendChild(buildTimelineMoment(item));
      } else {
        currentStops.push(item);
      }
    });
    flushChapter();

    // Video: partono solo quando sono visibili, altrimenti in pausa.
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

    return chapters;
  }

  var timelineChapters = buildTimelineSequence();

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
   * 5) La nostra storia: meccanica dello zigzag.
   * Per ogni capitolo: la linea collega i pallini delle tappe con una
   * curva a zigzag (ricalcolata a ogni cambio di layout — font, immagini,
   * resize). Un ScrollTrigger scrubbato per capitolo lega, all'avanzare
   * dello scroll:
   * - il "disegno" della curva (stroke-dashoffset dal totale a 0)
   * - la posizione dell'aeroplanino lungo la curva vera (getPointAtLength),
   *   con la rotazione presa dalla tangente della curva in quel punto
   * - una leggera dissolvenza in entrata/uscita dell'aeroplanino, per un
   *   "cambio di pagina" tra un capitolo e il successivo (o un momento).
   * ------------------------------------------------------------------ */
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(null, args);
      }, wait);
    };
  }

  function rebuildChapterPath(chapter) {
    var svg = chapter.querySelector(".timeline__chapter-svg");
    var bgPath = chapter.querySelector(".timeline__chapter-line-bg");
    var fillPath = chapter.querySelector(".timeline__chapter-line-fill");
    var dots = Array.prototype.slice.call(chapter.querySelectorAll(".timeline__dot"));
    if (!svg || !bgPath || !fillPath || dots.length < 2) return;

    var chapterRect = chapter.getBoundingClientRect();
    var w = chapter.clientWidth;
    var h = chapter.clientHeight;
    if (!w || !h) return;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);

    var points = dots.map(function (dot) {
      var r = dot.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - chapterRect.left,
        y: r.top + r.height / 2 - chapterRect.top,
      };
    });

    // Curva a zigzag attraverso i punti: una bezier cubica per tratto, con
    // i punti di controllo a un quarto/tre quarti dell'altezza (non a metà)
    // — la linea resta dritta più a lungo vicino a ogni tappa, poi svolta
    // più decisa verso la successiva: è questo lo scarto che crea lo zigzag.
    var d = "M " + points[0].x + " " + points[0].y;
    for (var i = 1; i < points.length; i++) {
      var p0 = points[i - 1];
      var p1 = points[i];
      var yA = p0.y + (p1.y - p0.y) * 0.25;
      var yB = p0.y + (p1.y - p0.y) * 0.75;
      d += " C " + p0.x + " " + yA + ", " + p1.x + " " + yB + ", " + p1.x + " " + p1.y;
    }

    bgPath.setAttribute("d", d);
    fillPath.setAttribute("d", d);

    var length = fillPath.getTotalLength();
    fillPath.style.strokeDasharray = length + " " + length;
    fillPath.style.strokeDashoffset = String(length);
  }

  function setupChapterScroll(chapter) {
    var plane = chapter.querySelector(".timeline__plane");
    var fillPath = chapter.querySelector(".timeline__chapter-line-fill");
    if (!plane || !fillPath) return;

    if (prefersReducedMotion || !hasGsap || typeof ScrollTrigger === "undefined") {
      var length = fillPath.getTotalLength();
      fillPath.style.strokeDashoffset = "0"; // curva completamente disegnata
      plane.style.display = "none";
      return;
    }

    ScrollTrigger.create({
      trigger: chapter,
      start: "top center",
      end: "bottom center",
      scrub: 0.5,
      onUpdate: function (self) {
        var progress = self.progress;
        var len = fillPath.getTotalLength();
        if (!len) return;
        fillPath.style.strokeDashoffset = String(len * (1 - progress));

        var at = len * progress;
        var point = fillPath.getPointAtLength(at);
        var ahead = fillPath.getPointAtLength(Math.min(len, at + 1));
        var angleDeg = Math.atan2(ahead.y - point.y, ahead.x - point.x) * (180 / Math.PI);

        plane.style.setProperty("--plane-x", point.x + "px");
        plane.style.setProperty("--plane-y", point.y + "px");
        plane.style.setProperty("--plane-rot", angleDeg - 90 + "deg");

        // Dissolvenza in entrata/uscita: un "cambio di pagina" verso il
        // capitolo successivo (o verso un momento a schermo intero),
        // non un taglio netto.
        var fade = Math.min(progress / 0.08, (1 - progress) / 0.08, 1);
        plane.style.setProperty("--plane-opacity", String(Math.max(fade, 0)));
      },
    });
  }

  function rebuildAllChapters() {
    timelineChapters.forEach(rebuildChapterPath);
    if (hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  }

  if (timelineChapters.length) {
    timelineChapters.forEach(function (chapter) {
      rebuildChapterPath(chapter);
      setupChapterScroll(chapter);
    });

    // Il layout dipende da font e immagini/video ancora da caricare:
    // ricalcoliamo la curva quando arrivano, e a ogni resize/rotazione.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(rebuildAllChapters).catch(function () {});
    }
    document.querySelectorAll("#timeline-sequence img").forEach(function (img) {
      if (!img.complete) img.addEventListener("load", debounce(rebuildAllChapters, 120), { once: true });
    });
    document.querySelectorAll("#timeline-sequence video").forEach(function (video) {
      video.addEventListener("loadedmetadata", debounce(rebuildAllChapters, 120), { once: true });
    });
    window.addEventListener("resize", debounce(rebuildAllChapters, 150));
    window.addEventListener("orientationchange", function () {
      setTimeout(rebuildAllChapters, 300);
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
