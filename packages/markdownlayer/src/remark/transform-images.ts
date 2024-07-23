import type { Image, Node } from 'mdast';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';
import { processAsset } from '../assets';
import { logger } from '../logger';
import type { ResolvedMarkdownlayerConfig } from '../types';
import { isRelativePath } from '../utils';

export type RemarkTransformImagesOptions = {
  // this is a placeholder for future options
};

type Options = RemarkTransformImagesOptions & { config: ResolvedMarkdownlayerConfig };
export default function remarkTransformImages({ config }: Options): Transformer {
  const { output } = config;
  return async (root, file) => {
    const images: Record<string, Image[]> = {};

    // image e.g. ![alt](./image.png)
    visit(root, ['image'], (n: Node) => {
      const node = n as Image;
      const { url: src } = node;
      if (isRelativePath(src)) {
        const nodes = images[src] || [];
        nodes.push(node);
        images[src] = nodes;
      }
    });

    await Promise.all(
      Object.entries(images).map(async ([src, nodes]) => {
        try {
          const { src: url } = await processAsset(
            { input: src, from: file.path, format: output.format, baseUrl: output.base },
            true,
          );
          if (!url || url === src) return;
          for (const node of nodes) {
            if (node.url === src) {
              node.url = url;
              continue;
            }
          }
        } catch (error) {
          logger.warn(`Failed to process image reference '${src}' in '${file.path}'. ${error}`);
        }
      }),
    );
  };
}
