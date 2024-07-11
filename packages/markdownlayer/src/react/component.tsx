import type { DocumentFormat } from '@/core/types';
import { useMdocComponent, useMDXComponent } from './hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MarkdownlayerProps = { format: DocumentFormat; code: string; components: any };

export function Markdownlayer({ format, ...remaining }: MarkdownlayerProps) {
  return (
    <>
      {(format == 'md' || format == 'mdx') && <MdOrMdx {...remaining} />}
      {format == 'mdoc' && <Mdoc {...remaining} />}
    </>
  );
}

type MarkdownlayerPropsWithoutFormat = Omit<MarkdownlayerProps, 'format'>;

function Mdoc({ code, components }: MarkdownlayerPropsWithoutFormat) {
  const MdocComponent = useMdocComponent(code, components);
  return <>{MdocComponent}</>;
}

function MdOrMdx({ code, components }: MarkdownlayerPropsWithoutFormat) {
  const MdxComponent = useMDXComponent(code);
  return <MdxComponent components={{ ...components }} />;
}
