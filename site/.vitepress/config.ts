import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'agentsmyth',
  description: 'A portable AI engineering lifecycle',
  cleanUrls: true,
  appearance: 'dark',
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/introduction' },
      { text: 'In action', link: '/in-action' },
    ],
    sidebar: [
      {
        text: 'Start here',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Introduction', link: '/introduction' },
          { text: 'Vibe, engineering, loop', link: '/vibe-loop' },
        ],
      },
      {
        text: 'Use it',
        items: [
          { text: 'Install', link: '/install' },
          { text: 'Run it', link: '/run-it' },
          { text: 'Setup: the resolution pass', link: '/setup' },
        ],
      },
      {
        text: 'How it works',
        items: [
          { text: 'The lifecycle', link: '/lifecycle' },
          { text: 'Under the hood', link: '/under-hood' },
          { text: 'Artifacts', link: '/artifacts' },
          { text: 'Power skills', link: '/power-skills' },
          { text: 'Validators', link: '/validators' },
        ],
      },
      {
        text: 'See it whole',
        items: [{ text: 'agentsmyth in action', link: '/in-action' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/JeelVankhede/agentsmyth' }],
    search: {
      provider: 'local',
    },
  },
});
