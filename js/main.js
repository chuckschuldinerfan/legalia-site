/* Legalia: the team list and its cards, the experience year, menu state and the language switch.
   Plain JavaScript, no dependencies. All texts come from js/i18n.js. */
(() => {
  'use strict';

  const I18N = window.LEGALIA_I18N;
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
    renderTraits();
    labelTeam();
    typer.prepare();
    fitAll();
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('legalia-lang', lang); } catch (e) { /* storage blocked: the choice just isn't remembered */ }
  }

  /* ---------- the team: a list of names; pressing one opens its details under it ---------- */
  /* After the k72.ca/en/about list: pointing at a row fills it with the accent and the name decodes
     into "Kontakt", letter by letter out of random characters (and back when the pointer leaves).
     Pressing the row opens it downwards with the person's details; one row is open at a time. */
  const rows = $('#roster .rows');
  TEAM.forEach(id => {
    const li = $('#row-tpl').content.firstElementChild.cloneNode(true);
    li.dataset.id = id;
    $$('[data-k]', li).forEach(k => {
      if (k.dataset.k === 'email') { k.textContent = `${id}@legalia.ee`; k.href = `mailto:${id}@legalia.ee`; }
      else k.dataset.i18n = `team.${id}.${k.dataset.k}`;
    });
    $('.more', li).id = `more-${id}`;
    $('.row', li).setAttribute('aria-controls', `more-${id}`);
    rows.append(li);
  });

  // The decode: every letter flickers through random characters and settles on its own, a little
  // later than the one before it; the word grows or shrinks to the new length on the way.
  const GLYPHS = { et: 'ABDEFGHIJKLMNOPRSTUVÕÄÖÜ', en: 'ABCDEFGHIJKLMNOPRSTUVWXYZ', ru: 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ' }; // letters only
  function scramble(el, to) {
    cancelAnimationFrame(el.scrambling);
    const from = el.textContent;
    if (from === to) return;
    if (reduceMotion.matches || !from) { el.textContent = to; return; }
    const settle = [...to].map((_, i) => 40 + i * 16 + Math.random() * 50); // ms after the start: about 0.3s in all
    const end = Math.max(...settle), t0 = performance.now();
    const glyphs = GLYPHS[lang];
    let last = 0;
    const step = now => {
      const t = now - t0;
      if (now - last > 40 || t >= end) { // a new random letter about 25 times a second: calm, not frantic
        last = now;
        const len = Math.round(from.length + (to.length - from.length) * Math.min(1, t / end));
        let out = '';
        for (let i = 0; i < len; i++) out += i < to.length && t >= settle[i] ? to[i] : glyphs[Math.random() * glyphs.length | 0];
        el.textContent = out;
      }
      if (t < end) el.scrambling = requestAnimationFrame(step); else el.textContent = to;
    };
    el.scrambling = requestAnimationFrame(step);
  }
  const hoverable = matchMedia('(hover: hover)');
  const nameOf = li => text(`team.${li.dataset.id}.name`).value;
  // "Kontakt" while the pointer is on the row (or the keyboard is on it), the name otherwise.
  const shown = li => (hoverable.matches && li.matches(':hover')) || $('.row', li).matches(':focus-visible');
  const wordFor = li => (shown(li) ? text('nav.contact').value : nameOf(li));
  const label = li => scramble($('.scr', li), wordFor(li));
  rows.addEventListener('pointerover', e => { const li = e.target.closest('.member'); if (li && e.pointerType === 'mouse') label(li); });
  rows.addEventListener('pointerout', e => { const li = e.target.closest('.member'); if (li && !li.contains(e.relatedTarget)) requestAnimationFrame(() => label(li)); });
  rows.addEventListener('focusin', e => { const li = e.target.closest('.member'); if (li) label(li); });
  rows.addEventListener('focusout', e => { const li = e.target.closest('.member'); if (li) requestAnimationFrame(() => label(li)); });
  // After a language change: the words in the new language at once, without the animation.
  const labelTeam = () => $$('.member', rows).forEach(li => { const el = $('.scr', li); cancelAnimationFrame(el.scrambling); el.textContent = wordFor(li); });

  function setOpen(li, on) {
    li.classList.toggle('open', on);
    $('.row', li).setAttribute('aria-expanded', String(on));
    $('.more', li).inert = !on;
  }
  rows.addEventListener('click', e => {
    const row = e.target.closest('.row');
    if (!row) return;
    const li = row.parentElement, on = !li.classList.contains('open');
    $$('.member.open', rows).forEach(m => m !== li && setOpen(m, false));
    setOpen(li, on);
  });

  /* ---------- characteristics: one line per word, sliding up into view ---------- */
  const traits = $('.traits-list');
  function renderTraits() {
    const t = text('traits.items');
    traits.replaceChildren(...t.value.map(w => {
      const ln = document.createElement('span'), inner = document.createElement('span');
      ln.className = 'ln'; inner.textContent = w;
      ln.append(inner);
      return ln;
    }));
    if (t.lang !== lang) traits.lang = t.lang; else traits.removeAttribute('lang');
  }
  /* The words stay at their step unless the longest line would run past the right edge of their
     columns (long Russian words, narrow screens); then they shrink just enough to fit. */
  function fitTraits() {
    traits.style.fontSize = '';
    const widest = Math.max(...$$('.ln > span', traits).map(x => x.offsetWidth));
    const over = widest / traits.clientWidth;
    if (over > 1) traits.style.fontSize = `${parseFloat(getComputedStyle(traits).fontSize) / over * 0.99}px`;
  }
  const fitAll = fitTraits;
  // The first time the page is well in view, the words slide up from below one after the other,
  // then the texts on the right.
  const traitsSection = $('#omadused');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    traitsSection.classList.add('hold');
    const io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      io.disconnect();
      traitsSection.classList.replace('hold', 'shown');
    }, { threshold: 0.35 });
    io.observe(traitsSection);
  }

  /* ---------- "Meist" text types itself out the first time it comes into view ---------- */
  /* Quick on purpose (about 1.2s for the whole paragraph). Screen readers get the full text
     straight away from a hidden copy; the typed version is aria-hidden. Reduced motion: no typing. */
  const typer = (() => {
    const el = $('.about');
    let state = 'idle'; // idle -> running -> done
    let typedNode, rest, caret, full = '', frame = 0;
    // Screen readers read the hidden full copy; the visible, typed version is aria-hidden.
    function build(typedText) {
      full = el.textContent;
      const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = full;
      const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
      typedNode = document.createTextNode(typedText ? full : '');
      caret = document.createElement('span'); caret.className = 'caret';
      rest = document.createElement('span'); rest.className = 'rest'; rest.textContent = typedText ? '' : full;
      vis.append(typedNode, caret, rest);
      el.replaceChildren(sr, vis);
    }
    function finish() { state = 'done'; rest.textContent = ''; caret.classList.add('blink'); }
    function prepare() {
      // Called after every language change (put() has just written the plain new text).
      if (reduceMotion.matches) { cancelAnimationFrame(frame); state = 'done'; return; } // plain text, no caret
      if (state === 'running') cancelAnimationFrame(frame);
      if (state === 'idle') { build(false); return; }
      build(true); finish(); // already typed once: show it all, caret blinking at the end
    }
    function start() {
      if (state !== 'idle' || reduceMotion.matches) return;
      state = 'running';
      const duration = Math.min(3200, Math.max(2000, full.length * 5)); // about 2.5s for the Estonian text
      const t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / duration);
        const n = Math.round(full.length * (1 - Math.pow(1 - p, 1.3))); // a touch faster at the start
        typedNode.data = full.slice(0, n);
        rest.textContent = full.slice(n);
        if (p < 1) frame = requestAnimationFrame(step); else finish();
      };
      frame = requestAnimationFrame(step);
    }
    return { prepare, start, get state() { return state; } };
  })();
  let fitFrame = 0;
  addEventListener('resize', () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitAll); });
  if (document.fonts) document.fonts.ready.then(fitAll);


  /* ---------- the logo in the middle of the first screen: a copy of the header logo ---------- */
  const big = $('header .logo').cloneNode(true);
  big.removeAttribute('class');
  $('.lockup').append(big);


  /* ---------- the year: turns from 1992 to this year with the scroll, while the experience page is held on screen ---------- */
  const FROM = 1992, TO = new Date().getFullYear();
  const yearEl = $('.year');
  const strips = [...String(TO)].map(() => {
    const d = document.createElement('span'), strip = document.createElement('span');
    d.className = 'd'; strip.className = 's';
    for (let i = 0; i <= 10; i++) strip.append(Object.assign(document.createElement('span'), { textContent: i % 10 }));
    d.append(strip); yearEl.append(d);
    return strip;
  });
  yearEl.setAttribute('aria-label', String(TO));
  // Odometer: each digit turns continuously; a higher digit only moves while every lower one passes 9 -> 0.
  function showYear(y) {
    strips.forEach((strip, i) => {
      const unit = 10 ** (strips.length - 1 - i);
      const whole = Math.floor(y / unit) % 10;
      const carry = unit === 1 ? y % 1 : Math.max(0, (y % unit) - (unit - 1));
      strip.style.transform = `translate3d(0, ${-(whole + carry)}em, 0)`;
    });
  }
  // Fit: the digits' ink spans exactly the page margins, and each column window is cropped to the
  // digits' height, so the year lines up with the text above on the left and with the margins on the
  // right and bottom. Measured with the page's own font at 100px.
  function fitYear() {
    yearEl.style.fontSize = '100px';
    const cs = getComputedStyle(yearEl);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${cs.fontWeight} 100px ${cs.fontFamily}`;
    const digits = String(TO);
    const first = ctx.measureText(digits[0]), last = ctx.measureText(digits[digits.length - 1]);
    const zero = ctx.measureText('0');
    const left = -first.actualBoundingBoxLeft;                          // blank before the first digit's ink
    const right = last.width - last.actualBoundingBoxRight;             // blank after the last one's
    const advance = $$('.d', yearEl).reduce((w, d) => w + d.getBoundingClientRect().width, 0);
    const avail = document.documentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(getComputedStyle($('.years .grid')).paddingRight);
    const size = (avail * 100) / (advance - left - right);
    yearEl.style.fontSize = `${size}px`;
    yearEl.style.marginLeft = `${(-left * size) / 100}px`;
    // Vertical: where the digits' ink sits inside a 1em line box.
    const asc = zero.fontBoundingBoxAscent, desc = zero.fontBoundingBoxDescent;
    const baseline = (100 - (asc + desc)) / 2 + asc;                    // from the top of the line box
    const inkTop = baseline - zero.actualBoundingBoxAscent;
    yearEl.style.setProperty('--yt', (inkTop / 100).toFixed(4));
    yearEl.style.setProperty('--yh', ((zero.actualBoundingBoxAscent + zero.actualBoundingBoxDescent) / 100 + 0.004).toFixed(4));
  }
  fitYear();
  addEventListener('resize', fitYear);
  if (document.fonts) document.fonts.ready.then(fitYear);

  // 1992 when the page reaches the top of the screen, this year when it is about to be released.
  const years = $('#kogemus');
  function yearFromScroll() {
    if (reduceMotion.matches) return showYear(TO);
    const r = years.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    showYear(FROM + (TO - FROM) * p);
  }
  yearFromScroll();

  /* ---------- menu: highlight what is in view; stop card videos once the team is off screen ---------- */
  const about = $('#meist');
  const header = $('header');
  const navLinks = $$('[data-nav]');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const mid = innerHeight * 0.5;
    const { top: aboutTop, bottom: aboutBottom } = about.getBoundingClientRect();
    const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    const cur = atBottom ? 'kontakt' : aboutTop < mid && aboutBottom > mid ? 'meist' : null;
    navLinks.forEach(a => (a.dataset.nav === cur ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    header.classList.toggle('at-hero', scrollY < innerHeight * 0.5);
    if (aboutTop < mid) typer.start();
    yearFromScroll();
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Menu links: "Meist" scrolls to the about section, "Kontakt" to the very bottom, where the bar is. */
  const target = { meist: () => about.getBoundingClientRect().top + scrollY, kontakt: () => document.documentElement.scrollHeight };
  navLinks.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: target[a.dataset.nav](), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
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
