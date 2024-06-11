import siteConfig from '@/site-config';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*' }],
    sitemap: [
      // root (marketing)
      `${siteConfig.siteUrl}/sitemap.xml`,

      // other sections
      `${siteConfig.siteUrl}/blog/sitemap.xml`,
      // `${siteConfig.siteUrl}/docs/sitemap.xml`,
    ],
    host: siteConfig.siteUrl,
  };
}
