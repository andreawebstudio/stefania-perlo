/* =========================================================
   Eventi — Yoga in gravidanza
   =========================================================

   COME AGGIUNGERE LE DATE
   Inserire un oggetto per ogni incontro nell'elenco EVENTI qui sotto:

     {
       data:   '2027-01-09',              // AAAA-MM-GG
       ora:    '10:00',                   // orario di inizio
       tipo:   'hridaya',                 // 'yoga' = Solo yoga prenatale · 'hridaya' = Yoga + puericultura
       durata: '90 minuti',               // facoltativo
       luogo:  'Nome della sede, Città'   // facoltativo
     },

   Le date passate vengono nascoste automaticamente.
   Finché l'elenco è vuoto, il calendario mostra un invito a richiedere le date. */

var EVENTI = [
  // { data: '2027-01-09', ora: '10:00', tipo: 'hridaya', durata: '90 minuti', luogo: '' },
];

(function () {
  'use strict';

  var TIPI = {
    yoga: 'Solo yoga prenatale',
    hridaya: 'Hridaya: yoga + puericultura'
  };
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio',
              'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var INTESTAZIONE = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  var INTESTAZIONE_ESTESA = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];

  var dialog = document.getElementById('eventi-dialog');
  var opener = document.querySelector('.event-open');
  if (!dialog || !opener) return;

  var grid = dialog.querySelector('.cal-grid');
  var list = dialog.querySelector('.cal-list');
  var title = dialog.querySelector('.cal-title');
  var filters = dialog.querySelectorAll('.cal-filter');

  function parse(d) {
    var p = d.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function key(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  var eventi = EVENTI
    .filter(function (e) { return e && e.data && TIPI[e.tipo] && parse(e.data) >= oggi; })
    .sort(function (a, b) { return (a.data + (a.ora || '')).localeCompare(b.data + (b.ora || '')); });

  var primo = eventi.length ? parse(eventi[0].data) : oggi;
  var vista = new Date(primo.getFullYear(), primo.getMonth(), 1);
  var filtro = 'all';
  var giornoScelto = null;

  function visibili() {
    return eventi.filter(function (e) { return filtro === 'all' || e.tipo === filtro; });
  }

  function descrivi(e) {
    var d = parse(e.data);
    return GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()] + ' ' + d.getFullYear();
  }

  function render() {
    var anno = vista.getFullYear();
    var mese = vista.getMonth();
    title.textContent = cap(MESI[mese]) + ' ' + anno;

    var perGiorno = {};
    visibili().forEach(function (e) {
      (perGiorno[e.data] = perGiorno[e.data] || []).push(e);
    });

    // Griglia del mese
    var html = '';
    INTESTAZIONE.forEach(function (g, i) {
      html += '<span class="cal-wd" aria-hidden="true">' + g + '</span>';
    });
    var inizio = (new Date(anno, mese, 1).getDay() + 6) % 7; // lunedì = 0
    var giorni = new Date(anno, mese + 1, 0).getDate();
    for (var b = 0; b < inizio; b++) html += '<span class="cal-day is-empty" aria-hidden="true"></span>';
    for (var g = 1; g <= giorni; g++) {
      var d = new Date(anno, mese, g);
      var k = key(d);
      var ev = perGiorno[k] || [];
      var cls = 'cal-day' + (ev.length ? ' has-events' : '') + (k === key(oggi) ? ' is-today' : '') + (k === giornoScelto ? ' is-selected' : '');
      var dots = ev.map(function (e) { return '<span class="ed-dot ed-dot--' + e.tipo + '"></span>'; }).join('');
      var label = INTESTAZIONE_ESTESA[(d.getDay() + 6) % 7] + ' ' + g + ' ' + MESI[mese] +
                  (ev.length ? ', ' + ev.length + (ev.length === 1 ? ' incontro' : ' incontri') : ', nessun incontro');
      html += '<button type="button" class="' + cls + '" data-day="' + k + '"' + (ev.length ? '' : ' disabled') +
              (k === giornoScelto ? ' aria-pressed="true"' : ' aria-pressed="false"') +
              ' aria-label="' + label + '"><span>' + g + '</span><span class="cal-dots">' + dots + '</span></button>';
    }
    grid.innerHTML = html;

    // Elenco degli incontri
    var delMese = visibili().filter(function (e) {
      var d = parse(e.data);
      return d.getFullYear() === anno && d.getMonth() === mese && (!giornoScelto || e.data === giornoScelto);
    });

    if (!eventi.length) {
      list.innerHTML =
        '<div class="cal-empty"><p><strong>Il calendario dei nuovi corsi 2026 – 2027 è in preparazione.</strong></p>' +
        '<p>Richiedilo e riceverai le date non appena saranno disponibili.</p></div>';
      return;
    }
    if (!delMese.length) {
      list.innerHTML = '<div class="cal-empty"><p>Nessun incontro in programma in questo mese per la proposta selezionata.</p></div>';
      return;
    }

    list.innerHTML = '<ul class="cal-events">' + delMese.map(function (e) {
      var quando = cap(descrivi(e)) + (e.ora ? ', ore ' + e.ora : '');
      var msg = 'Vorrei prenotare: ' + TIPI[e.tipo] + ', ' + descrivi(e) + (e.ora ? ', ore ' + e.ora : '') + '.';
      return '<li class="cal-event">' +
        '<span class="ed-dot ed-dot--' + e.tipo + '" aria-hidden="true"></span>' +
        '<div class="cal-event-info">' +
          '<p class="cal-event-title">' + TIPI[e.tipo] + '</p>' +
          '<p class="cal-event-meta">' + quando + (e.durata ? ' · ' + e.durata : '') + (e.luogo ? '<br>' + e.luogo : '') + '</p>' +
        '</div>' +
        '<button type="button" class="cal-book" data-book="' + msg.replace(/"/g, '&quot;') + '">Prenota</button>' +
      '</li>';
    }).join('') + '</ul>';
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.cal-day');
    if (!btn || btn.disabled) return;
    giornoScelto = giornoScelto === btn.dataset.day ? null : btn.dataset.day;
    render();
    var again = grid.querySelector('[data-day="' + btn.dataset.day + '"]');
    if (again) again.focus();
  });

  dialog.querySelectorAll('.cal-nav').forEach(function (btn) {
    btn.addEventListener('click', function () {
      vista.setMonth(vista.getMonth() + (btn.dataset.cal === 'next' ? 1 : -1));
      giornoScelto = null;
      render();
    });
  });

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtro = btn.dataset.filter;
      giornoScelto = null;
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      render();
    });
  });

  // Apertura e chiusura della finestra
  function apri() {
    render();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.documentElement.classList.add('has-dialog');
  }
  function chiudi() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  opener.addEventListener('click', apri);
  dialog.querySelector('.ed-close').addEventListener('click', chiudi);
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('has-dialog');
  });
  // clic sullo sfondo scuro fuori dalla finestra
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) chiudi();
  });

  // Prenotazione: precompila il modulo contatti
  dialog.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-book]');
    if (!btn) return;
    var msg = document.getElementById('f-msg');
    chiudi();
    if (msg) {
      msg.value = btn.getAttribute('data-book');
      msg.dispatchEvent(new Event('input', { bubbles: true }));
    }
    var contatti = document.getElementById('contatti');
    if (contatti) {
      contatti.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      setTimeout(function () {
        var nome = document.getElementById('f-nome');
        if (nome) nome.focus({ preventScroll: true });
      }, 700);
    }
  });
})();
