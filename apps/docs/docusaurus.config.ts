import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'darknyx',
  tagline: 'settle in the dark, prove in the light',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // In production it is hosted under /docs/
  url: 'http://localhost:3000',
  baseUrl: '/docs/',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../../docs/site',
          routeBasePath: '/', // Serve docs directly under /docs/
          sidebarPath: './sidebars.ts',
        },
        blog: false, // Disable blog feature
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        docsRouteBasePath: '/',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'darknyx',
      logo: {
        alt: 'darknyx logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'http://localhost:3000/',
          label: 'Overview',
          position: 'left',
          target: '_self',
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'html',
          value: '<div class="nyx-navbar-badge">Private Beta Soon</div>',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/skysail-labs/darknyx',
            },
            {
              label: 'X',
              href: 'https://x.com/DarknyxProtocol/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} darknyx. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
