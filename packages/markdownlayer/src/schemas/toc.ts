import { slug as githubSlug } from 'github-slugger';
import { custom } from 'zod';
import type { TocItem } from '../types';

// For some reason, generating toc using mdast-util-toc or even using docusaurus' own toc plugin generates entries from frontmatter.
// Most of the time it is the first entry but sometimes it is not. Removing it results in missing TOC at times.
// So we have to do it manually using regex. Hopefully this is a temporary solution and someone will fix this someday.
// Regex solution from https://yusuf.fyi/posts/contentlayer-table-of-contents
const regXHeader = /\n(?<flag>#{1,6})\s+(?<content>.+)/g;

/**
 * Schema for a document's table of contents.
 * @returns A Zod object representing table of contents data.
 */
export function toc({ contents }: { contents: string }) {
  return custom().transform<TocItem[]>(() => {
    return Array.from(contents.matchAll(regXHeader)).map(({ groups }) => {
      const { flag, content } = groups!;
      // Note: using `slug` instead of `new Slugger()` means no slug deduping.
      const id = githubSlug(content);
      return {
        level: flag.length,
        value: content,
        id: id,
        url: `#${id}`,
      };
    });
  });
}
