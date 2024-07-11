---
'markdownlayer': minor
---

Revert to using a mix of JSON and MJS for generated files.
This was originally introduced in the engine rewrite in #109 (363bb665a68f0ee69bbebe5c28c1000c2a68d833) to avoid losing type information. However, that comes at a performance penalty that is not worth it.
