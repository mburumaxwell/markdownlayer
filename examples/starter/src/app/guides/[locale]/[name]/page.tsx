import { allGuides } from 'markdownlayer/generated';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { FORMATS_DATE_LONG, formatDate } from '@/lib/formatting';

import { Markdownlayer } from '@/components/markdownlayer';
import siteConfig from '@/site-config';

type GuideProps = {
  params: { locale: string; name: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params: { locale, name }, searchParams }: GuideProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const guide = allGuides.find((guide) => guide.slug === `${locale}/${name}`);
  if (!guide) {
    notFound();
  }

  return {
    title: guide.title,
    openGraph: {
      title: guide.title,
      url: `/guides/${guide.slug}`,
      images: [siteConfig.socialImage],
    },
  };
}

export default function GuidePage({ params: { locale, name } }: GuideProps) {
  const guide = allGuides.find((guide) => guide.slug === `${locale}/${name}`);
  if (!guide) {
    notFound();
  }

  return (
    <>
      <article className="border-t border-gray-200 bg-gray-50">
        <div className="bg-white py-16 sm:py-32">
          <h1 className="font-display mt-5 text-center text-3xl font-bold leading-[1.15] text-black sm:text-5xl sm:leading-[1.15]">
            {guide.title}
          </h1>
          {guide.updated && (
            <div className="mt-5 w-full text-center">
              <p className="text-gray-500">Last updated on {formatDate(guide.updated, FORMATS_DATE_LONG)}</p>
            </div>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-screen-md flex-col items-center p-10 px-2.5 sm:pt-20 lg:px-20">
          <Markdownlayer body={guide.body} />
        </div>
      </article>
    </>
  );
}

export function generateStaticParams() {
  return allGuides.map((guide) => ({
    locale: guide.slug.split('/')[0],
    name: guide.slug.split('/')[1],
  }));
}
