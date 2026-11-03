/* Opening sequence.
   Handshake clips (assets/video/hands.mp4, five cuts of 0.8s) play inside the Legalia mark, like a
   clipping mask. The mark starts so large that one of its strokes fills the screen, then zooms out
   into the logo in the middle of the first screen. The name fades in beside it, the clips fade into
   the solid mark, and the menu comes in. Any click, key or scroll skips to the end.
   With reduced motion the CSS hides it. */
(() => {
  'use strict';
  const intro = document.querySelector('.intro');
  if (!intro) return;
  const hands = intro.querySelector('.hands');
  const video = intro.querySelector('video');
  const target = document.querySelector('.lockup svg');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !target) { intro.remove(); return; }

  /* The mark is the first path of the logo, in logo units (viewBox 0 0 730 136). Its commands are
     all absolute (M C L H V Z), so moving and scaling it is a matter of mapping its numbers. */
  const d = target.querySelector('path').getAttribute('d');
  const parts = d.match(/[MCLHVZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  function placed(s, tx, ty) {
    let out = '', cmd = '', n = 0;
    for (const t of parts) {
      if (/[A-Z]/i.test(t)) { cmd = t.toUpperCase(); n = 0; out += cmd; continue; }
      const v = +t;
      const isY = cmd === 'V' || (cmd !== 'H' && n % 2 === 1);
      out += (isY ? v * s + ty : v * s + tx).toFixed(1) + ' ';
      n++;
    }
    return `path(evenodd, "${out}")`;
  }

  // Zoom anchor: the middle of the left bracket's upright (13.7 units wide), so at the start the
  // screen is entirely inside the stroke and the clip fills it.
  const FOCUS = { x: 6.85, y: 68.6 }, STROKE = 13.7;
  const HOLD = 450, ZOOM = 3000, NAME_AT = 2900, END_AT = 3700;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  let t0 = 0, raf = 0, finished = false;
  function frame(now) {
    if (finished) return;
    if (!t0) t0 = now;
    const t = now - t0;
    const r = target.getBoundingClientRect();
    const s1 = r.width / 730;                                        // logo units -> px at the end
    const fx1 = r.left + FOCUS.x * s1, fy1 = r.top + FOCUS.y * s1;   // where the anchor ends up
    const s0 = (Math.hypot(innerWidth, innerHeight) * 1.15) / STROKE;
    const p = ease(Math.min(1, Math.max(0, (t - HOLD) / ZOOM)));
    const s = Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * p); // even zoom speed
    const fx = innerWidth / 2 + (fx1 - innerWidth / 2) * p;
    const fy = innerHeight / 2 + (fy1 - innerHeight / 2) * p;
    hands.style.clipPath = placed(s, fx - FOCUS.x * s, fy - FOCUS.y * s);
    if (t >= NAME_AT) intro.classList.add('named');
    if (t >= END_AT) return finish();
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    intro.classList.add('named', 'landed');
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e => removeEventListener(e, finish));
    setTimeout(() => intro.remove(), 700);
  }

  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e => addEventListener(e, finish, { passive: true }));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  // Start when the clip actually plays; if it can't (blocked autoplay, slow network), skip to the logo.
  const go = () => { if (!t0 && !finished) raf = requestAnimationFrame(frame); };
  hands.style.clipPath = 'inset(50%)';
  video.addEventListener('playing', go, { once: true });
  const tried = video.play();
  if (tried && tried.catch) tried.catch(finish);
  setTimeout(() => { if (!t0) finish(); }, 2500);
})();
