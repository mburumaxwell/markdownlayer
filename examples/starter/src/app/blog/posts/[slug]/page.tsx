import { allAuthors, allBlogPosts } from 'markdownlayer/generated';
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FORMATS_DATE_LONG, formatDate } from '@/lib/formatting';

import { Markdownlayer } from '@/components/markdownlayer';

type BlogPostProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params: { slug }, searchParams }: BlogPostProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const post = allBlogPosts.find((post) => post.slug === slug);
  if (!post) {
    notFound();
  }

  return {
    title: {
      absolute: post.title,
    },
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      type: 'article',
      title: {
        absolute: post.title,
      },
      description: post.description,
      images: post.image && [post.image.src],
      url: `/blog/posts/${post.slug}`,
      publishedTime: post.published,
      modifiedTime: post.updated,
    },
  };
}

export default function BlogPostPage({ params: { slug } }: BlogPostProps) {
  const post = allBlogPosts.find((post) => post.slug === slug);
  if (!post) {
    notFound();
  }

  const mappedAuthors = post.authors
    .map((author) => allAuthors.find((a) => [a.id, a.name].includes(author)))
    .filter(Boolean);

  return (
    <>
      <article className="container relative max-w-3xl py-6 lg:py-10">
        <div>
          {post.published && (
            <time dateTime={post.published} className="text-muted-foreground block text-sm">
              Published on {formatDate(post.published, FORMATS_DATE_LONG)}
            </time>
          )}
          <h1 className="font-heading mt-2 inline-block text-4xl leading-tight lg:text-5xl">{post.title}</h1>
          {mappedAuthors.length ? (
            <div className="mt-4 flex space-x-4">
              {mappedAuthors.map((author) =>
                author ? (
                  <Link key={author.id} href={author.url} className="flex items-center space-x-2 text-sm">
                    <Image
                      src={author.avatar.src}
                      alt={author.avatar.alt ?? author.name}
                      width={42}
                      height={42}
                      className="rounded-full bg-white"
                      unoptimized={
                        author.avatar.src.endsWith('.svg') || author.avatar.src.startsWith('https://api.dicebear.com/')
                      }
                    />
                    <div className="flex-1 text-left leading-tight">
                      <p className="font-medium">{author.name}</p>
                      <p className="text-muted-foreground text-[12px]">@{author.twitter}</p>
                    </div>
                  </Link>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
        {post.image && (
          <div className="flex w-full justify-center">
            <Image
              src={post.image.src}
              alt={post.title}
              width={720}
              height={405}
              className="bg-muted my-8 rounded-md border transition-colors"
              priority
            />
          </div>
        )}
        <Markdownlayer body={post.body} />
        <hr className="mt-12" />
        <div className="flex justify-center py-6 lg:py-10">
          {/* <Link href="/blog" className={cn(buttonVariants({ variant: 'ghost' }))}>
            <ChevronLeftIcon className="mr-2 size-4" />
            See all posts
          </Link> */}
        </div>
      </article>
    </>
  );
}

export function generateStaticParams() {
  return allBlogPosts.map((post) => ({ slug: post.slug }));
}
