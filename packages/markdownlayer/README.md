# Markdownlayer [![](https://badgen.net/npm/v/markdownlayer)](https://www.npmjs.com/package/markdownlayer)

Markdownlayer is a content SDK that validates and transforms your content into type-safe JSON data you can easily `import` into your application's pages. If you know how to or have used [Contentlayer](https://github.com/contentlayerdev/contentlayer), this is built to replace it.

## Getting Started

Explore the [example projects](/examples), which you can clone to try out locally.

Read the [blog](https://maxwellweru.com/blog/2024/03/replacing-contentlayer-with-markdownlayer).

## Features

- Live reload on content changes
- Fast and incremental builds
- Schema design and validation using [`zod`](https://www.npmjs.com/package/zod).
- Auto-generated TypeScript types based on definition schema.
- Remark GFM, Admonitions, Reading Time, Emoji, and Slug included by default.
- Markdoc support
- Last update time and author based on Git but can be overridden via frontmatter.
- Turbopack support

## Wishlist/Upcoming

> These are in no particular order and depend on how much free time I have.

- Conversion of link elements from `a` to NextJS's `Link` component.
- Conversion of image elements from `img` to NextJS's `Image` component.
- Image references in frontmatter.
- Relative links in markdown content.

## Differences from Contentlayer

- The content type is inferred from the extension hence markdown is processed correctly and not forced into MDX.
- Supply configuration in `next.config.js` as an alternative to `markdownlayer.config.js`.
- Only local content.
- Only NextJs support.
- No JSON/YAML content as they can be loaded directly into the JS/TS code.
- Requires ESM because the whole unified/remark/rehype ecosystem moved to ESM-only.
