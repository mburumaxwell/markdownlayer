import siteConfig from '@/site-config';
import { Metadata } from 'next';

const title = '';
const description = '';
export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    images: [siteConfig.socialImage],
    url: '/',
  },
};

export default function HomePage() {
  return <>dummy</>;
}
