---
'@rosen-bridge/abstract-scanner': patch
---

Fix `stepForward` to cap step value at remaining blocks when approaching chain tip, preventing `BlockNotFound` errors.
