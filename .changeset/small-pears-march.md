---
'markdownlayer': minor
---

Include version in the data cache path to ensure generations do not cross dev/prod boundaries. This is useful in two scenarios:

1. Local dev and build when one forgets to remove the `.markdownlayer` folder.
2. When the `.markdownlayer` folder is cached such as in a CI build.
