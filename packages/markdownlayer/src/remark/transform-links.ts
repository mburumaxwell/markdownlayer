import type { Definition, Link, Node } from 'mdast';
import { extname } from 'path';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';
import { processAsset } from '../assets';
import { logger } from '../logger';
import type { ResolvedMarkdownlayerConfig } from '../types';
import { isRelativePath } from '../utils';

export type RemarkTransformLinksOptions = {
  // TODO: transform this links by checking for the references instead of skipping them
  /**
   * Extensions that should not be transformed.
   * @default ['.md', '.mdx', '.mdoc']
   */
  excludeExtensions?: readonly string[];
};

type Options = RemarkTransformLinksOptions & { config: ResolvedMarkdownlayerConfig };
export default function remarkTransformLinks({
  excludeExtensions = ['.md', '.mdx', '.mdoc'],
  config,
}: Options): Transformer {
  const { output } = config;
  return async (root, file) => {
    const links: Record<string, (Link | Definition)[]> = {};

    // link e.g. [link](./link.md) or [file](./file.txt)
    // definition e.g. [link][id]
    visit(root, ['link', 'definition'], (n: Node) => {
      const node = n as Link | Definition;
      const { url: src } = node;
      const ext = extname(src);
      if (!ext || excludeExtensions.includes(ext)) return;
      if (isRelativePath(src)) {
        const nodes = links[src] || [];
        nodes.push(node);
        links[src] = nodes;
      }
    });

    await Promise.all(
      Object.entries(links).map(async ([src, nodes]) => {
        try {
          const url = await processAsset({ input: src, from: file.path, format: output.format, baseUrl: output.base });
          if (!url || url === src) return;
          for (const node of nodes) {
            if (node.url === src) {
              node.url = url;
              continue;
            }
          }
        } catch (error) {
          logger.warn(`Failed to process link reference '${src}' in '${file.path}'. ${error}`);
        }
      }),
    );
  };
}
