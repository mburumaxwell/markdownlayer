import siteConfig from '@/site-config';
import { Feed } from 'feed';
import { allBlogPosts } from 'markdownlayer/generated';
import { authors } from './authors';

const siteUrl = siteConfig.siteUrl;

let posts = allBlogPosts.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
if (siteConfig.showDraftPosts) {
  posts = posts.filter((post) => !post.data.draft);
}

// limit to the latest 20 posts
posts = posts.slice(0, 20);

const updated = new Date(
  Math.max(
    ...posts
      .map((post) => [post.data.published.getTime(), post.data.updated?.getTime()])
      .flat()
      .filter(Boolean)
      .map(Number),
  ),
);

const feed = new Feed({
  title: siteConfig.title,
  description: siteConfig.description,
  id: `${siteUrl}/blog`,
  link: `${siteUrl}/blog`,
  image: `${siteUrl}${siteConfig.socialImage}`,
  favicon: `${siteUrl}/favicon.ico`,
  updated: updated,
  language: 'en',
  copyright: `All rights reserved ${new Date().getFullYear()}`,
  feedLinks: {
    rss2: `${siteUrl}/blog/feed.xml`,
    atom: `${siteUrl}/blog/feed.atom`,
    json: `${siteUrl}/blog/feed.json`,
  },
});

posts.forEach((post) => {
  const url = `${siteUrl}/${post.slug}`;
  const mappedAuthors = post.data.authors?.map((author) => authors.find((a) => a.id === author));

  feed.addItem({
    title: post.data.title,
    id: url,
    link: url,
    date: post.data.updated ?? post.data.published,
    description: post.data.description,
    author: mappedAuthors?.filter(Boolean).map((author) => ({
      name: author!.name,
      link: `https://twitter.com/${author!.twitter}`,
    })),
    image: post.data.image && `${siteUrl}${post.data.image}`,
    published: new Date(post.data.published),
  });
});

export default feed;
