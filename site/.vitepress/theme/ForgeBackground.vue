<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let rafId = 0;
let running = false;
let resizeObserver: (() => void) | null = null;

onMounted(() => {
  if (typeof window === 'undefined') return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Respect the user's stated preference outright — do not run the
  // simulation at all rather than run a token, still-technically-present
  // version of it.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let W = 0;
  let H = 0;
  let DPR = 1;

  function resize() {
    // Capped at 1.5, not 2 — this is a decorative, heavily-blurred backdrop;
    // full retina sharpness buys nothing visible here and directly multiplies
    // every fill's pixel cost (2.0 -> 1.5 is ~44% fewer pixels per draw).
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas!.width = Math.round(W * DPR);
    canvas!.height = Math.round(H * DPR);
    canvas!.style.width = `${W}px`;
    canvas!.style.height = `${H}px`;
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    rebuildHotspots();
  }

  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  function randNormal(mean: number, sd: number) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function noise(x: number, t: number) {
    return (
      Math.sin(x * 1.7 + t * 0.9) * 0.5 +
      Math.sin(x * 3.1 - t * 1.6 + 1.3) * 0.3 +
      Math.sin(x * 0.6 + t * 0.45 + 4.1) * 0.2
    );
  }

  const STOPS: [number, [number, number, number]][] = [
    [0.0, [255, 248, 236]],
    [0.12, [255, 195, 112]],
    [0.35, [244, 166, 63]],
    [0.62, [232, 100, 28]],
    [0.85, [122, 44, 10]],
    [1.0, [40, 16, 6]],
  ];

  // ------------------------------------------------------------------
  // The actual performance fix: pre-rendered sprites instead of per-frame
  // work. The previous version called shadowBlur (a real blur convolution,
  // one of the most expensive canvas 2D operations that exists) and/or
  // createRadialGradient on every single particle, every single frame —
  // with a couple hundred particles at 60fps that's tens of thousands of
  // expensive operations per second, which is exactly what "lagging" means.
  // Instead: render one soft circle per fire-color stop ONCE, to small
  // offscreen canvases, at mount time. Every frame, drawing a particle is
  // just `drawImage` of an already-rasterized bitmap — one of the cheapest
  // things a canvas can do. Color still transitions across a particle's
  // lifetime (picking the nearest of 6 pre-baked stops instead of computing
  // a continuous gradient), which is visually indistinguishable in motion
  // but avoids recomputing anything per particle per frame.
  // ------------------------------------------------------------------
  const SPRITE_SIZE = 96;
  function makeSprite(rgb: [number, number, number]): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = SPRITE_SIZE;
    c.height = SPRITE_SIZE;
    const sctx = c.getContext('2d')!;
    const r = SPRITE_SIZE / 2;
    const grad = sctx.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`);
    grad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.55)`);
    grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(r, r, r, 0, Math.PI * 2);
    sctx.fill();
    return c;
  }
  const sprites = STOPS.map(([, rgb]) => makeSprite(rgb));
  function spriteFor(frac: number) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < STOPS.length; i++) {
      const d = Math.abs(STOPS[i][0] - frac);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return sprites[best];
  }

  type Particle = {
    kind: 'body' | 'spark' | 'ambient';
    x: number; y: number; vx: number; vy: number;
    born: number; life: number; size: number; seed: number;
  };

  let hotspots: { x: number; intensity: number; phase: number }[] = [];
  function rebuildHotspots() {
    const count = Math.max(5, Math.min(28, Math.floor(W / 140)));
    hotspots = Array.from({ length: count }, () => ({
      x: Math.random(),
      intensity: rand(0.5, 1.6),
      phase: rand(0, Math.PI * 2),
    }));
  }

  let particles: Particle[] = [];
  let ambientFilled = false;

  // Adaptive quality: measured frame time drives a self-correcting budget
  // multiplier, rather than a single static guess tuned for one imagined
  // device. If frames start taking too long, the particle budget eases
  // down until they recover; if there's headroom, it eases back up. This
  // is what "make sure it's optimized" actually requires — a guarantee
  // that holds on a slow device, not a number that only worked on mine.
  let qualityScale = 1;
  let frameMsAvg = 16.7;

  const area = () => W * H;
  const maxParticles = () => Math.max(60, Math.min(260, Math.floor((area() / 3800) * qualityScale)));
  const ambientTarget = () => Math.max(14, Math.min(70, Math.floor((area() / 11000) * qualityScale)));

  function spawnAmbient(staggerStart: boolean) {
    const life = rand(3000, 8000);
    const born = performance.now() - (staggerStart ? rand(0, life) : 0);
    particles.push({
      kind: 'ambient',
      x: rand(0, W), y: rand(0, H),
      vx: randNormal(0, 4), vy: -rand(3, 12),
      born, life,
      size: Math.random() < 0.1 ? rand(2, 3.2) : rand(0.6, 1.6),
      seed: rand(0, 1000),
    });
  }

  function spawnFrom(hotspot: { x: number; intensity: number }, kind: 'body' | 'spark') {
    const baseX = hotspot.x * W + randNormal(0, 26 * hotspot.intensity);
    const y = H + rand(4, 14);
    const heat = hotspot.intensity;
    if (kind === 'body') {
      particles.push({
        kind, x: baseX, y,
        vx: randNormal(0, 5), vy: -rand(28, 55) * heat,
        born: performance.now(), life: rand(900, 1900) * (0.7 + heat * 0.5),
        size: rand(10, 26) * (0.6 + heat * 0.5),
        seed: rand(0, 1000),
      });
    } else {
      particles.push({
        kind, x: baseX, y,
        vx: randNormal(0, 10), vy: -rand(55, 110) * heat,
        born: performance.now(), life: rand(1800, 4200),
        size: Math.random() < 0.12 ? rand(2.4, 3.6) : rand(0.8, 1.8),
        seed: rand(0, 1000),
      });
    }
  }

  let last = performance.now();
  const bodyBucket: Particle[] = [];
  const glowBucket: Particle[] = [];

  function tick(now: number) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    const frameMs = now - last;
    last = now;
    const t = now / 1000;

    frameMsAvg = frameMsAvg * 0.9 + frameMs * 0.1;
    if (frameMsAvg > 22 && qualityScale > 0.3) qualityScale = Math.max(0.3, qualityScale - 0.012);
    else if (frameMsAvg < 15 && qualityScale < 1) qualityScale = Math.min(1, qualityScale + 0.004);

    const MAX = maxParticles();
    const AMBIENT_TARGET = ambientTarget();

    hotspots.forEach((h) => {
      const flicker = 0.6 + 0.4 * Math.sin(t * 1.3 + h.phase) + 0.25 * noise(h.x * 10, t * 2 + h.phase);
      if (particles.length < MAX && Math.random() < 0.16 * h.intensity * Math.max(flicker, 0.1)) {
        spawnFrom(h, 'spark');
      }
      if (particles.length < MAX && Math.random() < 0.32 * h.intensity * Math.max(flicker, 0.15)) {
        spawnFrom(h, 'body');
      }
    });

    let ambientCount = 0;
    for (let i = 0; i < particles.length; i++) if (particles[i].kind === 'ambient') ambientCount++;
    let toSpawn = Math.min(AMBIENT_TARGET - ambientCount, ambientFilled ? 4 : AMBIENT_TARGET);
    while (toSpawn-- > 0 && particles.length < MAX) spawnAmbient(!ambientFilled);
    ambientFilled = true;

    ctx!.clearRect(0, 0, W, H);

    // Physics + survival pass — no drawing yet, just bucket survivors by
    // render mode so composite operation is set once per bucket instead of
    // toggled on every single particle (state changes aren't free either).
    bodyBucket.length = 0;
    glowBucket.length = 0;
    particles = particles.filter((p) => {
      const age = now - p.born;
      const frac = age / p.life;
      if (frac >= 1) return false;

      const turb = noise(p.x * 0.01 + p.seed, t * 1.4 + p.seed);
      p.vx += turb * (p.kind === 'body' ? 12 : 22) * dt;
      p.vx *= 1 - 1.6 * dt;
      p.vy *= 1 - 0.35 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y <= -60 || p.x <= -60 || p.x >= W + 60) return false;
      (p.kind === 'body' ? bodyBucket : glowBucket).push(p);
      return true;
    });

    ctx!.globalCompositeOperation = 'source-over';
    for (const p of bodyBucket) {
      const age = now - p.born;
      const frac = age / p.life;
      const alpha = Math.sin(Math.min(frac, 1) * Math.PI) * (0.14 + 0.05 * Math.sin(t * 6 + p.seed));
      const size = p.size * (1 - frac * 0.5) * 2;
      ctx!.globalAlpha = Math.max(alpha, 0);
      ctx!.drawImage(spriteFor(frac), p.x - size / 2, p.y - size / 2, size, size);
    }

    ctx!.globalCompositeOperation = 'lighter';
    for (const p of glowBucket) {
      const age = now - p.born;
      const frac = age / p.life;
      const alpha = Math.sin(Math.min(frac, 1) * Math.PI) * 0.95;
      const size = p.size * (1 - frac * 0.5) * 3.4;
      ctx!.globalAlpha = Math.max(alpha, 0);
      ctx!.drawImage(spriteFor(frac), p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  // Pause entirely when the tab isn't visible — no reason to burn CPU/GPU
  // animating a background nobody is looking at.
  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }
  document.addEventListener('visibilitychange', onVisibility);

  window.addEventListener('resize', resize);
  resizeObserver = () => window.removeEventListener('resize', resize);

  resize();
  start();

  onUnmounted(() => {
    stop();
    document.removeEventListener('visibilitychange', onVisibility);
    resizeObserver?.();
  });
});
</script>

<template>
  <canvas ref="canvasRef" class="forge-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.forge-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .forge-canvas {
    display: none;
  }
}
</style>
