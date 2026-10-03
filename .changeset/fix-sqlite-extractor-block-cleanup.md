---
'@rosen-bridge/abstract-scanner': patch
---

Fix SQLite block cleanup when several extractors reference blocks. Preserve each reference query's parameters, ordering and limits while retaining the deletion batch bound.
