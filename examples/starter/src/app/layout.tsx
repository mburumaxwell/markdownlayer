import { Metadata } from 'next';
import { TemplateString } from 'next/dist/lib/metadata/types/metadata-types';

import siteConfig from '@/site-config';

const titleTemplate: TemplateString = {
  default: siteConfig.title,
  template: `%s | ${siteConfig.title}`,
};

export const metadata: Metadata = {
  title: titleTemplate,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  metadataBase: new URL(siteConfig.siteUrl),
  openGraph: {
    type: 'website',
    title: titleTemplate,
    description: siteConfig.description,
    images: [siteConfig.socialImage],
    url: siteConfig.siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
