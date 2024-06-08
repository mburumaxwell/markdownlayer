# Markdownlayer [![](https://badgen.net/npm/v/markdownlayer)](https://www.npmjs.com/package/markdownlayer)

Markdownlayer is a content SDK that validates and transforms your content into type-safe JSON data you can easily `import` into your application's pages. If you know how to or have used [Contentlayer](https://github.com/contentlayerdev/contentlayer), this is built to replace it.

## Getting Started

Explore the [example projects](/examples), which you can clone to try out locally.

Read the [blog](https://maxwellweru.com/blog/2024/03/replacing-contentlayer-with-markdownlayer).

## Features

- Live reload on content changes
- Fast and incremental builds
- Simple but powerful schema DSL to design your content model (validates your content and generates types)
- Auto-generated TypeScript types based on your content types

## Differences from Contentlayer

- Markdoc support
- The content type is inferred from the extension hence markdown is processed correctly and not forced into MDX.
- Remark GFM, Admonitions, Reading Time, Emoji, and Slug included by default.
- Last update time and author based on Git but can be overridden via frontmatter.
- Supply configuration in `next.config.js` as an alternative to `markdownlayer.config.js`.
- Only local content (no notion sources yet).
- Only NextJs support (no Remix yet).
- No JSON/YAML content as they can be loaded directly into the JS/TS code.

## Known issues

- Requires ESM because the whole unified/remark/rehype ecosystem moved to ESM-only.
- Due to the ESM-only requirement, there is a webpack warning on build/dev. This will be resolved once `next.config.ts` is supported in <https://github.com/vercel/next.js/pull/63051>, of if there is a new idea before then.
