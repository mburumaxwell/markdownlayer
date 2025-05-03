# Markdownlayer [![](https://badgen.net/npm/v/markdownlayer)](https://www.npmjs.com/package/markdownlayer)

> [!NOTE]
> I learnt a lot from making this library. Enough to make contributions. However, maintaining this is no longer a priority for me so instead on 03-May-2025 I chose to migrate this blog and other sites I had using this library to instead use [`fumadocs`](https://fumadocs.dev). Why? There is a lot more development happening there and I really respect what the maintainer is doing. Further, it makes it easier to manage docs which was one thing I was aiming at doing with `markdownlayer`. A couple of things are not as easy but it does not compare to what works (the list is too long to even write).

Markdownlayer is a content SDK that validates and transforms your content into type-safe JSON data you can easily `import` into your application's pages. If you have used [Contentlayer](https://github.com/contentlayerdev/contentlayer), this is built to replace it.

## Getting Started

Explore the [example projects](/examples), which you can clone to try out locally.

Read the [blog](https://maxwellweru.com/blog/2024/03/replacing-contentlayer-with-markdownlayer) for more insights.

## Features

- **Live Reload**: Automatically reloads on content changes.
- **Fast and Incremental Builds**: Efficiently builds only the changed content.
- **Schema Validation**: Design and validate schemas using [`zod`](https://www.npmjs.com/package/zod).
- **TypeScript Support**: Auto-generates TypeScript types based on definition schema.
- **Remark Plugins**: Includes Remark GFM, Admonitions, Reading Time, Emoji, and Slug by default.
- **Markdoc Support**: Integrates with Markdoc for advanced content processing.
- **Git Integration**: Tracks last update time and author based on Git, with the option to override via frontmatter.
- **Turbopack Support**: Compatible with Turbopack for faster builds.
- **Image Support**: Image references in frontmatter using custom image schema with support for `alt`.

## Differences from Contentlayer

- The content type is inferred from the extension hence markdown is processed correctly and not forced into MDX.
- Only local content.
- Only NextJs support.
- No JSON/YAML content as they can be loaded directly into the JS/TS code.
- Requires ESM because the whole unified/remark/rehype ecosystem moved to ESM-only.

## Wishlist/Upcoming

> These are in no particular order and depend on how much free time I have.

- Conversion of link elements from `a` to NextJS's `Link` component.
- Conversion of image elements from `img` to NextJS's `Image` component.
- Relative links in markdown content.
- Backward support for CJS by using dynamic imports.
- Collecting images and other files from markdown/MDX/Markdoc files.

## Installation

To install Markdownlayer, use your preferred package manager:

```sh
npm install markdownlayer
# or
yarn add markdownlayer
# or
pnpm add markdownlayer
```

## Usage

Here is a basic example of how to use Markdownlayer in your project:

```typescript
import { defineConfig, z } from 'markdownlayer';

export default defineConfig({
  contentDirPath: './src/content',
  definitions: {
    blog: {
      schema: ({ body, slug }) =>
        z.object({
          title: z.string(),
          slug: slug(),
          body: body(),
        }),
    },
  },
});
```
