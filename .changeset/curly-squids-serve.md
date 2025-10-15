---
'@rosen-bridge/bitcoin-runes-observation-extractor': patch
'@rosen-bridge/bitcoin-observation-extractor': patch
'@rosen-bridge/cardano-observation-extractor': patch
'@rosen-bridge/ergo-observation-extractor': patch
'@rosen-bridge/evm-observation-extractor': patch
'@rosen-bridge/abstract-observation-extractor': patch
'@rosen-bridge/evm-address-tx-extractor': patch
'@rosen-bridge/bitcoin-scanner': patch
'@rosen-bridge/cardano-scanner': patch
'@rosen-bridge/watcher-data-extractor': patch
'@rosen-bridge/ergo-scanner': patch
'@rosen-bridge/evm-scanner': patch
'@rosen-bridge/abstract-extractor': patch
'@rosen-bridge/scanner-interfaces': patch
'@rosen-bridge/address-extractor': patch
'@rosen-bridge/abstract-scanner': patch
'@rosen-bridge/fraud-extractor': patch
'@rosen-bridge/tx-id-extractor': patch
---

- Fix package-lock and move typescript and types/node into root
- Update eslint and plugins:
  - Apply new rules such as sort imports and file name
- Update rosen dependencies:
  - "@rosen-bridge/extended-typeorm": "^1.0.1"
  - "@rosen-clients/rate-limited-axios": "^1.1.0"
  - "@rosen-bridge/rosen-extractor": "^10.1.1"
  - "@rosen-bridge/tokens": "^4.0.1"
  - "@rosen-bridge/abstract-logger": "^3.0.1"
  - "@rosen-bridge/json-bigint": "^1.1.0"
  - "@rosen-clients/ergo-explorer": "^2.1.0"
  - "@rosen-clients/ergo-node": "^3.1.0"
