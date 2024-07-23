# markdownlayer

## 0.4.0-beta.12

### Minor Changes

- 2cfb6c0: Split images logic away from remark-transform-links

### Patch Changes

- c03e1ce: Add issue for each esbuild error from mdx compilation
- 72a2404: Skip links without extension in remark-transform-links
- 6c507d8: Continue gracefully if transform link or image fails in remark plugins

## 0.4.0-beta.11

### Minor Changes

- c4af058: Support transforming links and images with exclusion of document files

## 0.4.0-beta.10

### Patch Changes

- 2d70707: Use path relative to collection in `id` schema since it is scoped to it

## 0.4.0-beta.9

### Patch Changes

- 96d03a0: Allow empty strings for slugs such as when dealing with `index.md` or `index/index.md` files

## 0.4.0-beta.8

### Minor Changes

- e4b284e: Allow configuration of min, max, and regex fields in the slug and id schemas
- 2609fab: Support for `alt` in image schema specified in frontmatter

## 0.4.0-beta.7

### Minor Changes

- cf47c01: Move `format` from `DocumentDefinition` and `mdAsMarkdoc` from the config to the body schema.
  This allows setting `mdAdMarkdoc` per definition.

### Patch Changes

- 379c0c8: Quality of life improvements and fix caching bug.

  - Updated caching mechanism to store unique identifiers, addressing a bug introduced in version `0.4.0-beta.6`. If build fails, try deleting the `.markdownlayer` directory in your project root.
  - Enhanced output file generation for entry files (`index.d.ts` and `index.mjs`), ensuring they are generated once unless the config file changes.
  - Refactored custom schemas to accept a config object instead of selective properties, providing more flexibility and improving code maintainability.

- 112326f: Only watch for file changes based on provided patterns (or the default)
- c0b6f5f: Allow opt out of default values for slug and id schemas
- 097e776: Wait for files to be written when watching while being responsive

## 0.4.0-beta.6

### Patch Changes

- 39e7215: Remove entries in uniques cache when a file changes.
  Without this dev crashes when a file is edited.
- 88477a0: Added a logger (mostly copied from velite)
- cb6bccb: Catch errors thrown in watcher, log, and continue gracefully.

## 0.4.0-beta.5

### Minor Changes

- 237b0b8: Redo sections of the engine to support custom schemas such as images, slug, etc
  This is inspired in part by velite and astro.

## 0.4.0-beta.4

### Minor Changes

- 3348332: No longer need to produce package.json in the generated folder
- ecbefbf: Infer types from config file by reference instead of generating them.
  This improves the dev experience because changes in schema reflect instantly instead of waiting for a fresh build.
- 11a32b5: Revert to using a mix of JSON and MJS for generated files.
  This was originally introduced in the engine rewrite in #109 (363bb665a68f0ee69bbebe5c28c1000c2a68d833) to avoid losing type information. However, that comes at a performance penalty that is not worth it.
- f6fb7fd: Added react export to replace the hooks export and included a default react component to reduce boilerplate code.
- 69d0193: Improve watcher for files.
  Using one watcher is more efficient since we can merge the files/directories for which we expect changes. This allows watching on config-related files such as additional remark plugins.
  Consequently, the config is only rebuilt when there are changes to it or its related files.
- afc25b5: No longer support passing of config via plugin.
  This paves way for type inference from the config file.
- 9cefc89: Support passing of a custom config file and improve config processing as inspired by velite
- 7352ab1: Support for turbopack.
  `withMarkdownlayer` must be the last plugin in the chain because the plugin returns a Promise, which is compatible with Next.js, but other plugins may not expect this behavior.
- 2f94329: Ignore files starting with a dot or underscore

### Patch Changes

- 32d8fdf: Replace shelljs with child_process

## 0.4.0-beta.3

### Patch Changes

- 75e1898: Use full file path as cache key to prevent collisions when files are named the same but in a different folder
- 100433d: No longer reference type-fest

## 0.4.0-beta.2

### Minor Changes

- 0aa65b0: Include version in the data cache path to ensure generations do not cross dev/prod boundaries. This is useful in two scenarios:

  1. Local dev and build when one forgets to remove the `.markdownlayer` folder.
  2. When the `.markdownlayer` folder is cached such as in a CI build.

### Patch Changes

- 2c22b48: Fix stripping of trailing "index" when generating slug (bug introduced in `0.4.0-beta.0`)

## 0.4.0-beta.1

### Minor Changes

- aef8c2a: Use an object as the argument for `ImageFunction` to allow for more options later
- 544a1b9: Type names should be singularized

### Patch Changes

- 4898e1c: Ensure watch happens for the `contentDirPath` (bug introduced in `0.4.0-beta.0`)

## 0.4.0-beta.0

### Minor Changes

- e993b3a: No longer need to ignore node_modules from webpack watch
- 8b5b45a: No longer expose methods for watching
- 9adcdae: `definitions` have been changed from `DocumentDefinition[]` to `Record<string, DocumentDefinition>`, and the `DocumentDefinition` type no longer explicitly includes the `type` property, as it is now inferred from the record's key. Additionally, slugs are now generated relative to the content directory, i.e., `{contentDirPath}/{type}`, enabling improved logic for handling slugs, particularly in internationalization (i18n) scenarios. The `starter` examples demonstrates this well.
- 65e178c: Rename `readingTime` to `readTime` and make it optional; configurable per definition.
- 798be20: Enable verbatimModuleSyntax (#98)
- b628835: Group git options into a type of its own to make it simpler to use.
- 71adfdf: Support watching the config file for changes
- 363bb66: Added document schema validation using `zod`. Each definition now includes a `schema` defined with `zod` for validating frontmatter, inspired by Astro's content collections just like the new errors. The `_raw` property has been removed, and a new `data` property now contains the schema instead of placing it at the root, allowing for the use of `any` when there is no schema. Content is no longer serialized to JSON, instead MJS is used to preserve type information, such as dates. Additionally, files in the `.markdownlayer/generated` folder have been renamed, and older folders may need to be deleted.
- 88c4fca: No longer expose generation logic
- 4b46c28: Remove the plugin that allows co-locating document definitions with react components.
  This is behaviour is not encouraged.
- bde06df: Recommended eslint rules

### Patch Changes

- 258069f: Remove webpack-related error that is not manifest in next>=14.2.0
- aba030d: Make the use of `remark-emoji` optional; enabled by default
- 689615c: Make the use of `remark-gfm` optional; enabled by default

## 0.3.1

### Patch Changes

- 0a5f4b1: Full versions for type-fest and webpack peer dependencies

## 0.3.0

### Minor Changes

- 5189667: Change validation to be asynchronous
- 6c97b7a: Allow opt out of using git for last update time and author

## 0.2.0

### Minor Changes

- 5986862: Support passing config with registration of the plugin which ignores markdownlayer.config.ts

### Patch Changes

- f24fc2b: Inject shims if needed
- 11a406f: Added README.md

## 0.1.4

### Patch Changes

- 2d81fd2: Change publish settings to fix deployed files

## 0.1.3

### Patch Changes

- 41dfcbb: Restore access=public to publishConfig

## 0.1.2

### Patch Changes

- 47156dc: Set types and remove explicit access setting

## 0.1.1

### Patch Changes

- aabea2c: Rename from markdowner to markdownlayer because the former is taken

## 0.1.0

### Minor Changes

- 6f33f1b: markdownlayer should not be private to allow for publishing

### Patch Changes

- 7759a7a: Root package should use a different name
