import { allChangelogs } from 'markdownlayer/generated';
import { type Metadata } from 'next';

// import { Markdownlayer } from "@/components/content/markdownlayer";

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
  const entries = allChangelogs.sort((a, b) => b.published.localeCompare(a.published));

  return <></>;
}
