import siteConfig from '@/site-config';
import { allLegalDocs } from 'markdownlayer/generated';
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
    ...allLegalDocs.map(
      (doc): Route => ({
        url: `${siteConfig.siteUrl}/${doc.slug}`,
        lastModified: doc.updated,
        changeFrequency: 'daily',
        priority: 0.5,
      }),
    ),
  );

  return routes;
}
