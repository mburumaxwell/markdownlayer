// inspired by code at:
// https://github.com/facebook/docusaurus/blob/v3.1.0/packages/docusaurus-mdx-loader/src/remark/admonitions/index.ts

import type { Node, Parent } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import type { Processor, Transformer } from 'unified';
import { visit } from 'unist-util-visit';

export type AdmonitionPluginOptions = {
  keywords?: string[];
  extendDefaults?: boolean;
};

export const DefaultKeywords = ['info', 'danger', 'note', 'tip', 'warning', 'caution'];

type DirectiveLabel = Parent;
type DirectiveContent = ContainerDirective['children'];

function parseDirective(directive: ContainerDirective): {
  directiveLabel: DirectiveLabel | undefined;
  contentNodes: DirectiveContent;
} {
  const hasDirectiveLabel =
    // @ts-expect-error: fine
    directive.children?.[0]?.data?.directiveLabel === true;
  if (hasDirectiveLabel) {
    const [directiveLabel, ...contentNodes] = directive.children;
    return { directiveLabel: directiveLabel as DirectiveLabel, contentNodes };
  }
  return { directiveLabel: undefined, contentNodes: directive.children };
}

function getTextOnlyTitle(directiveLabel: DirectiveLabel): string | undefined {
  const isTextOnlyTitle = directiveLabel?.children?.length === 1 && directiveLabel?.children?.[0]?.type === 'text';
  return isTextOnlyTitle
    ? // @ts-expect-error: todo type
      (directiveLabel?.children?.[0].value as string)
    : undefined;
}

export default function remarkAdmonitions(this: Processor, options: AdmonitionPluginOptions = {}): Transformer {
  const { extendDefaults = true } = options;
  const keywords = options.keywords ?? [];

  // By default it makes more sense to append keywords to the default ones
  // Adding custom keywords is more common than disabling existing ones
  if (extendDefaults) {
    keywords.unshift(...DefaultKeywords);
  }

  return (root) => {
    visit(root, function (node: Node) {
      if (node.type === 'containerDirective') {
        const directive = node as ContainerDirective;
        const isAdmonition = keywords.includes(directive.name);

        if (!isAdmonition) {
          return;
        }

        const { directiveLabel, contentNodes } = parseDirective(directive);

        const textOnlyTitle =
          directive.attributes?.title ?? (directiveLabel ? getTextOnlyTitle(directiveLabel) : undefined);

        // Transform the mdast directive node to a hast admonition node
        // See https://github.com/syntax-tree/mdast-util-to-hast#fields-on-nodes
        // TODO transform the whole directive to mdxJsxFlowElement instead of using hast
        directive.data = {
          hName: 'admonition',
          hProperties: {
            ...(textOnlyTitle && { title: textOnlyTitle }),
            type: directive.name,
          },
        };
        directive.children = contentNodes;
      }
    });
  };
}
