# markdownlayer

## 0.4.0

### Minor Changes

- e993b3a: No longer need to ignore node_modules from webpack watch
- 8b5b45a: No longer expose methods for watching
- 798be20: Enable verbatimModuleSyntax (#98)
- 71adfdf: Support watching the config file for changes
- 363bb66: Added document schema validation using `zod`. Each definition now includes a `schema` defined with `zod` for validating frontmatter, inspired by Astro's content collections just like the new errors. The `_raw` property has been renamed to `_info`, and a new `data` property now contains the schema instead of placing it at the root, allowing for the use of `any` when there is no schema. Content is no longer serialized to JSON, instead MJS is used to preserve type information, such as dates. Additionally, files in the `.markdownlayer/generated` folder have been renamed, and older folders may need to be deleted.
- 88c4fca: No longer expose generation logic
- 4b46c28: Remove the plugin that allows co-locating document definitions with react components.
  This is behaviour is not encouraged.
- bde06df: Recommended eslint rules

### Patch Changes

- 258069f: Remove webpack-related error that is not manifest in next>=14.2.0

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
