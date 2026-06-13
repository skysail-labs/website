import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchBarPosition: 'right',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],
  title: "Nyx Docs",
  tagline: "Settle in the dark, prove in the light.",
  favicon: "img/favicon.svg",

  future: {
    v4: true,
  },

  url: "https://darknyx.xyz",
  baseUrl: "/docs/",

  organizationName: "Nyx-Privacy",
  projectName: "nyx",

  onBrokenLinks: "warn",
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
      options: {
        darkMode: true,
        themeVariables: {
          background: '#0a0a0d',
          mainBkg: '#1a1a20',
          nodeBorder: '#c5a059',
          clusterBkg: '#1a1a20',
          titleColor: '#f5f3ee',
          edgeLabelBackground: '#1a1a20',
          primaryColor: '#1a1a20',
          primaryBorderColor: '#c5a059',
          primaryTextColor: '#f5f3ee',
          lineColor: '#c5a059',
          secondaryColor: '#0a0a0d',
          tertiaryColor: '#0a0a0d',
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
        },
      },
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    image: "img/og-default.png",
    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      },
    },
    navbar: {
      title: "darknyx",
      hideOnScroll: false,
      logo: {
        alt: "darknyx",
        src: "img/favicon-light.svg",
        srcDark: "img/favicon-dark.svg",
        href: "pathname:///../",
        target: "_self",
        width: 26,
        height: 26,
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "mainSidebar",
          position: "left",
          label: "Docs",
        },
        {
          label: "MCP Server",
          position: "right",
          to: "/mcp-server",
          className: "navbar-btn navbar-btn--mcp",
        },
        {
          label: "Feedback",
          position: "right",
          href: "#",
          className: "navbar-btn navbar-btn--feedback",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Get Started",
          items: [
            { label: "Overview", to: "/get-started/overview" },
            { label: "Programmatic Access", to: "/get-started/programmatic-access" },
            { label: "Trade Flow", to: "/how-it-works/trade-flow" },
          ],
        },
        {
          title: "Build",
          items: [
            { label: "Place Order", to: "/orders/place-order" },
            { label: "API", to: "/api/base-urls" },
            { label: "TypeScript SDK", to: "/sdk/typescript-client" },
            { label: "Glossary", to: "/reference/glossary" },
          ],
        },
        {
          title: "Connect",
          items: [
            { label: "𝕏 / Twitter", href: "https://x.com/darknyx" },
            { label: "Discord", href: "https://discord.gg/darknyx" },
            { label: "hello@darknyx.xyz", href: "mailto:hello@darknyx.xyz" },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Nyx. Settle in the dark, prove in the light.`,
    },
    prism: {
      theme: prismThemes.oneDark,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ["json", "bash", "yaml", "rust", "typescript"],
    },
    algolia: undefined,
  } satisfies Preset.ThemeConfig,
};

export default config;
