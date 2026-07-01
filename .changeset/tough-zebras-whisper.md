---
'@rosen-bridge/firo-scanner': patch
---

Fix Firo RPC network to get all transactions of the block together using verbosity of 2 instead of fetching them one by one using 'getrawtransaction' call
