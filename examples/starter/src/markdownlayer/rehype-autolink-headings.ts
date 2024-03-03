import rehypeAutolinkHeadings, { type Options } from 'rehype-autolink-headings';
import type { Pluggable } from 'unified';

const autolinkHeadings: Pluggable = [
  rehypeAutolinkHeadings,
  {
    behavior: 'append',
    properties: {
      className: [
        "no-underline after:content-['🔗'] text-xs after:text-muted-foreground/50 after:hover:text-muted-foreground ml-1 after:p-1",
      ],
      ariaLabel: 'Link to section',
    },
  } satisfies Options,
];

export default autolinkHeadings;
