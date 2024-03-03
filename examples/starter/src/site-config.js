const siteConfig = {
  siteUrl: 'https://markdownlayer.dev',
  title: '',
  description: '',
  socialImage: '/social-preview.webp',
  keywords: ['markdown', 'mdx', 'markdoc', 'markdownlayer'],

  showDraftPosts: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SHOW_DRAFTS !== 'true',
};

export default siteConfig;
