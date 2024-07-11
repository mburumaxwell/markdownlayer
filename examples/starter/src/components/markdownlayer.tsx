import type { BaseDoc } from 'markdownlayer/core';
import { Markdownlayer as MarkdownlayerImpl } from 'markdownlayer/react';
import type { Route } from 'next';
import Link from 'next/link';
import type { TweetProps } from 'react-tweet';
import { Tweet } from 'react-tweet';

const components = {
  a: ({ href = '', ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href.startsWith('http')) {
      return (
        <a
          className="text-foreground underline underline-offset-4 hover:no-underline"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      );
    }

    return (
      <Link
        href={href as Route}
        className="text-foreground underline underline-offset-4 hover:no-underline"
        {...props}
      />
    );
  },
  Tweet: (props: TweetProps) => {
    return (
      <div data-theme="light" className="not-prose [&>div]:mx-auto">
        <Tweet {...props} />
      </div>
    );
  },
};

type MarkdownlayerProps = { doc: BaseDoc; className?: string };

export function Markdownlayer({ doc, className }: MarkdownlayerProps) {
  const format = doc.format;
  const code = doc.body.code;
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <MarkdownlayerImpl format={format} code={code} components={components} />
    </div>
  );
}
