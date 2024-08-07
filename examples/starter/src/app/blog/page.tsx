import { FORMATS_DATE_LONG, formatDate } from '@/lib/formatting';
import siteConfig from '@/site-config';
import { allBlogPosts } from 'markdownlayer/generated';
import { type Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.title,
  },
  description: siteConfig.description,
  openGraph: {
    title: {
      absolute: siteConfig.title,
    },
    description: siteConfig.description,
    images: [siteConfig.socialImage],
    url: '/blog',
  },
  alternates: {
    types: {
      'application/atom+xml': `/blog/feed.xml`,
      'application/rss+xml': `/blog/feed.atom`,
      'application/json': `/blog/feed.json`,
    },
  },
};

export default function BlogHomePage() {
  let posts = allBlogPosts.sort((a, b) => b.published.localeCompare(a.published));
  if (siteConfig.showDraftPosts) {
    posts = posts.filter((post) => !post.draft);
  }

  return (
    <>
      <div className="container max-w-7xl py-6 lg:py-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="font-heading inline-block text-4xl tracking-tight lg:text-5xl">The Blog</h1>
            <p className="text-muted-foreground text-xl">some nice title</p>
          </div>
        </div>
        <hr className="my-8" />
        {posts.length ? (
          <div className="grid gap-10 sm:grid-cols-3">
            {posts.map((post, index) => (
              <article key={post.id} className="group relative flex flex-col space-y-2">
                {post.image && (
                  <Image
                    src={post.image.src}
                    alt={post.title}
                    width={804}
                    height={452}
                    className="bg-muted rounded-md border transition-colors"
                    priority={index <= 1}
                  />
                )}
                <h2 className="text-2xl font-extrabold">{post.title}</h2>
                {post.description && <p className="text-muted-foreground">{post.description}</p>}
                {post.published && (
                  <p className="text-muted-foreground text-sm">{formatDate(post.published, FORMATS_DATE_LONG)}</p>
                )}
                <Link href={`blog/posts/${post.slug}`} className="absolute inset-0">
                  <span className="sr-only">View Article</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p>No posts published.</p>
        )}
      </div>
    </>
  );
}
