---
'markdownlayer': minor
---

`definitions` have been changed from `DocumentDefinition[]` to `Record<string, DocumentDefinition>`, and the `DocumentDefinition` type no longer explicitly includes the `type` property, as it is now inferred from the record's key. Additionally, slugs are now generated relative to the content directory, i.e., `{contentDirPath}/{type}`, enabling improved logic for handling slugs, particularly in internationalization (i18n) scenarios. The `starter` examples demonstrates this well.
