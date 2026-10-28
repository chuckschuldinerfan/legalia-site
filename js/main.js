/* Legalia: card rendering, flip and video behaviour, menu state and the language switch.
   Plain JavaScript, no dependencies. All texts come from js/i18n.js. */
(() => {
  'use strict';

  const I18N = window.LEGALIA_I18N;
  const ASSETS = 'assets/';
  const LANGS = ['et', 'en', 'ru'];
  const TEAM = ['aivar', 'dragan', 'henrik', 'gert', 'piret']; // card order, left to right
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let lang = 'et';

  /* ---------- texts ---------- */

  const isTodo = v => typeof v === 'string' ? v.startsWith('TODO') : Array.isArray(v) && v.some(isTodo);
  const lookup = (dict, key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);

  // Returns the text for `key` in the current language, or the Estonian one while it is still a TODO.
  function text(key) {
    const own = lookup(I18N[lang], key);
    if (own != null && !isTodo(own)) return { value: own, lang };
    return { value: lookup(I18N.et, key), lang: 'et' };
  }

  // Arrays are lines: each item on its own line.
  function put(el, key) {
    const t = text(key);
    const lines = Array.isArray(t.value) ? t.value : [t.value ?? ''];
    el.replaceChildren(...lines.flatMap((line, i) => (i ? [document.createElement('br'), line] : [line])));
    if (t.lang !== lang) el.lang = t.lang; else el.removeAttribute('lang');
    el.hidden = !lines.some(Boolean);
  }

  function applyLanguage(next) {
    lang = LANGS.includes(next) ? next : 'et';
    document.documentElement.lang = lang;
    document.title = text('meta.title').value;
    $$('[data-i18n]').forEach(el => put(el, el.dataset.i18n));
    $$('[data-i18n-label]').forEach(el => el.setAttribute('aria-label', text(el.dataset.i18nLabel).value));
    $$('.card').forEach(labelCard);
    fitAll();
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('legalia-lang', lang); } catch (e) { /* storage blocked: the choice just isn't remembered */ }
  }

  /* ---------- cards ---------- */

  const list = $('#cards');
  const tpl = $('#card-tpl');

  TEAM.forEach((id, i) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    card.dataset.id = id;
    $$('[data-k]', card).forEach(el => {
      if (el.dataset.k === 'email') el.textContent = `${id}@legalia.ee`;
      else el.dataset.i18n = `team.${id}.${el.dataset.k}`;
    });
    const back = $('.back', card);
    back.id = `bio-${id}`;
    $('.flip', card).setAttribute('aria-controls', back.id);
    $('source', card).srcset = `${ASSETS}img/${id}.webp`;
    const img = $('img', card);
    img.src = `${ASSETS}img/${id}.png`;
    // The first two cards are on screen everywhere; the rest sit off to the side on phones.
    img.loading = i < 2 ? 'eager' : 'lazy';
    $('video', card).dataset.src = `${ASSETS}video/${id}.mp4`;
    list.append(card);
    setupCard(card);
  });

  function labelCard(card) {
    const id = card.dataset.id;
    const flipped = $('.flip', card).getAttribute('aria-expanded') === 'true';
    $('.flip', card).setAttribute('aria-label',
      `${text(`team.${id}.name`).value}, ${text(`team.${id}.title`).value}. ${text(flipped ? 'card.back' : 'card.flip').value}`);
  }

  /* The video plays only while a mouse is over the card AND the photo side faces the viewer.
     It is fetched on the first hover, never before, and never on touch screens. */
  function setupCard(card) {
    const flipBtn = $('.flip', card);
    const video = $('video', card);
    const back = $('.back', card);
    let hovering = false;
    let playedThisHover = false; // the clip runs once per hover, then rests on its last frame

    // Photo side fully facing the viewer: not flipped and not in the middle of a turn.
    const facesViewer = () => !card.classList.contains('flipped') && !card.classList.contains('flipping');
    const shouldPlay = () => hovering && facesViewer() && !reduceMotion.matches && !document.hidden;

    function play() {
      if (playedThisHover || !shouldPlay()) return;
      playedThisHover = true;
      if (!video.src) { video.src = video.dataset.src; video.preload = 'auto'; }
      rewind();
      const p = video.play();
      if (p) p.catch(() => {}); // autoplay refusals and interrupted loads are harmless here
    }
    // Seek only when not already at the start: Firefox stalls ("waiting" forever) on a
    // redundant seek to 0 right before play(), so every hover after the first froze there.
    function rewind() { if (video.readyState > 0 && video.currentTime !== 0) video.currentTime = 0; }
    function stop() {
      video.pause();
      card.classList.remove('is-playing');
      rewind();
    }
    // Shown only once real frames are coming, so the photo never blinks to an empty box.
    video.addEventListener('playing', () => {
      if (shouldPlay()) card.classList.add('is-playing'); else stop();
    });
    card.stopVideo = stop;

    // One continuous turn, run by CSS animations (see .to-back / .to-front in style.css).
    let busy = false;
    const turn = $('.turn', card);
    async function setFlipped(on) {
      if (busy) return; // a click during a turn is ignored rather than queued
      busy = true;
      stop(); // the video never runs during a turn, in either direction
      if (on) video.hidden = true; // and is gone entirely on the text side
      // Screen readers get the new state at once.
      flipBtn.setAttribute('aria-expanded', String(on));
      back.setAttribute('aria-hidden', String(!on));
      labelCard(card);
      card.classList.add('flipping');
      card.classList.toggle('flipped', on);
      if (!reduceMotion.matches) {
        const cls = on ? 'to-back' : 'to-front';
        card.classList.add(cls);
        await new Promise(resolve => {
          const done = e => { if (e && e.target !== turn) return; turn.removeEventListener('animationend', done); clearTimeout(t); resolve(); };
          const t = setTimeout(done, 1000); // in case animationend never arrives
          turn.addEventListener('animationend', done);
        });
        card.classList.remove(cls);
      }
      card.classList.remove('flipping');
      if (!on) video.hidden = false; // the photo side is fully facing the viewer again
      busy = false;
      // Turning back to the photo does not restart the clip: that would be a second play in one hover.
    }

    // A real <button>, so Enter and Space flip it without extra key handling.
    flipBtn.addEventListener('click', () => setFlipped(!card.classList.contains('flipped')));
    card.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      hovering = true; playedThisHover = false;
      card.classList.add('tracking');
      if (facesViewer()) play(); // on the text side a hover does nothing to the video
    });
    card.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'mouse') return;
      hovering = false;
      if (!video.hidden) stop(); // no seeking a hidden video on the text side
      card.classList.remove('tracking'); // settles back over the slower .8s
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
    });

    // Tilt follows the mouse: the part of the card under the pointer dips away a little.
    let tiltFrame = 0, px = 0, py = 0;
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      const r = card.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;  // -1 left edge, 1 right edge
      py = ((e.clientY - r.top) / r.height) * 2 - 1;  // -1 top, 1 bottom
      if (!tiltFrame) tiltFrame = requestAnimationFrame(() => {
        tiltFrame = 0;
        if (!hovering) return;
        card.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`);
      });
    });
  }

  /* Fit: measured with offsets, so the flip and the tilt don't distort the numbers.
     1. If any hint would touch its name, all hints move down to the title line together.
     2. A bio that runs into the email first loses some spacing, then shrinks in half-pixel steps. */
  function fitCards() {
    list.classList.remove('hint-low');
    const cards = $$('.card');
    if (cards.some(c => { const n = $('.who [data-k=name]', c), h = $('.hint', c); return n.offsetLeft + n.offsetWidth > h.offsetLeft - 8; }))
      list.classList.add('hint-low');
    cards.forEach(card => {
      const bio = $('.bio', card), mail = $('.mail', card);
      card.classList.remove('tight');
      bio.style.fontSize = '';
      const overflows = () => bio.offsetTop + bio.offsetHeight > mail.offsetTop - 8;
      if (!overflows()) return;
      card.classList.add('tight');
      let size = parseFloat(getComputedStyle(bio).fontSize);
      while (overflows() && size > 8) { size -= 0.5; bio.style.fontSize = `${size}px`; }
    });
  }
  // "Meist" pins as one screen: its text starts at step 3 of the type scale and steps down
  // in half pixels only if label and text would not fit (small phones, longer translations).
  function fitAbout() {
    const sec = $('#meist'), inner = sec.firstElementChild, text = $('.about', sec);
    text.style.fontSize = '';
    const cs = getComputedStyle(sec);
    const room = sec.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    let size = parseFloat(getComputedStyle(text).fontSize);
    while (inner.offsetHeight > room && size > 14) { size -= 0.5; text.style.fontSize = `${size}px`; }
  }
  const fitAll = () => { fitCards(); fitAbout(); };
  let fitFrame = 0;
  addEventListener('resize', () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitAll); });
  if (document.fonts) document.fonts.ready.then(fitAll);

  const stopAll = () => $$('.card').forEach(c => c.stopVideo());
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) stopAll(); });

  /* ---------- menu: highlight the section in view; stop videos once the hero is covered ---------- */

  const about = $('#meist');
  const contact = $('#kontakt');
  const navLinks = $$('[data-nav]');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const mid = innerHeight * 0.5;
    const cur = contact.getBoundingClientRect().top < mid ? 'kontakt' : about.getBoundingClientRect().top < mid ? 'meist' : null;
    navLinks.forEach(a => (a.dataset.nav === cur ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    if (about.getBoundingClientRect().top < innerHeight * 0.25) stopAll();
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* Menu links scroll to where each section sits in the page. Plain anchors can't do this for
     "Meist": it is pinned, so once Kontakt covers it the browser thinks it is already in view. */
  const sectionTop = {
    meist: () => $('main').offsetTop + $('.hero').offsetHeight,
    kontakt: () => $('main').offsetTop + $('.hero').offsetHeight + about.offsetHeight
  };
  navLinks.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: sectionTop[a.dataset.nav](), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }));

  /* ---------- smooth scrolling ---------- */
  /* Mouse wheel and trackpad scrolling glide to their target instead of jumping. Touch screens,
     keyboard, scrollbar dragging and reduced-motion users keep the browser's own scrolling;
     menu links use CSS scroll-behavior: smooth. */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const root = document.documentElement;
    let target = scrollY, current = scrollY, last = 0, running = false;
    const maxScroll = () => root.scrollHeight - innerHeight;

    function frame(now) {
      if (!running) return;
      const dt = Math.min(64, now - (last || now - 16.7));
      last = now;
      current += (target - current) * (1 - Math.pow(0.9, dt / 16.7)); // ~10% of the way per 60Hz frame
      if (Math.abs(target - current) < 0.5) current = target;
      scrollTo(0, current);
      if (current !== target) requestAnimationFrame(frame);
      else { running = false; root.style.scrollBehavior = ''; }
    }

    addEventListener('wheel', e => {
      if (reduceMotion.matches || e.ctrlKey || e.shiftKey || e.defaultPrevented) return; // pinch-zoom, sideways
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // sideways swipes stay native (card row)
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
      if (!running) { target = current = scrollY; }
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit));
      if (!running) {
        running = true; last = 0;
        root.style.scrollBehavior = 'auto'; // per-frame scrollTo must not be smoothed a second time
        requestAnimationFrame(frame);
      }
    }, { passive: false });

    // Any other scroll (keys, scrollbar, menu links) takes over; the glide stops there.
    addEventListener('scroll', () => {
      if (running && Math.abs(scrollY - current) > 2) { running = false; target = current = scrollY; root.style.scrollBehavior = ''; }
    }, { passive: true });
  }

  /* ---------- language switch ---------- */

  $$('[data-lang]').forEach(b => b.addEventListener('click', () => applyLanguage(b.dataset.lang)));

  let saved = null;
  try { saved = localStorage.getItem('legalia-lang'); } catch (e) { /* ignore */ }
  applyLanguage(saved || 'et');

  $('#year').textContent = new Date().getFullYear();
  onScroll();

  // Report what is still missing, for whoever pastes the official texts in.
  ['en', 'ru'].forEach(l => {
    const missing = [];
    (function walk(o, path) {
      Object.entries(o).forEach(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? walk(v, `${path}${k}.`) : isTodo(v) && missing.push(path + k)));
    })(I18N[l], '');
    if (missing.length) console.info(`[i18n] ${l.toUpperCase()}: ${missing.length} texts still TODO (shown in Estonian)`);
  });
})();
