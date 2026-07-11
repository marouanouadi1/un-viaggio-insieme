/**
 * ============================================================
 *  👉 UNICO FILE DA MODIFICARE PER PERSONALIZZARE IL SITO 👉
 * ============================================================
 * Cambia i valori qui sotto e ricarica la pagina (o ri-deploya).
 * Non serve toccare HTML/CSS/JS per il testo o per le foto.
 */
window.CONFIG = {
  // Il nome di tua sorella (compare nel titolo e in fondo alla pagina)
  name: "Sister",

  // Quanti anni compie. Metti `null` per non mostrare l'età.
  age: 27,

  // Come vuoi firmarti (es. "Tuo fratello", "I Brothers")
  signature: "I Brothers",

  // Facoltativo: un ricordo/dettaglio speciale tra voi due.
  // Es. "Come quella sera a Lisbona in cui dicemmo 'la prossima la organizziamo noi'."
  // Lascia stringa vuota "" per non mostrare nulla.
  personalNote: "",

  // Facoltativo: qualche frase per prenderla amichevolmente in giro sull'età.
  // Lascia l'array vuoto [] per non mostrare questa sezione.
  teaseEyebrow: "27 anni (ufficialmente)",
  teaseLines: [
    "27 anni, eh?",
    "Le ginocchia iniziano a scricchiolare, la sveglia delle 7 fa più paura di un film horror, e sì: forse è ora degli occhiali da lettura.",
    "Ma tranquilla: sei ancora giovane. Diciamo... vintage.",
  ],

  // ============================================================
  // 📸 CAROSELLO: foto e video del vostro "viaggio insieme"
  // ============================================================
  // Ogni elemento è una "diapositiva" a schermo intero.
  // type: "image" oppure "video"
  // src: percorso del file dentro assets/img/ (foto) o assets/video/ (video)
  // caption: didascalia breve mostrata sotto (facoltativa, "" per non mostrarla)
  //
  // Per aggiungere le vostre foto/video:
  // 1. copia i file in assets/img/ oppure assets/video/
  // 2. aggiungi/modifica le righe qui sotto con i nomi dei tuoi file
  // 3. i video vengono riprodotti muti e in loop automaticamente
  moments: [
    { type: "image", src: "assets/img/placeholder-1.svg", caption: "un nostro ricordo" },
    { type: "image", src: "assets/img/placeholder-2.svg", caption: "una foto insieme" },
    { type: "image", src: "assets/img/placeholder-4.svg", caption: "un'altra istantanea" },
    { type: "image", src: "assets/img/placeholder-3.svg", caption: "quello che verrà" },
  ],
};
