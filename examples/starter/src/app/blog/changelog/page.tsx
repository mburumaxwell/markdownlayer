import { allChangelogs } from 'markdowner/generated';
import { Metadata } from 'next';

// import { Markdowner } from "@/components/content/markdowner";

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

  // TODO: implement changelog page design here
  return <></>;
}
