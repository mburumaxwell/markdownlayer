import { allBlogPosts } from 'markdownlayer/generated';
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { authors } from '@/lib/authors';
import { FORMATS_DATE_LONG, formatDate } from '@/lib/formatting';

import { Markdownlayer } from '@/components/markdownlayer';
import { slugFromParams, staticParamsFromSlug, type StaticParams } from '@/lib/slug';

const slugPrefix = 'blog/posts';

type BlogPostProps = {
  params: StaticParams;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: BlogPostProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = slugFromParams({ slug: params.slug, prefix: slugPrefix });
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
      images: post.image && [post.image],
      url: `/${post.slug}`,
      publishedTime: post.published,
      modifiedTime: post.updated,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostProps) {
  const slug = slugFromParams({ slug: params.slug, prefix: slugPrefix });
  const post = allBlogPosts.find((post) => post.slug === slug);
  if (!post) {
    notFound();
  }

  const mappedAuthors = post.authors.map((author) => authors.find((a) => a.id === author));

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
          {mappedAuthors?.length ? (
            <div className="mt-4 flex space-x-4">
              {mappedAuthors.map((author) =>
                author ? (
                  <Link
                    key={author.id}
                    href={`https://twitter.com/${author.twitter}`}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      width={42}
                      height={42}
                      className="rounded-full bg-white"
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
              src={post.image}
              alt={post.title}
              width={720}
              height={405}
              className="bg-muted my-8 rounded-md border transition-colors"
              priority
            />
          </div>
        )}
        <Markdownlayer type={post.format} code={post.body.code} />
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

export function generateStaticParams(): StaticParams[] {
  return allBlogPosts.map((doc) => staticParamsFromSlug({ slug: doc.slug, prefix: slugPrefix }));
}
