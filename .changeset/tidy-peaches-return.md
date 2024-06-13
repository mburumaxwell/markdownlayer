---
'markdownlayer': minor
---

Added document schema validation using `zod`. Each definition now includes a `schema` defined with `zod` for validating frontmatter, inspired by Astro's content collections just like the new errors. The `_raw` property has been renamed to `_info`, and a new `data` property now contains the schema instead of placing it at the root, allowing for the use of `any` when there is no schema. Content is no longer serialized to JSON, instead MJS is used to preserve type information, such as dates. Additionally, files in the `.markdownlayer/generated` folder have been renamed, and older folders may need to be deleted.
