import { allChangelogs } from 'markdownlayer/generated';
import { type Metadata } from 'next';

import { Markdownlayer } from '@/components/markdownlayer';
import { formatDate } from '@/lib/formatting';

import siteConfig from '@/site-config';

const title = 'Company X: Changelog';
const description = '';
export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description: description,
  openGraph: {
    title: {
      absolute: title,
    },
    description: description,
    images: [siteConfig.socialImage],
    url: '/blog/changelog',
  },
};

export default async function Changelog() {
  const entries = allChangelogs.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

  return (
    <>
      {entries.map((entry) => (
        <div key={entry._id}>
          <h2>{entry.data.title}</h2>
          <p>{formatDate(entry.data.published)}</p>
          <Markdownlayer doc={entry} />
        </div>
      ))}
    </>
  );
}
