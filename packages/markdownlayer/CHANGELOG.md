# markdownlayer

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
