import { allLegalDocs } from 'markdownlayer/generated';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { FORMATS_DATE_LONG, formatDate } from '@/lib/formatting';

import { Markdownlayer } from '@/components/markdownlayer';
import { slugFromParams, staticParamsFromSlug, type StaticParams } from '@/lib/slug';
import siteConfig from '@/site-config';

const slugPrefix = 'legal';

type LegalDocProps = {
  params: StaticParams;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: LegalDocProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = slugFromParams({ slug: params.slug, prefix: slugPrefix });
  const doc = allLegalDocs.find((doc) => doc.slug === slug);
  if (!doc) {
    notFound();
  }

  return {
    title: doc.data.title,
    openGraph: {
      title: doc.data.title,
      url: `/${doc.slug}`,
      images: [siteConfig.socialImage],
    },
  };
}

export default function LegalDocPage({ params }: LegalDocProps) {
  const slug = slugFromParams({ slug: params.slug, prefix: slugPrefix });
  const doc = allLegalDocs.find((doc) => doc.slug === slug);
  if (!doc) {
    notFound();
  }

  return (
    <>
      <article className="border-t border-gray-200 bg-gray-50">
        <div className="bg-white py-16 sm:py-32">
          <h1 className="font-display mt-5 text-center text-3xl font-bold leading-[1.15] text-black sm:text-5xl sm:leading-[1.15]">
            {doc.data.title}
          </h1>
          {doc.data.updated && (
            <div className="mt-5 w-full text-center">
              <p className="text-gray-500">Last updated on {formatDate(doc.data.updated, FORMATS_DATE_LONG)}</p>
            </div>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-screen-md flex-col items-center p-10 px-2.5 sm:pt-20 lg:px-20">
          <Markdownlayer type={doc.format} code={doc.body.code} />
        </div>
      </article>
    </>
  );
}

export function generateStaticParams(): StaticParams[] {
  return allLegalDocs.map((doc) => staticParamsFromSlug({ slug: doc.slug, prefix: slugPrefix }));
}
