---
'markdownlayer': minor
---

Improve watcher for files.
Using one watcher is more efficient since we can merge the files/directories for which we expect changes. This allows watching on config-related files such as additional remark plugins.
Consequently, the config is only rebuilt when there are changes to it or its related files.
