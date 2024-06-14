import siteConfig from '@/site-config';
import { allLegals } from 'markdownlayer/generated';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  type Route = MetadataRoute.Sitemap[number];

  const routes = [
    '', // root without trailing slash
    '/changelog',
  ].map(
    (route): Route => ({
      url: `${siteConfig.siteUrl}${route}`,
      // lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.5,
    }),
  );

  // pages for legal
  routes.push(
    ...allLegals.map(
      (doc): Route => ({
        url: `${siteConfig.siteUrl}/legal/${doc.slug}`,
        lastModified: doc.data.updated,
        changeFrequency: 'daily',
        priority: 0.5,
      }),
    ),
  );

  return routes;
}
