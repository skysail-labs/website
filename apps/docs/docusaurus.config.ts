import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";

const config: Config = {
  title: "Darknyx Docs",
  tagline: "Settle in the dark, prove in the light.",
  favicon: "img/favicon.svg",


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

  plugins: [
    "docusaurus-plugin-sass",
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api",
        docsPluginId: "classic",
        config: {
          nyxApi: {
            specPath: "../../docs/tee-api-openapi.yaml",
            outputDir: "docs/api-reference",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            showSchemas: true,
          } satisfies OpenApiPlugin.Options,
        },
      },
    ],
  ],

  themes: [
    "docusaurus-theme-openapi-docs",
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: "/",
      },
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
        autoCollapseCategories: true,
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
          to: "/api-reference",
          position: "left",
          label: "API Reference",
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
            { label: "API Reference", to: "/api-reference" },
            { label: "TypeScript SDK", to: "/sdk/typescript-client" },
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
      copyright: `© ${new Date().getFullYear()} Darknyx. Settle in the dark, prove in the light.`,
    },
    prism: {
      theme: prismThemes.oneDark,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ["json", "bash", "yaml", "rust", "typescript"],
    },
    api: {
      authPersistance: "localStorage",
      serverVariablesPersistance: "localStorage",
    },
    algolia: undefined,
  } satisfies Preset.ThemeConfig,
};

export default config;
