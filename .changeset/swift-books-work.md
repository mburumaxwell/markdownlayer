---
'markdownlayer': minor
---

Support for turbopack.
`withMarkdownlayer` must be the last plugin in the chain because the plugin returns a Promise, which is compatible with Next.js, but other plugins may not expect this behavior.
