import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: "doc",
      id: "introduction",
      label: "Introduction",
    },
    {
      type: "category",
      label: "Protocol",
      collapsed: false,
      items: [
        "architecture-overview",
        "custody-layer",
        "matching-layer",
        "cryptography",
        "trust-model",
        "settlement-pipeline",
      ],
    },
    {
      type: "category",
      label: "Build",
      collapsed: false,
      items: ["integration", "api-reference"],
    },
    {
      type: "category",
      label: "Reference",
      collapsed: false,
      items: ["differentiation", "roadmap", "glossary"],
    },
  ],
};

export default sidebars;
