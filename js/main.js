/* Stefania Perlo — script essenziali */
(function () {
  'use strict';

  /* ===== CONFIGURAZIONE MODULO =====
     Creare un modulo su https://formspree.io (account di Stefania) e incollare qui l'endpoint,
     es. "https://formspree.io/f/abcdwxyz". Finché resta vuoto il modulo NON invia nulla
     e mostra un messaggio d'errore onesto. */
  var FORM_ENDPOINT = '';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Voce di menu attiva durante lo scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a'));
  if ('IntersectionObserver' in window) {
    var current = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) current.observe(s);
    });
  }

  /* ---------- Come funziona: linea che si riempie con lo scroll ---------- */
  var journey = document.querySelector('.journey');
  if (journey) {
    var steps = journey.querySelectorAll('.journey-step');
    var ticking = false;

    var updateJourney = function () {
      ticking = false;
      var r = journey.getBoundingClientRect();
      var vh = window.innerHeight;
      // 0 quando la sezione entra al 75% della viewport, 1 quando la sua fine arriva al 60%
      var p = (vh * 0.75 - r.top) / (r.height + vh * 0.15);
      p = Math.max(0, Math.min(1, p));
      journey.style.setProperty('--p', p.toFixed(3));
      steps.forEach(function (step, i) {
        var threshold = steps.length > 1 ? i / (steps.length - 1) : 0;
        if (p >= threshold - 0.02) step.classList.add('is-active');
      });
    };

    if (reduceMotion) {
      journey.style.setProperty('--p', '1');
      steps.forEach(function (s) { s.classList.add('is-active'); });
    } else {
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateJourney); }
      }, { passive: true });
      window.addEventListener('resize', updateJourney);
      updateJourney();
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Accordion FAQ ---------- */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));

      if (reduceMotion) { panel.hidden = open; return; }

      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
        panel.addEventListener('transitionend', function done() {
          panel.hidden = true;
          panel.style.height = '';
          panel.removeEventListener('transitionend', done);
        });
      } else {
        panel.hidden = false;
        panel.style.height = '0px';
        requestAnimationFrame(function () { panel.style.height = panel.scrollHeight + 'px'; });
        panel.addEventListener('transitionend', function done() {
          panel.style.height = '';
          panel.removeEventListener('transitionend', done);
        });
      }
    });
  });

  /* ---------- Modulo contatti ---------- */
  var form = document.getElementById('contact-form');
  var status = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var startedAt = Date.now();

  var messages = {
    nome: 'Inserisci il tuo nome.',
    email: 'Inserisci un indirizzo email valido.',
    messaggio: 'Scrivi un breve messaggio.',
    privacy: 'Per inviare la richiesta è necessario accettare l\'informativa privacy.'
  };

  function setError(field, msg) {
    var id = field.id + '-error';
    var existing = document.getElementById(id);
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', id);
      if (!existing) {
        existing = document.createElement('span');
        existing.className = 'field-error';
        existing.id = id;
        field.closest('.field').appendChild(existing);
      }
      existing.textContent = msg;
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      if (existing) existing.remove();
    }
  }

  function validate() {
    var firstInvalid = null;
    ['nome', 'email', 'messaggio', 'privacy'].forEach(function (name) {
      var field = form.elements[name];
      var ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '' && field.checkValidity();
      setError(field, ok ? '' : messages[name]);
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, '');
  });

  function showStatus(text, type) {
    status.textContent = text;
    status.className = 'form-status ' + (type ? 'is-' + type : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showStatus('', '');
    if (!validate()) return;

    // Antispam: honeypot compilato o invio troppo rapido (bot)
    if (form.elements._gotcha.value || Date.now() - startedAt < 3000) {
      showStatus('Grazie! La tua richiesta è stata inviata.', 'success');
      form.reset();
      return;
    }

    if (!FORM_ENDPOINT) {
      showStatus('Il modulo non è ancora attivo. Nel frattempo puoi scrivermi su Instagram.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Invio in corso…';

    var data = new FormData(form);
    data.append('_subject', 'Nuova richiesta di consulenza dal sito');

    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showStatus('Grazie! La tua richiesta è stata inviata. Ti risponderò al più presto.', 'success');
        form.reset();
        startedAt = Date.now();
      })
      .catch(function () {
        showStatus('Si è verificato un errore durante l\'invio. Riprova tra qualche minuto oppure scrivimi su Instagram.', 'error');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Invia la richiesta';
      });
  });

  /* ---------- Anno nel footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
