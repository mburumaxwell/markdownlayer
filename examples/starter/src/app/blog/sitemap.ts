import siteConfig from '@/site-config';
import { allBlogPosts } from 'markdownlayer/generated';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  type Route = MetadataRoute.Sitemap[number];

  let routes: Route[] = [{ url: `${siteConfig.siteUrl}/blog`, lastModified: '', priority: 0.5 }];
  routes.push(
    ...allBlogPosts
      .filter((post) => !post.draft)
      .map(
        (post): Route => ({
          url: `${siteConfig.siteUrl}/${post.slug}`,
          lastModified: post.updated,
          changeFrequency: 'daily',
          priority: 0.5,
        }),
      ),
  );

  return routes;
}
