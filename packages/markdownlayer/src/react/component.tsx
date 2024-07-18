import type { DocumentBody } from '../types';
import { useMdocComponent, useMDXComponent } from './hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MarkdownlayerProps = { body: DocumentBody; components: any };

export function Markdownlayer({ body, components }: MarkdownlayerProps) {
  const { format, code } = body;
  return (
    <>
      {(format == 'md' || format == 'mdx') && <MdOrMdx code={code} components={components} />}
      {format == 'mdoc' && <Mdoc code={code} components={components} />}
    </>
  );
}

type MarkdownlayerPropsInner = { code: string } & Pick<MarkdownlayerProps, 'components'>;

function Mdoc({ code, components }: MarkdownlayerPropsInner) {
  const MdocComponent = useMdocComponent(code, components);
  return <>{MdocComponent}</>;
}

function MdOrMdx({ code, components }: MarkdownlayerPropsInner) {
  const MdxComponent = useMDXComponent(code);
  return <MdxComponent components={{ ...components }} />;
}
