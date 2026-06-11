import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      collapsed: false,
      items: ['introduction'],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture-overview',
        'custody-layer',
        'matching-layer',
        'cryptography',
        'trust-model',
      ],
    },
    {
      type: 'category',
      label: 'Pipeline',
      collapsed: false,
      items: [
        'settlement-pipeline',
        'api-and-integration',
      ],
    },
    {
      type: 'category',
      label: 'Status & Roadmap',
      collapsed: false,
      items: [
        'roadmap-and-status',
        'differentiation',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['glossary'],
    },
  ],
};

export default sidebars;
