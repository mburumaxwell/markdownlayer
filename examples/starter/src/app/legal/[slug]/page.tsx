import { allLegals } from 'markdownlayer/generated';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { FORMATS_DATE_LONG, formatDate } from '@/lib/formatting';

import { Markdownlayer } from '@/components/markdownlayer';
import siteConfig from '@/site-config';

type LegalProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params: { slug }, searchParams }: LegalProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const doc = allLegals.find((doc) => doc.slug === slug);
  if (!doc) {
    notFound();
  }

  return {
    title: doc.title,
    openGraph: {
      title: doc.title,
      url: `/legal/${doc.slug}`,
      images: [siteConfig.socialImage],
    },
  };
}

export default function LegalPage({ params: { slug } }: LegalProps) {
  const doc = allLegals.find((doc) => doc.slug === slug);
  if (!doc) {
    notFound();
  }

  return (
    <>
      <article className="border-t border-gray-200 bg-gray-50">
        <div className="bg-white py-16 sm:py-32">
          <h1 className="font-display mt-5 text-center text-3xl font-bold leading-[1.15] text-black sm:text-5xl sm:leading-[1.15]">
            {doc.title}
          </h1>
          {doc.updated && (
            <div className="mt-5 w-full text-center">
              <p className="text-gray-500">Last updated on {formatDate(doc.updated, FORMATS_DATE_LONG)}</p>
            </div>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-screen-md flex-col items-center p-10 px-2.5 sm:pt-20 lg:px-20">
          <Markdownlayer body={doc.body} />
        </div>
      </article>
    </>
  );
}

export function generateStaticParams() {
  return allLegals.map((doc) => ({ slug: doc.slug }));
}
