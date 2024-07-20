---
'markdownlayer': patch
---

Quality of life improvements and fix caching bug.

- Updated caching mechanism to store unique identifiers, addressing a bug introduced in version `0.4.0-beta.6`. If build fails, try deleting the `.markdownlayer` directory in your project root.
- Enhanced output file generation for entry files (`index.d.ts` and `index.mjs`), ensuring they are generated once unless the config file changes.
- Refactored custom schemas to accept a config object instead of selective properties, providing more flexibility and improving code maintainability.
