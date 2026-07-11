# Un viaggio insieme 🎁

Sito regalo di compleanno per Iman — single page, mobile-first, super animato.
Nessun build, nessuna dipendenza esterna: apri `index.html` e funziona.

L'esperienza: un sipario con un pacco regalo da aprire (con tanto di musica
e coriandoli), poi gli auguri, una breve battuta sull'età, il racconto della
nostra storia — una timeline verticale scorrevole con un aeroplanino di carta
che scende lungo la linea del percorso — un messaggio dal cuore, il reveal
del vero regalo (un weekend insieme, noi tre) e infine come funziona.
Chiude con la firma.

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
  timeline: [ ... ],        // le tappe della vostra storia, vedi sotto
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

## Come raccontare la vostra storia (timeline)

La sezione centrale "La nostra storia" si popola dall'array `timeline` in
`config.js`: ogni elemento è una tappa del racconto, con data (facoltativa),
titolo, testo e foto/video.

```js
timeline: [
  {
    date: "17 luglio 1999",
    title: "Sei nata tu",
    text: "Comincia tutto da qui...",
    media: [{ type: "image", src: "assets/img/foto-1.jpg", caption: "Iman da piccola" }],
  },
  // altre tappe...
],
```

1. Copia le tue foto in `assets/img/` e i tuoi video in `assets/video/`.
2. Aggiungi/modifica le tappe con i tuoi testi e i nomi dei tuoi file
   (`type: "image"` o `"video"`, `media` può avere più elementi, `caption`
   facoltativa — stringa vuota per ometterla).
3. Le tappe si alternano automaticamente a sinistra/destra della linea
   (o imposta `side: "left"` / `"right"` per deciderlo tu).
4. I video vengono riprodotti muti, in loop, solo quando la tappa è visibile.
5. Ri-deploya (vedi sotto).

Scrollando, la linea di volo si disegna e un aeroplanino di carta la
percorre dall'alto verso il basso.

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
styles.css      stile: colori, font, layout responsive, timeline
main.js         animazioni (GSAP, ScrollTrigger, Lenis, confetti, Web Audio)
config.js       👉 unico file da modificare per testi, musica e timeline
assets/lib/     librerie vendored (nessuna CDN)
assets/fonts/   font self-hosted (Fraunces, Inter, Anton)
assets/audio/   qui va la tua traccia musicale
assets/img/     immagini/placeholder della timeline
assets/video/   qui vanno i tuoi video per la timeline
```

## Nota

Il sito è pensato per restare online solo per qualche settimana.
Per rimuoverlo: Settings → Pages → disabilita, oppure elimina la repository.
