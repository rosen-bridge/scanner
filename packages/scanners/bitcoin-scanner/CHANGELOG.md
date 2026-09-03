# @rosen-bridge/bitcoin-scanner

## 2.0.0

### Major Changes

- Add automatic cleanup of old unused blocks during scanner execution

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@3.0.0

## 1.1.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@2.0.3

## 1.1.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@2.0.2
  - @rosen-clients/rate-limited-axios@2.0.1

## 1.1.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@2.0.1

## 1.1.0

### Minor Changes

- Add heightGap config into scanners config

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@2.0.0
  - @rosen-bridge/scanner-interfaces@1.0.0

## 1.0.4

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@1.0.4

## 1.0.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@1.0.3
  - @rosen-clients/rate-limited-axios@2.0.0

## 1.0.2

### Patch Changes

- @rosen-bridge/abstract-scanner@1.0.2

## 1.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/scanner-interfaces@0.2.2
  - @rosen-bridge/abstract-scanner@1.0.1

## 1.0.0

### Major Changes

- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/abstract-scanner@1.0.0

## 0.2.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@0.2.3

## 0.2.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@0.2.2

## 0.2.1

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update eslint and plugins:
  - Apply new rules such as sort imports and file name
- Update dependencies
  - @rosen-bridge/extended-typeorm@1.0.1
  - @rosen-clients/rate-limited-axios@1.1.0
  - @rosen-bridge/rosen-extractor@10.1.1
  - @rosen-bridge/tokens@4.0.1
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/json-bigint@1.1.0
  - @rosen-clients/ergo-explorer@2.1.0
  - @rosen-clients/ergo-node@3.1.0
- Update dependencies
  - @rosen-bridge/scanner-interfaces@0.2.1
  - @rosen-bridge/abstract-scanner@0.2.1

## 0.2.0

### Minor Changes

- Use @rosen-clients/rate-limited-axios instead of @rosen-bridge/rate-limited-axios

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-scanner@0.2.0

## 0.1.0

- This package was **integrated** from `@rosen-bridge/bitcoin-esplora-scanner` and `@rosen-bridge/bitcoin-rpc-scanner`.  
  You can follow the previous history in the old package’s changelog. The last changelog updates for the integrated packages are available below:
  - [Bitcoin Esplora Scanner Changelog](https://github.com/rosen-bridge/scanner/blob/d4a5539b01c523b101104470b03ff7023a10b70b/packages/scanners/bitcoin-esplora-scanner/CHANGELOG.md)
  - [Bitcoin RPC Scanner Changelog](https://github.com/rosen-bridge/scanner/blob/d4a5539b01c523b101104470b03ff7023a10b70b/packages/scanners/bitcoin-rpc-scanner/CHANGELOG.md)
