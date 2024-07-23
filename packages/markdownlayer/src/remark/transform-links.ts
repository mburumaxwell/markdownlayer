import type { Definition, Image, Link, Node } from 'mdast';
import { extname } from 'path';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';
import { processAsset } from '../assets';
import type { ResolvedMarkdownlayerConfig } from '../types';
import { isRelativePath } from '../utils';

// Default extensions to be excluded
const DefaultExcludedExtensions = [
  // markdown
  '.md',
  '.markdown',
  '.mdown',
  '.mkdn',
  '.mkd',
  '.mdwn',
  '.mkdown',
  '.ron',

  // mdx and mdoc
  '.mdx',
  '.mdoc',
];

export type RemarkTransformLinksOptions = {
  // TODO: transform this links by checking for the references instead of skipping them
  /**
   * Extensions that should not be transformed.
   * @default ['.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mkdown', '.ron', '.mdx', '.mdoc']
   */
  excludeExtensions?: readonly string[];
};

type Options = RemarkTransformLinksOptions & { config: ResolvedMarkdownlayerConfig };
export default function remarkTransformLinks({
  excludeExtensions = DefaultExcludedExtensions,
  config,
}: Options): Transformer {
  const { output } = config;
  return async (root, file) => {
    const links: Record<string, (Link | Image | Definition)[]> = {};

    // image e.g. ![alt](./image.png)
    // link e.g. [link](./link.md) or [file](./file.txt)
    // definition e.g. [link][id]
    visit(root, ['link', 'image', 'definition'], (n: Node) => {
      const node = n as Link | Image | Definition;
      const { url: src } = node;
      if (excludeExtensions.includes(extname(src))) return;
      if (isRelativePath(src)) {
        const nodes = links[src] || [];
        nodes.push(node);
        links[src] = nodes;
      }
    });

    await Promise.all(
      Object.entries(links).map(async ([src, nodes]) => {
        const url = await processAsset({ input: src, from: file.path, format: output.format, baseUrl: output.base });
        if (!url || url === src) return;
        for (const node of nodes) {
          if (node.url === src) {
            node.url = url;
            continue;
          }
        }
      }),
    );
  };
}
