/**
 * ============================================================
 *  👉 UNICO FILE DA MODIFICARE PER PERSONALIZZARE IL SITO 👉
 * ============================================================
 * Cambia i valori qui sotto e ricarica la pagina (o ri-deploya).
 * Non serve toccare HTML/CSS/JS per il testo, l'audio o le foto.
 */

// Il nome del fratello minore (usato nel racconto della timeline).
// Modifica questa riga con il suo vero nome.
var BROTHER_NAME = "tuo fratello";

window.CONFIG = {
  // Il nome di tua sorella (compare nel titolo e in fondo alla pagina)
  name: "Iman",

  // Quanti anni compie. Metti `null` per non mostrare l'età.
  age: 27,

  // Come vuoi firmarvi entrambi (compare nella firma finale)
  signature: "I tuoi fratelli",

  // Facoltativo: un ricordo/dettaglio speciale tra voi.
  // Es. "Come quella sera a Lisbona in cui dicemmo 'la prossima la organizziamo noi'."
  // Lascia stringa vuota "" per non mostrare nulla.
  personalNote: "",

  // Facoltativo: una battuta breve e leggera sull'età, prima di entrare nel racconto.
  // Lascia l'array vuoto [] per non mostrare questa sezione.
  teaseEyebrow: "27 anni (ufficialmente)",
  teaseLines: [
    "27 anni, eh? Va bene: sei ancora giovane. Diciamo... vintage.",
  ],

  // ============================================================
  // 🎵 MUSICA: la colonna sonora del sito
  // ============================================================
  // Metti un file mp3/ogg dentro assets/audio/ e scrivi qui il suo percorso.
  // Parte (in loop, a volume moderato) nel momento in cui si apre il regalo.
  // Se lasci src vuoto, al suo posto suona una breve melodia generata al volo.
  music: {
    src: "", // es. "assets/audio/musica.mp3"
    volume: 0.55, // da 0 (muto) a 1 (massimo)
  },

  // ============================================================
  // 📖 LA NOSTRA STORIA: il racconto a zigzag con l'aeroplanino
  // ============================================================
  // Un'unica sequenza, in ordine cronologico, con due tipi di elementi:
  //
  // 1) { type: "stop", ... }    → una tappa "a zigzag": data/titolo/testo
  //    a fianco della linea di volo, con foto/video piccoli.
  //      - date: facoltativa (stringa libera, es. "17 luglio 1999")
  //      - title, text: il racconto di quella tappa
  //      - media: 0 o più foto/video: [{ type: "image"|"video", src, caption }]
  //
  // 2) { type: "moment", ... }  → una PAUSA a schermo intero: un momento
  //    che occupa tutta la pagina, per prendere fiato nel racconto.
  //    Puoi usarla in tre modi:
  //      - solo testo (title/text, nessun media)     → una grande frase
  //      - solo foto/video (media, nessun testo)      → immersione pura
  //      - testo sopra la foto/video (entrambi)        → didascalia sul momento
  //      - media: { type: "image"|"video", src }  (una sola, non un array)
  //
  // Le tappe "stop" consecutive formano un "capitolo" con la sua linea a
  // zigzag e il suo aeroplanino; ogni "moment" interrompe il capitolo con
  // uno schermo intero, poi il racconto riprende con un nuovo capitolo.
  //
  // Per aggiungere le vostre foto/video: copia i file in assets/img/ (foto)
  // o assets/video/ (video) e sostituisci i placeholder qui sotto.
  timeline: [
    {
      type: "stop",
      date: "17 luglio 1999",
      title: "Sei nata tu",
      text: "Comincia tutto da qui: il giorno in cui sei arrivata tu, Iman.",
      media: [{ type: "image", src: "assets/img/placeholder-1.svg", caption: "Iman, i primi anni" }],
    },
    {
      type: "stop",
      date: "11 febbraio 2002",
      title: "Arrivo io",
      text: "Due anni e mezzo dopo sono arrivato io, a complicarti un po' la vita da sorella maggiore.",
      media: [{ type: "image", src: "assets/img/placeholder-2.svg", caption: "Io e te" }],
    },
    {
      type: "stop",
      date: "15 luglio 2007",
      title: "E poi lui",
      text: "Il 15 luglio 2007 è arrivato anche " + BROTHER_NAME + ", il più piccolo di noi tre. Eravamo al completo.",
      media: [{ type: "image", src: "assets/img/placeholder-3.svg", caption: "Noi tre" }],
    },
    {
      type: "moment",
      title: "Eravamo al completo.",
      text: "",
      media: { type: "image", src: "assets/img/placeholder-3.svg" },
    },
    {
      type: "stop",
      title: "Da ragazzini",
      text: "Ti facevo dispetti su dispetti — diciamo pure che a tratti ci odiavamo. Ma sotto sotto ti ho sempre voluta bene, anche quando non lo dicevo.",
      media: [{ type: "image", src: "assets/img/placeholder-4.svg", caption: "Come siamo cresciuti" }],
    },
    {
      type: "stop",
      date: "Finite le superiori",
      title: "Sei partita",
      text: "Sei stata l'unica di noi tre ad andare subito all'estero, da sola: destinazione Tolosa. Il tuo percorso, tutto tuo.",
      media: [{ type: "image", src: "assets/img/placeholder-1.svg", caption: "Tolosa" }],
    },
    {
      type: "moment",
      title: "Da sola. Per la prima volta.",
      text: "",
      media: { type: "image", src: "assets/img/placeholder-1.svg" },
    },
    {
      type: "stop",
      title: "Siamo fieri di te",
      text: "Tra mille difficoltà, in un modo o nell'altro sei sempre riuscita a emergere. E noi, da qui, siamo sempre stati fieri di te.",
      media: [{ type: "image", src: "assets/img/placeholder-2.svg", caption: "" }],
    },
  ],
};
