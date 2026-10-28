/* Opening sequence.
   1. The handshake clip plays once (2s) and stops on its last frame, where the hands are joined.
   2. On the joined hands, in the middle of the screen, the Legalia mark draws itself in white,
      starting from its two open ends at once and meeting in the middle of the §.
   3. The clip and the mark fade together into the page background; the header and the cards come in.
   Any click, key or scroll skips straight to the end. With reduced motion the CSS hides it. */
(() => {
  'use strict';
  const intro = document.querySelector('.intro');
  if (!intro) return;
  const video = intro.querySelector('video');
  const logo = document.querySelector('header .logo');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !logo) { intro.remove(); return; }

  // Where the hands are joined in the last frame, in clip pixels (1440 x 2730), and how tall the mark is there.
  const CLIP = { w: 1440, h: 2730, x: 667, y: 1480, mark: 440 };
  const NS = 'http://www.w3.org/2000/svg';

  /* The mark is the left part of the header logo (viewBox 0 0 141.6 136). It is one stroke with two
     open ends: top left (end of the left bracket's top arm) and bottom right, and it looks the same
     turned 180deg around its centre. PEN is the centre line from the top-left end: left bracket,
     bottom bar, lower curve of the §, its lower diagonal and left loop. The second pen is the same
     line turned 180deg. The pens are wider than the mark and drawn through the mark's exact shape
     used as a mask, so the edges stay the logo's own. HALF is the pen's own half of the mark: each pen
     only shows its half, so neither shows slivers of the other's loops ahead of time. The halves
     overlap by a hair so no seam shows where they meet. */
  const PEN = 'M37.09 8.81H6.87V128.46H73C86 128.5 96.8 117.6 92 104.3C86.5 97.5 78.5 89.5 70 84.7C61 79.6 50 76 40 67.5C33 61.5 30.5 58 30.8 52.4C31 45 36 40.5 44 39.5C48 39.5 52 42 55 45';
  const HALF = 'M-5 -5H38.4V20L42.44 33.67L51.94 46.93L90.38 89.51L99.88 102.77L103.92 117.24V142.24H-5Z';
  const CENTRE = '70.76 68.62';

  const mark = document.createElementNS(NS, 'svg');
  mark.setAttribute('viewBox', '0 0 141.6 136');
  mark.setAttribute('class', 'intro-mark');
  const shape = logo.querySelector('path').cloneNode(true);
  shape.setAttribute('fill', 'currentColor');
  const pen = `<g clip-path="url(#intro-half)"><path d="${PEN}" pathLength="1"/></g>`;
  mark.innerHTML = '<defs><mask id="intro-shape" maskUnits="userSpaceOnUse" x="0" y="0" width="141.6" height="136"></mask>' +
    `<clipPath id="intro-half"><path d="${HALF}"/></clipPath></defs>` +
    `<g class="pens" mask="url(#intro-shape)" fill="none" stroke="currentColor" stroke-width="18" stroke-linejoin="miter">` +
    `${pen}<g transform="rotate(180 ${CENTRE})">${pen}</g></g>`;
  const maskShape = shape.cloneNode(true);
  maskShape.setAttribute('fill', '#fff');
  mark.querySelector('mask').appendChild(maskShape);
  shape.style.opacity = 0; // the finished mark, shown once both pens are done
  mark.appendChild(shape);
  const pens = [...mark.querySelectorAll('.pens path')];
  pens.forEach(p => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
  intro.appendChild(mark);

  // Lay the clip out so the joined hands sit in the middle of the screen and the clip still covers it.
  function layout() {
    const vw = innerWidth, vh = innerHeight;
    const scale = Math.max(vw / (2 * CLIP.x), vw / (2 * (CLIP.w - CLIP.x)), vh / (2 * CLIP.y), vh / (2 * (CLIP.h - CLIP.y)));
    video.style.width = CLIP.w + 'px';
    video.style.height = CLIP.h + 'px';
    video.style.transform = `translate(${vw / 2 - CLIP.x * scale}px, ${vh / 2 - CLIP.y * scale}px) scale(${scale})`;
    const h = Math.min(CLIP.mark * scale, vh * .55, vw * .6);
    const w = h * 141.6 / 136;
    mark.style.width = w + 'px';
    mark.style.height = h + 'px';
    mark.style.transform = `translate(${vw / 2 - w / 2}px, ${vh / 2 - h / 2}px)`;
  }
  layout();
  addEventListener('resize', layout);

  let stage = 0; // 0 playing, 1 drawing, 2 ending
  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function draw() {
    if (stage) return;
    stage = 1;
    video.pause();
    mark.style.opacity = 1;
    await Promise.all(pens.map(p => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 1700, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' }).finished));
    shape.style.opacity = 1; // swap the two drawn halves for the one solid mark
    mark.querySelector('.pens').remove();
    if (stage > 1) return;
    await wait(450);
    end();
  }

  async function end(instant) {
    if (stage >= 2) return;
    stage = 2;
    removeEventListener('resize', layout);
    if (!instant) await intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out', fill: 'forwards' }).finished;
    intro.classList.add('landed'); // header and cards come in
    intro.style.visibility = 'hidden';
    video.remove();
    await wait(1300);
    intro.remove();
  }

  // Skip: any intent to use the page ends the opening at once.
  const skip = () => { if (stage < 2) end(true); };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(t => addEventListener(t, skip, { once: true, passive: true }));

  video.addEventListener('ended', draw);
  // If the clip cannot play (blocked autoplay, slow network), the mark is drawn in black on the page instead.
  const noClip = () => { video.style.opacity = 0; mark.style.color = '#060606'; draw(); };
  video.play().catch(noClip);
  setTimeout(() => { if (!stage && video.currentTime === 0) noClip(); }, 2500);
})();
