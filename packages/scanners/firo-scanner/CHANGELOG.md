# @rosen-bridge/firo-scanner

## 0.2.1

### Patch Changes

- Fix Firo RPC network to get all transactions of the block together using verbosity of 2 instead of fetching them one by one using 'getrawtransaction' call
- Update dependencies
  - @rosen-bridge/abstract-scanner@2.0.1

## 0.2.0

### Minor Changes

- Add `FiroElectrumXScanner` which uses ElectrumX-firo server to scan the blockchain
  Add `ElectrumXSocket`, a client for ElectrumX-firo server
- Add heightGap config into scanners config

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@2.0.0
  - @rosen-bridge/scanner-interfaces@1.0.0

## 0.1.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@1.0.4

## 0.1.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@1.0.3
  - @rosen-clients/rate-limited-axios@2.0.0

## 0.1.0

### Minor Changes

- Add Firo scanner
