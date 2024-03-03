import { DocumentFormat } from 'markdownlayer/core';
import { useMDXComponent, useMdocComponent } from 'markdownlayer/hooks';
import { Route } from 'next';
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

type MarkdownlayerProps = { type: DocumentFormat; code: string; className?: string };

export function Markdownlayer({ type, code, className }: MarkdownlayerProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      {(type == 'md' || type == 'mdx') && <MdOrMdx code={code} />}
      {type == 'mdoc' && <Mdoc code={code} />}
    </div>
  );
}

function Mdoc({ code }: { code: string }) {
  const MdocComponent = useMdocComponent(code, components);
  return <>{MdocComponent}</>;
}

function MdOrMdx({ code }: { code: string }) {
  const MdxComponent = useMDXComponent(code);
  return <MdxComponent components={{ ...components }} />;
}
