# Un viaggio insieme 🎁

Sito regalo di compleanno — single page, mobile-first, super animato.
Nessun build, nessuna dipendenza esterna: apri `index.html` e funziona.

L'esperienza: un sipario con un pacco regalo da aprire (con tanto di suono
e coriandoli), poi auguri, una presa in giro sull'età, un messaggio sincero,
il reveal del vero regalo (un weekend insieme) e infine una sequenza
cinematica a schermo intero — in stile "capitoli" — su questo viaggio ancora
tutto da decidere, con un carosello di foto/video. Chiude con la firma.

## Come personalizzare i testi

Modifica **solo** `config.js`:

```js
window.CONFIG = {
  name: "NOME",              // il nome di tua sorella
  age: null,                 // es. 27, oppure null per non mostrarlo
  signature: "Tuo fratello", // come vuoi firmarti
  personalNote: "",          // un ricordo speciale (facoltativo)
  teaseEyebrow: "...",       // etichetta sopra le battute sull'età
  teaseLines: [ ... ],       // le battute stesse (array di frasi)
  moments: [ ... ],          // foto/video del carosello, vedi sotto
};
```

Ricarica la pagina (o ri-deploya) per vedere le modifiche.

## Come aggiungere foto e video (carosello)

Il carosello (nel capitolo "i ricordi", dentro la sequenza scura del viaggio)
si popola dall'array `moments` in `config.js`:

```js
moments: [
  { type: "image", src: "assets/img/foto-1.jpg", caption: "un nostro ricordo" },
  { type: "video", src: "assets/video/clip-1.mp4", caption: "quella volta lì" },
],
```

1. Copia le tue foto in `assets/img/` e i tuoi video in `assets/video/`.
2. Aggiungi/modifica le righe dell'array con i nomi dei tuoi file
   (`type: "image"` o `"video"`, `caption` facoltativa — stringa vuota per ometterla).
3. I video vengono riprodotti muti, in loop, solo quando sono la diapositiva attiva.
4. Ri-deploya (vedi sotto).

Si sfoglia con le frecce, con i puntini/contatore, oppure scorrendo col dito.

## Il suono

Al tap sul pacco regalo parte un piccolo campanellino (generato al volo,
nessun file audio da caricare). La scelta se tenerlo attivo o no si fa
**prima di aprire il regalo**, con il pulsante dentro il sipario stesso —
dato che è un unico suono e non una colonna sonora, non serve un controllo
visibile per il resto del sito.

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
styles.css      stile: colori, font, layout responsive, sequenza cinematica
main.js         animazioni (GSAP, ScrollTrigger, Lenis, confetti, Web Audio)
config.js       👉 unico file da modificare per testi, battute e carosello
assets/lib/     librerie vendored (nessuna CDN)
assets/fonts/   font self-hosted (Fraunces, Inter, Anton)
assets/img/     immagini/placeholder del carosello
assets/video/   qui vanno i tuoi video per il carosello
```

## Nota

Il sito è pensato per restare online solo per qualche settimana.
Per rimuoverlo: Settings → Pages → disabilita, oppure elimina la repository.
