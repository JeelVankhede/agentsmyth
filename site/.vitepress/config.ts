import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

const base = '/agentsmyth/';
const siteUrl = 'https://jeelvankhede.github.io/agentsmyth/';
const ogImage = `${siteUrl}og-image.png`;

export default withMermaid(defineConfig({
  title: 'agentsmyth',
  description: 'A portable AI engineering lifecycle',
  base,
  cleanUrls: true,
  appearance: 'dark',
  mermaid: {
    htmlLabels: false,
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'agentsmyth' }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: ogImage }],
  ],
  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo-dark.svg', alt: 'agentsmyth', width: 24, height: 24 },
    siteTitle: 'agentsmyth',
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
          { text: 'Updating', link: '/updating' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'Uninstall and removal', link: '/uninstall' },
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
    footer: {
      message: '<a href="https://github.com/JeelVankhede/agentsmyth/blob/main/LICENSE">MIT License</a> · <a href="https://github.com/JeelVankhede/agentsmyth/blob/main/CHANGELOG.md">Changelog</a>',
      copyright: 'agentsmyth',
    },
  },
}));
