<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { useRoute } from 'vitepress';
import { nextTick, watch } from 'vue';
import ForgeBackground from './ForgeBackground.vue';

const { Layout } = DefaultTheme;
const route = useRoute();

// Content reveal: each top-level block in the doc body starts faded/offset
// and animates in as it enters the viewport (IntersectionObserver), once,
// then stops observing it. Re-runs after every client-side navigation since
// VitePress swaps .vp-doc's contents without a full page reload — a plain
// CSS animation keyed only to page load would never fire again after the
// first visit.
function reveal() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // .vp-doc > div is the actual markdown-rendered wrapper VitePress emits
  // (verified against real build output, not assumed) — targeting direct
  // children of it, rather than a broad `.vp-doc *` selector, avoids
  // double-animating nested elements (e.g. a <p> inside a callout would
  // otherwise match twice: once for the callout, once for itself).
  const targets = document.querySelectorAll(
    '.vp-doc > div > h1, .vp-doc > div > h2, .vp-doc > div > h3, ' +
      '.vp-doc > div > p, .vp-doc > div > ul, .vp-doc > div > ol, ' +
      '.vp-doc > div > blockquote, .vp-doc > div > table, ' +
      '.vp-doc > div > .custom-block, .vp-doc > div > div[class*="language-"]'
  );
  if (!targets.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
  );

  targets.forEach((el) => {
    el.classList.add('reveal');
    io.observe(el);
  });
}

watch(
  () => route.path,
  () => nextTick(reveal),
  { immediate: true }
);
</script>

<template>
  <Layout>
    <template #layout-top>
      <ForgeBackground />
    </template>
  </Layout>
</template>
