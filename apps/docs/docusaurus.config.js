import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Balkanski Gurman — User Guide',
  tagline: 'How to use the site',
  url: 'https://balkanski-gurman-web.vercel.app',
  baseUrl: '/',
  favicon: 'img/logo.svg',

  organizationName: 'balkanski-gurman',
  projectName: 'docs',

  presets: [
    [
      'classic',
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: true,
        },
        blog: false,
        // pages: false,
        theme: { customCss: require.resolve('./src/css/custom.css') },
      }),
    ],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'mk', 'sr', 'sl'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en' },
      mk: { label: 'Македонски', htmlLang: 'mk' },
      sr: { label: 'Srpski', htmlLang: 'sr' },
      sl: { label: 'Slovenščina', htmlLang: 'sl' },
    },
  },

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      style: 'dark',
      logo: {
        alt: 'BG',
        src: 'img/logo.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guide',
          position: 'left',
          label: 'Guide',
        },
        {
          type: 'localeDropdown',
          position: 'right',
          className: 'navbar-language-dropdown', // for custom CSS
        },
      ],
    },
    footer: {
      logo: { alt: 'BG', src: 'img/light-logo.svg', style: { width: 150, marginBottom: 10 } },
      copyright: `© ${new Date().getFullYear()} Balkanski Gurman. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },

  plugins: [],
};

export default config;