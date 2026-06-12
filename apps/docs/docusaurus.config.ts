import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
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
      title: "",
      hideOnScroll: false,
      logo: {
        alt: "darknyx",
        src: "img/lockup-light.svg",
        srcDark: "img/lockup-dark.svg",
        href: "/",
        width: 120,
        height: 38,
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "mainSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://darknyx.xyz",
          label: "App",
          position: "right",
        },
        {
          href: "https://github.com/Nyx-Privacy/nyx",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Protocol",
          items: [
            { label: "Introduction", to: "/introduction" },
            { label: "Architecture", to: "/architecture-overview" },
            { label: "Trust model", to: "/trust-model" },
          ],
        },
        {
          title: "Build",
          items: [
            { label: "Integration", to: "/integration" },
            { label: "API reference", to: "/api-reference" },
            { label: "Glossary", to: "/glossary" },
          ],
        },
        {
          title: "Links",
          items: [
            {
              label: "App",
              href: "https://darknyx.xyz",
            },
            {
              label: "GitHub",
              href: "https://github.com/Nyx-Privacy/nyx",
            },
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
