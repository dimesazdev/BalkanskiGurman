/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  guide: [
    'intro',
    {
      type: 'category',
      label: 'Account & Profile',
      items: [
        'account/account-login',
        'account/profile',
      ],
    },
    {
      type: 'category',
      label: 'Finding & Browsing',
      items: [
        'finding-browsing/exploring-restaurants',
        'finding-browsing/finding-perfect-restaurant',
        'finding-browsing/restaurant-cards',
        'finding-browsing/restaurant-details',
      ],
    },
    {
      type: 'category',
      label: 'Community',
      items: [
        'community/reviews',
        'community/reporting-issue',
        'community/favorites',
      ],
    },
  ],
};

module.exports = sidebars;