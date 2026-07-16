# Un viaggio insieme 🎁

Sito regalo di compleanno per Iman — single page, mobile-first, super animato.
Nessun build, nessuna dipendenza esterna: apri `index.html` e funziona.

L'esperienza: un sipario con un pacco regalo da aprire (con tanto di musica
e coriandoli), poi gli auguri, una breve battuta sull'età, l'immersione a
schermo intero nel video della nostra storia — la navigazione si blocca,
si tocca per guardarlo, e solo alla fine riprende — un messaggio dal cuore,
il reveal del vero regalo (un weekend insieme, noi tre) e infine come
funziona. Chiude con la firma.

## Come personalizzare i testi

Modifica **solo** `config.js`:

```js
window.CONFIG = {
  name: "Iman",             // il nome di tua sorella
  age: 27,                  // oppure null per non mostrarlo
  signature: "I tuoi fratelli", // come vi firmate
  personalNote: "",         // un ricordo speciale (facoltativo)
  teaseEyebrow: "...",      // etichetta sopra la battuta sull'età
  teaseLines: [ ... ],      // la battuta stessa (array di frasi)
  music: { ... },           // traccia audio, vedi sotto
  storyVideo: { ... },      // il video della vostra storia, vedi sotto
};
```

Ricarica la pagina (o ri-deploya) per vedere le modifiche.

## La musica

Al tap sul pacco regalo parte la musica di sottofondo, in loop, per tutta
la visita — **non c'è un pulsante per disattivarla**, solo l'invito ad
alzare il volume prima di aprire il regalo.

```js
music: {
  src: "assets/audio/musica.mp3", // il tuo file, dentro assets/audio/
  volume: 0.55,                   // da 0 a 1
},
```

Se lasci `src` vuoto, al suo posto suona una breve melodia festosa generata
al volo (nessun file da caricare) — utile finché non hai scelto la traccia
definitiva.

## Come raccontare la vostra storia (video)

Dopo la battuta sull'età, il sito si ferma e si immerge a schermo intero nel
video: si tocca per avviarlo (con l'audio, sempre — un tocco reale è l'unico
modo per garantirlo su ogni dispositivo), e solo alla sua fine (o se si
sceglie "Salta") la navigazione riprende verso il messaggio e il regalo.

```js
storyVideo: {
  src: "assets/video/storia.mp4",         // il tuo video
  poster: "assets/video/storia-poster.jpg", // fotogramma mostrato prima del play (facoltativo)
},
```

1. Copia il tuo video in `assets/video/`.
2. Se il file è pesante, comprimilo prima di caricarlo (GitHub rifiuta i
   file da 100MB o più): con ffmpeg, qualcosa come
   `ffmpeg -i originale.mp4 -vf scale=810:1440 -c:v libx264 -crf 26 -c:a aac -b:a 128k storia.mp4`
   è un buon punto di partenza per un video verticale da telefono.
3. Lascia `storyVideo.src` vuoto (`""`) per non mostrare questa sezione.
4. Ri-deploya (vedi sotto).

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
main.js         animazioni (GSAP, ScrollTrigger, Lenis, confetti, Web Audio)
config.js       👉 unico file da modificare per testi, musica e video
assets/lib/     librerie vendored (nessuna CDN)
assets/fonts/   font self-hosted (Fraunces, Inter, Anton)
assets/audio/   qui va la tua traccia musicale
assets/video/   qui va il video della vostra storia
```

## Nota

Il sito è pensato per restare online solo per qualche settimana.
Per rimuoverlo: Settings → Pages → disabilita, oppure elimina la repository.
