/* Legalia: the team list and its cards, the experience year, menu state and the language switch.
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
    typer.prepare();
    fitAll();
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('legalia-lang', lang); } catch (e) { /* storage blocked: the choice just isn't remembered */ }
  }

  /* ---------- the team: a list of names; pressing one opens that person's card ---------- */
  /* The rows are buttons (after the k72.ca/en/about list: pointing at one fills it with the accent).
     Pressing a row opens the card in a modal dialog over the blurred page: the photo (its clip plays
     once) with the name and the description under it. Esc, the close button or a press outside closes
     it, and focus goes back to the row. */
  const team = (() => {
    const rows = $('#roster .rows'), rowTpl = $('#row-tpl');
    const dlg = $('#person'), sheet = $('.sheet', dlg), video = $('video', dlg);
    let current = null, closing = 0;
    TEAM.forEach(id => {
      const li = rowTpl.content.firstElementChild.cloneNode(true);
      const row = $('.row', li);
      row.dataset.id = id;
      $$('[data-k]', li).forEach(k => (k.dataset.i18n = `team.${id}.${k.dataset.k}`));
      rows.append(li);
    });
    // The card's fields point at the open person's texts, so a language change re-fills them too.
    function fill(id) {
      $$('[data-k]', dlg).forEach(k => {
        if (k.dataset.k === 'email') { k.textContent = `${id}@legalia.ee`; k.href = `mailto:${id}@legalia.ee`; }
        else { k.dataset.i18n = `team.${id}.${k.dataset.k}`; put(k, k.dataset.i18n); }
      });
      dlg.dataset.id = id;
      $('source', dlg).srcset = `${ASSETS}img/${id}.webp`;
      $('img', dlg).src = `${ASSETS}img/${id}.png`;
      stopClip();
      video.removeAttribute('src'); video.load();
      video.dataset.src = `${ASSETS}video/${id}.mp4?v=2`;
    }
    function stopClip() {
      video.pause(); dlg.classList.remove('is-playing');
      if (video.readyState > 0 && video.currentTime !== 0) video.currentTime = 0;
    }
    function playClip() {
      if (reduceMotion.matches || document.hidden) return;
      if (!video.src) { video.src = video.dataset.src; video.preload = 'auto'; }
      const p = video.play(); if (p) p.catch(() => {});
    }
    // Shown only once real frames are coming, so the photo never blinks to an empty box.
    video.addEventListener('playing', () => { if (dlg.open) dlg.classList.add('is-playing'); else stopClip(); });
    function open(row) {
      clearTimeout(closing); dlg.classList.remove('closing');
      current = row;
      if (dlg.dataset.id !== row.dataset.id) fill(row.dataset.id);
      if (!dlg.open) dlg.showModal();
      document.documentElement.classList.add('modal-open');
      sheet.scrollTop = 0;
      $('.close', dlg).focus({ preventScroll: true });
      playClip();
    }
    // A short fade out before the dialog leaves the top layer.
    function close() {
      if (!dlg.open || dlg.classList.contains('closing')) return;
      const done = () => { dlg.classList.remove('closing'); dlg.close(); };
      if (reduceMotion.matches) { done(); return; }
      dlg.classList.add('closing');
      closing = setTimeout(done, 200);
    }
    dlg.addEventListener('close', () => {
      stopClip();
      document.documentElement.classList.remove('modal-open');
      if (current) current.focus({ preventScroll: true });
    });
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); }); // Esc
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); }); // a press outside the card
    $('.close', dlg).addEventListener('click', close);
    rows.addEventListener('click', e => { const r = e.target.closest('.row'); if (r) open(r); });
    return { stop: stopClip };
  })();
  /* The characteristics stay at step 5 unless the longest line would run past the right edge of its
     columns (long Russian words, narrow screens); then they shrink just enough to fit. */
  function fitTraits() {
    const el = $('.traits-list');
    el.style.fontSize = '';
    const over = el.scrollWidth / el.clientWidth;
    if (over > 1) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) / over * 0.99}px`;
  }
  const fitAll = fitTraits;

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

  const stopAll = () => team.stop();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) stopAll(); });

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
      if (root.classList.contains('modal-open') || reduceMotion.matches || e.ctrlKey || e.shiftKey || e.defaultPrevented) return; // pinch-zoom, sideways
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
