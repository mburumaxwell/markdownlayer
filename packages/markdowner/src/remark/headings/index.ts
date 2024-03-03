// inspired by Docusaurus
// https://github.com/facebook/docusaurus/blob/5baa68bea013c30e5b2ad2e166b0252344c0baab/packages/docusaurus-mdx-loader/src/remark/headings/index.ts

import GithubSlugger from 'github-slugger';
import type { Heading, Text } from 'mdast';
import { toString } from 'mdast-util-to-string';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

const slugger = new GithubSlugger();

/**
 * Parses custom ID from a heading. The ID can contain any characters except
 * `{#` and `}`.
 *
 * @param heading e.g. `## Some heading {#some-heading}` where the last
 * character must be `}` for the ID to be recognized
 */
export function parseMarkdownHeadingId(heading: string): {
  /**
   * The heading content sans the ID part, right-trimmed. e.g. `## Some heading`
   */
  text: string;
  /** The heading ID. e.g. `some-heading` */
  id: string | undefined;
} {
  const customHeadingIdRegex = /\s*\{#(?<id>(?:.(?!\{#|\}))*.)\}$/;
  const matches = customHeadingIdRegex.exec(heading);
  if (matches) {
    return {
      text: heading.replace(matches[0]!, ''),
      id: matches.groups!.id!,
    };
  }
  return { text: heading, id: undefined };
}

export default function remarkHeadings(): Transformer {
  return (root) => {
    visit(root, 'heading', (headingNode: Heading) => {
      const data = headingNode.data ?? (headingNode.data = {});
      const properties = (data.hProperties || (data.hProperties = {})) as {
        id: string;
      };
      let { id } = properties;

      if (id) {
        id = slugger.slug(id, /* maintainCase */ true);
      } else {
        const headingTextNodes = headingNode.children.filter(({ type }) => !['html', 'jsx'].includes(type));
        const heading = toString(headingTextNodes.length > 0 ? headingTextNodes : headingNode);

        // Support explicit heading IDs
        const parsedHeading = parseMarkdownHeadingId(heading);

        id = parsedHeading.id ?? slugger.slug(heading);

        if (parsedHeading.id) {
          // When there's an id, it is always in the last child node
          // Sometimes heading is in multiple "parts" (** syntax creates a child
          // node):
          // ## part1 *part2* part3 {#id}
          const lastNode = headingNode.children[headingNode.children.length - 1] as Text;

          if (headingNode.children.length > 1) {
            const lastNodeText = parseMarkdownHeadingId(lastNode.value).text;
            // When last part contains test+id, remove the id
            if (lastNodeText) {
              lastNode.value = lastNodeText;
            }
            // When last part contains only the id: completely remove that node
            else {
              headingNode.children.pop();
            }
          } else {
            lastNode.value = parsedHeading.text;
          }
        }
      }

      // @ts-expect-error: fine
      data.id = id;
      properties.id = id;
    });
  };
}
