import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Auth Template Documentation',
  description:
    'Documentation for the Next.js and NestJS Authentication Template',

  // GitHub Pages Configuration
  base: '/auth-template/', // Replace with your repository name

  // SEO Configuration
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'Auth Template Documentation' }],
    [
      'meta',
      {
        name: 'og:description',
        content:
          'Documentation for the Next.js and NestJS Authentication Template',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ],

  // Theme Configuration
  themeConfig: {
    // Site Logo
    logo: '/logo.svg',
    siteTitle: 'Auth Template',

    // Navigation
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/' },
      { text: 'Auth', link: '/auth/flow' },
      {
        text: 'Resources',
        items: [
          {
            text: 'GitHub',
            link: 'https://github.com/yourusername/your-repo-name',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/yourusername/your-repo-name/blob/main/CONTRIBUTING.md',
          },
          {
            text: 'Report Issues',
            link: 'https://github.com/yourusername/your-repo-name/issues',
          },
        ],
      },
    ],

    // Sidebar
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Features',
          collapsed: false,
          items: [
            { text: 'Authentication', link: '/auth/flow' },
            { text: 'API Reference', link: '/api/' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Authentication', link: '/api/auth' },
            { text: 'Users', link: '/api/users' },
          ],
        },
      ],
      '/auth/': [
        {
          text: 'Authentication',
          collapsed: false,
          items: [
            { text: 'Flow Overview', link: '/auth/flow' },
            { text: 'GitHub OAuth', link: '/auth/github' },
            { text: 'JWT Tokens', link: '/auth/jwt' },
          ],
        },
      ],
    },

    // Social Links
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/yourusername/your-repo-name',
      },
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024',
    },

    // Search
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search docs',
            buttonAriaLabel: 'Search docs',
          },
          modal: {
            noResultsText: 'No results for',
            resetButtonTitle: 'Reset search',
            footer: {
              selectText: 'to select',
              navigateText: 'to navigate',
            },
          },
        },
      },
    },

    // Edit Link
    editLink: {
      pattern:
        'https://github.com/yourusername/your-repo-name/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    // Last Updated
    lastUpdated: true,

    // Carbon Ads
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement',
    },
  },

  // Markdown Configuration
  markdown: {
    lineNumbers: true,
    // Enable mermaid diagrams
    config: (md) => {
      md.use(require('markdown-it-mermaid').default);
    },
  },
});
