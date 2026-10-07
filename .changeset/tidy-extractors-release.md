---
'@rosen-bridge/abstract-extractor': patch
---

fix unhook leaking the callback mutex when the callback id is not registered, which blocked every later hook and unhook call
