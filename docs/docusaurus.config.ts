import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const title = "Sync with Todoist Plugin";
const org = "jamiebrynes7";
const project = "obsidian-todoist-plugin";

const config: Config = {
  title: title,
  favicon: "img/favicon.ico",

  url: `https://${org}.github.io`,
  baseUrl: `/${project}/`,
  organizationName: org,
  projectName: project,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

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
          editUrl: `https://github.com/${org}/${project}/tree/main/docs/`,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: "img/social-card.jpg",
    navbar: {
      title: title,
      items: [
        {
          type: "docsVersionDropdown",
          position: "right",
        },
        {
          href: `https://github.com/${org}/${project}`,
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
