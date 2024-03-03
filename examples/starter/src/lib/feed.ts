import siteConfig from '@/site-config';
import { Feed } from 'feed';
import { allBlogPosts } from 'markdowner/generated';
import { authors } from './authors';

const siteUrl = siteConfig.siteUrl;

let posts = allBlogPosts.sort((a, b) => b.published.localeCompare(a.published));
if (siteConfig.showDraftPosts) {
  posts = posts.filter((post) => !post.draft);
}

// limit to the latest 20 posts
posts = posts.slice(0, 20);

const updated = new Date(
  Math.max(
    ...posts
      .map((post) => [new Date(post.published), new Date(post.updated)])
      .flat()
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
  const mappedAuthors = post.authors.map((author) => authors.find((a) => a.id === author));

  feed.addItem({
    title: post.title,
    id: url,
    link: url,
    date: new Date(post.updated),
    description: post.description,
    author: mappedAuthors.filter(Boolean).map((author) => ({
      name: author!.name,
      link: `https://twitter.com/${author!.twitter}`,
    })),
    image: post.image && `${siteUrl}${post.image}`,
    published: new Date(post.published),
  });
});

export default feed;
