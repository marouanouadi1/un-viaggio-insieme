/**
 * ============================================================
 *  👉 UNICO FILE DA MODIFICARE PER PERSONALIZZARE IL SITO 👉
 * ============================================================
 * Cambia i valori qui sotto e ricarica la pagina (o ri-deploya).
 * Non serve toccare HTML/CSS/JS per il testo, l'audio o le foto.
 */

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
  // 🎬 LA NOSTRA STORIA: il video
  // ============================================================
  // Dopo la battuta sull'età, il sito si ferma e si immerge a schermo
  // intero nel video: un tocco per avviarlo, e solo alla fine riprende
  // la navigazione normale (verso il messaggio e il reveal del regalo).
  // Metti il file in assets/video/ e scrivi qui il suo percorso.
  storyVideo: {
    src: "assets/video/storia.mp4",
    poster: "assets/video/storia-poster.jpg",
  },
};
