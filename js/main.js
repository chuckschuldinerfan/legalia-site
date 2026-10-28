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
    typer.prepare();
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
    const front = $('.front', card), back = $('.back', card);
    front.id = `photo-${id}`;
    back.id = `bio-${id}`;
    $('.front .flip', card).setAttribute('aria-controls', back.id);
    $('.back .flip', card).setAttribute('aria-controls', front.id);
    $('source', card).srcset = `${ASSETS}img/${id}.webp`;
    const img = $('picture img', card);
    img.src = `${ASSETS}img/${id}.png`;
    // The first two cards are on screen everywhere; the rest sit off to the side on phones.
    img.loading = i < 2 ? 'eager' : 'lazy';
    $('video', card).dataset.src = `${ASSETS}video/${id}.mp4`;
    list.append(card);
    setupCard(card);
  });

  // Each face has its own flip button; its label names the person so it makes sense out of context.
  /* ---------- phones: endless one-card carousel (like legalia.ee, without arrows) ---------- */
  /* Every card sits at --x = its distance from the center, wrapped so the row loops both ways:
     left of the first card comes the last one. A horizontal swipe moves exactly one card; a
     vertical swipe is left to the browser (touch-action: pan-y) and scrolls the page. */
  const phone = matchMedia('(max-width: 760px)');
  const carousel = (() => {
    const cards = $$('.card', list), n = cards.length;
    let pos = 0, anim = 0, active = -1;
    const pitch = () => cards[0].offsetWidth + 12;                              // card width + gap
    const wrap = d => ((((d + n / 2) % n) + n) % n) - n / 2;                     // into [-n/2, n/2)
    const index = () => ((Math.round(pos) % n) + n) % n;
    function render() {
      if (!phone.matches) return;
      const w = pitch();
      cards.forEach((c, i) => c.style.setProperty('--x', `${(wrap(i - pos) * w).toFixed(2)}px`));
    }
    function settle() {
      const k = index();
      if (k === active) return;
      active = k;
      cards.forEach((c, i) => (i === k ? c.autoPlay() : c.autoStop()));
    }
    function animateTo(target) {
      cancelAnimationFrame(anim);
      const from = pos, t0 = performance.now(), dur = reduceMotion.matches ? 0 : 380;
      const tick = now => {
        const p = dur ? Math.min(1, (now - t0) / dur) : 1;
        pos = from + (target - from) * (1 - Math.pow(1 - p, 3));                // ease-out
        render();
        if (p < 1) anim = requestAnimationFrame(tick); else { pos = target; render(); settle(); }
      };
      anim = requestAnimationFrame(tick);
    }

    let drag = null, dragged = false, vx = 0, last = null;
    list.addEventListener('pointerdown', e => {
      if (!phone.matches || e.button > 0) return;
      cancelAnimationFrame(anim);
      drag = { x: e.clientX, y: e.clientY, pos, id: e.pointerId, axis: null };
      last = { x: e.clientX, t: e.timeStamp }; vx = 0; dragged = false;
    });
    list.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.axis) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { drag.axis = 'x'; list.setPointerCapture(e.pointerId); list.classList.add('dragging'); }
        else if (Math.abs(dy) > 8) { drag = null; animateTo(Math.round(pos)); return; } // vertical: the page scrolls
        else return;
      }
      dragged = true;
      const dt = e.timeStamp - last.t;
      if (dt > 0) vx = (e.clientX - last.x) / dt;
      last = { x: e.clientX, t: e.timeStamp };
      pos = drag.pos - dx / pitch();
      render();
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      list.classList.remove('dragging');
      const base = Math.round(d.pos);
      if (d.axis !== 'x') { animateTo(base); return; }
      const dx = e.clientX - d.x, w = pitch();
      // one card per swipe: far enough or fast enough moves to the neighbour
      const target = dx < -w * 0.15 || vx < -0.3 ? base + 1 : dx > w * 0.15 || vx > 0.3 ? base - 1 : base;
      animateTo(target);
    };
    list.addEventListener('pointerup', release);
    list.addEventListener('pointercancel', release);
    // A swipe is not a tap: swallow the click that follows a drag, so it never flips a card.
    list.addEventListener('click', e => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
    // Keyboard and screen-reader focus brings its card to the center.
    list.addEventListener('focusin', e => {
      if (!phone.matches) return;
      const i = cards.indexOf(e.target.closest('.card'));
      if (i >= 0) animateTo(Math.round(pos + wrap(i - pos)));
    });
    phone.addEventListener('change', () => {
      if (phone.matches) { render(); settle(); return; }
      cards.forEach(c => { c.style.removeProperty('--x'); c.autoStop(); });
      active = -1;
    });
    return { render, start() { if (phone.matches) { render(); settle(); } } };
  })();

  function labelCard(card) {
    const name = text(`team.${card.dataset.id}.name`).value;
    $('.front .flip', card).setAttribute('aria-label', `${text('card.flip').value}: ${name}`);
    $('.back .flip', card).setAttribute('aria-label', `${text('card.back').value}: ${name}`);
  }

  /* The video plays only while a mouse is over the card AND the photo side faces the viewer.
     It is fetched on the first hover, never before, and never on touch screens. */
  function setupCard(card) {
    const video = $('video', card);
    const front = $('.front', card), back = $('.back', card);
    const frontBtn = $('.flip', front), backBtn = $('.flip', back);
    let hovering = false;
    let playedThisHover = false; // the clip runs once per hover, then rests on its last frame
    let auto = false;            // phones: the carousel asks the centered card to play

    // Photo side fully facing the viewer: not flipped and not in the middle of a turn.
    const facesViewer = () => !card.classList.contains('flipped') && !card.classList.contains('flipping');
    const shouldPlay = () => (hovering || auto) && facesViewer() && !reduceMotion.matches && !document.hidden;

    // Seek only when not already at the start: Firefox stalls ("waiting" forever) on a
    // redundant seek to 0 right before play(), so every hover after the first froze there.
    function rewind() { if (video.readyState > 0 && video.currentTime !== 0) video.currentTime = 0; }
    function play() {
      if (playedThisHover || !shouldPlay()) return;
      playedThisHover = true;
      if (!video.src) { video.src = video.dataset.src; video.preload = 'auto'; }
      rewind();
      const p = video.play();
      if (p) p.catch(() => {}); // autoplay refusals and interrupted loads are harmless here
    }
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
    // Phones have no hover: the carousel plays the clip once when this card arrives in the center.
    card.autoPlay = () => { auto = true; playedThisHover = false; play(); };
    card.autoStop = () => { auto = false; if (!video.hidden) stop(); };

    // One continuous turn, run by CSS animations (see .to-back / .to-front in style.css).
    let busy = false;
    const turn = $('.turn', card);
    async function setFlipped(on) {
      if (busy) return; // a press during a turn is ignored rather than queued
      busy = true;
      const hadFocus = document.activeElement === (on ? frontBtn : backBtn);
      stop(); // the video never runs during a turn, in either direction
      if (on) video.hidden = true; // and is gone entirely on the text side
      front.setAttribute('aria-hidden', String(on));
      back.setAttribute('aria-hidden', String(!on));
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
      // Keyboard users keep their place: focus moves to the button on the side now showing.
      if (hadFocus) (on ? backBtn : frontBtn).focus({ preventScroll: true });
      busy = false;
      // Turning back to the photo does not restart the clip: that would be a second play in one hover.
    }

    // Only the buttons flip the card, so the rest of it (names, emails) can be selected and copied.
    frontBtn.addEventListener('click', () => setFlipped(true));
    backBtn.addEventListener('click', () => setFlipped(false));
    card.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      hovering = true; playedThisHover = false;
      if (facesViewer()) play(); // on the text side a hover does nothing to the video
    });
    card.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'mouse') return;
      hovering = false;
      if (!video.hidden) stop(); // no seeking a hidden video on the text side
    });
  }

  /* Fit: measured with offsets, so the flip and the hover lift don't distort the numbers.
     1. If any flip button (front or back) would touch its name, all of them move to their own line under the title.
     2. A bio that runs into the email first loses some spacing, then shrinks in half-pixel steps. */
  function fitCards() {
    list.classList.remove('flip-low');
    const cards = $$('.card');
    const right = (box, el) => box.offsetLeft + el.offsetLeft + el.offsetWidth; // name end, in face coordinates
    const clash = c => {
      const fb = $('.front .flip', c), bb = $('.back .flip', c);
      const textLeft = b => b.offsetLeft + parseFloat(getComputedStyle(b).paddingLeft);
      return right($('.who', c), $('.who [data-k=name]', c)) > textLeft(fb) - 8 ||
             right($('.bio', c), $('.bio [data-k=name]', c)) > textLeft(bb) - 8;
    };
    if (cards.some(clash)) list.classList.add('flip-low');
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
  const fitAll = () => { fitCards(); fitAbout(); carousel.render(); };

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

  const stopAll = () => $$('.card').forEach(c => c.stopVideo());
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) stopAll(); });

  /* ---------- menu: highlight the section in view; stop videos once the hero is covered ---------- */

  const about = $('#meist');
  const contact = $('#kontakt');
  const header = $('header');
  const navLinks = $$('[data-nav]');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const mid = innerHeight * 0.5;
    const cur = contact.getBoundingClientRect().top < mid ? 'kontakt' : about.getBoundingClientRect().top < mid ? 'meist' : null;
    navLinks.forEach(a => (a.dataset.nav === cur ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    // Plain white from the moment the burgundy reaches the header's bottom edge: an inverted header
    // over it would flash blue-green. Over the black section above, plain white looks the same.
    header.classList.toggle('on-accent', contact.getBoundingClientRect().top < header.getBoundingClientRect().bottom);
    const aboutTop = about.getBoundingClientRect().top;
    if (aboutTop < innerHeight * 0.25) stopAll();
    if (aboutTop < innerHeight * 0.35) typer.start(); // starts as the text slides into view
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
  carousel.start(); // phones: centre the first card and play its clip
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
