# Un viaggio insieme 🎁

Sito regalo di compleanno — single page, mobile-first, super animato.
Nessun build, nessuna dipendenza esterna: apri `index.html` e funziona.

## Come personalizzare i testi

Modifica **solo** `config.js`:

```js
window.CONFIG = {
  name: "NOME",              // il nome di tua sorella
  age: null,                 // es. 25, oppure null per non mostrarlo
  signature: "Tuo fratello", // come vuoi firmarti
  personalNote: "",          // un ricordo speciale (facoltativo)
};
```

Ricarica la pagina (o ri-deploya) per vedere le modifiche.

## Come aggiungere le foto

Nella cartella `assets/img/` ci sono 3 placeholder eleganti (`placeholder-1.svg`,
`placeholder-2.svg`, `placeholder-3.svg`). Quando hai le foto vere:

1. Copia le tue foto in `assets/img/` (es. `foto-1.jpg`, `foto-2.jpg`, `foto-3.jpg`).
2. In `index.html`, cerca i tre commenti `<!-- FOTO 1: ... -->`, `FOTO 2`, `FOTO 3`
   e cambia il valore di `src` da `placeholder-N.svg` a `foto-N.jpg`.
3. Ri-deploya (vedi sotto).

## Come vedere il sito in locale

Serve un piccolo server locale (per via del `fetch` dei font/librerie):

```bash
npx serve .
# oppure
python3 -m http.server 8000
```

Poi apri l'indirizzo mostrato nel terminale.

## Come ri-deployare su GitHub Pages

```bash
git add -A
git commit -m "aggiorna contenuti"
git push
```

GitHub Pages ripubblica automaticamente in 1-2 minuti dal push
(Actions → "pages build and deployment").

L'URL del sito è:
**https://marouanouadi1.github.io/un-viaggio-insieme/**

## Struttura

```
index.html      struttura della pagina (sezioni dell'esperienza)
styles.css      stile: colori, font, layout responsive
main.js         animazioni (GSAP, ScrollTrigger, Lenis, confetti)
config.js       👉 unico file da modificare per i testi
assets/lib/     librerie vendored (nessuna CDN)
assets/fonts/   font self-hosted (Fraunces + Inter)
assets/img/     immagini/placeholder della galleria
```

## Nota

Il sito è pensato per restare online solo per qualche settimana.
Per rimuoverlo: Settings → Pages → disabilita, oppure elimina la repository.
