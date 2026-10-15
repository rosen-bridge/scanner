---
'@rosen-bridge/cardano-scanner': patch
---

Fix Cardano Ogmios `findIntersection` deadlocking when reading the saved blocks fails: the scanner mutex is now released in a `finally` block, so the widened retry pass can acquire it instead of waiting forever on a mutex the loop itself still holds. Also compare (instead of assign) the block hash when looking up the intersecting block's height, which previously always returned the newest block's height and overwrote its hash.
