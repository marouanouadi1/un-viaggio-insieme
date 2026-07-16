---
name: verify
description: Come verificare a runtime le modifiche a questo sito (HTML/CSS/JS statico, nessun build)
---

# Verificare questo sito

Nessun build/server: il "sorgente" e il "prodotto" coincidono. Basta aprire `index.html`.

## Handle: Chromium headless via playwright-core

Non c'è `playwright` installato nel progetto, ma il binario Chromium di Playwright è
spesso già in cache in `~/.cache/ms-playwright/chromium-<versione>/chrome-linux64/chrome`.
Ricetta che funziona senza bisogno di scaricare browser (solo il pacchetto npm leggero):

```bash
mkdir -p /tmp/scratch-verify && cd /tmp/scratch-verify
npm init -y >/dev/null 2>&1
npm install playwright-core --no-audit --no-fund
find ~/.cache/ms-playwright -maxdepth 2 -iname "chrome-linux64"   # trova l'eseguibile
```

Script minimo:
```js
const { chromium } = require("playwright-core");
const EXEC_PATH = "/home/<user>/.cache/ms-playwright/chromium-XXXX/chrome-linux64/chrome";
const SITE = "file:///path/assoluto/al/repo/index.html";
const browser = await chromium.launch({ executablePath: EXEC_PATH });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(SITE);
```

## Gotcha del sito

- **Il pacco regalo del sipario (`#curtain-btn`) ha un'animazione CSS infinita** (`giftbox-bob`):
  il controllo di "stabilità" di Playwright non converge mai su `page.click()`. Usa sempre
  `{ force: true }` per cliccarlo (e per `#story-video-skip`, stessa storia se animato).
- **Simulare lo scroll utente**: usa `page.mouse.move(...)` + `page.mouse.wheel(0, N)` sezione per
  sezione, non `element.scrollIntoView()` su lunghe distanze — con `scroll-behavior: smooth` +
  `scroll-snap-type: mandatory` un salto multi-sezione impiega più dei soliti ~500ms ad assestarsi
  e uno screenshot troppo presto mostra una sezione "a metà" che in realtà si sistema poco dopo.
  Aspetta ~700-900ms dopo ogni wheel notch prima di leggere `getBoundingClientRect()`.
- **Errori CORS sui font in console sono attesi e irrilevanti quando si testa via `file://`**
  (i `<link rel="preload" ... crossorigin>` per i woff2 falliscono solo per lo schema `file:`;
  su http/https, incluso GitHub Pages dove il sito è deployato, non succede).
- **Verificare "un blocco = una schermata"**: leggi `getBoundingClientRect()` di ogni `#content > *`
  e confronta `height` con `viewport.height`, e il `top` delle sezioni dopo lo scroll (devono essere
  multipli esatti dell'altezza viewport, es. 0, 640, 1280…). Controlla anche a un'altezza "corta"
  (es. 360×560) per simulare un telefono con barra degli indirizzi visibile — il `min-height:100svh`
  da solo non basta se il contenuto di una sezione (es. `.steps`) è troppo alto per starci.
- **Sezione video**: dopo lo scroll, `#content.is-locked` deve essere `true` e
  `#story-video-section` deve avere classe `story-video--active`; il tasto "Salta" sblocca.
