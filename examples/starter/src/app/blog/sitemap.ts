import siteConfig from '@/site-config';
import { allBlogPosts } from 'markdownlayer/generated';
import { type MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  type Route = MetadataRoute.Sitemap[number];

  const routes: Route[] = [];

  // blog posts
  routes.push({ url: `${siteConfig.siteUrl}/blog`, priority: 0.5 });
  routes.push(
    ...allBlogPosts
      .filter((post) => !post.draft)
      .map(
        (post): Route => ({
          url: `${siteConfig.siteUrl}/blog/posts/${post.slug}`,
          lastModified: post.updated,
          changeFrequency: 'daily',
          priority: 0.5,
        }),
      ),
  );

  // changelog
  routes.push({ url: `${siteConfig.siteUrl}/blog/changelog`, priority: 0.5 });

  return routes;
}
