# @rosen-bridge/abstract-observation-extractor

## 1.0.5

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.2
  - @rosen-bridge/extended-typeorm@1.1.0
  - @rosen-bridge/rosen-extractor@12.0.1
  - @rosen-bridge/tokens@6.0.1

## 1.0.4

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.1

## 1.0.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.0
  - @rosen-bridge/rosen-extractor@11.3.0

## 1.0.2

### Patch Changes

- Update dependencies:
  - @rosen-bridge/rosen-extractor@11.2.2
  - @rosen-bridge/tokens@6.0.0

## 1.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.0.1
  - @rosen-bridge/rosen-extractor@11.2.1
  - @rosen-bridge/scanner-interfaces@0.2.2
  - @rosen-bridge/tokens@5.0.1

## 1.0.0

### Major Changes

- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`

### Minor Changes

- Update AbstractExtractor interface; add `createUsedBlocksQuery` method that returns the query for used blocks

### Patch Changes

- Update ObservationEntityAction to considering extractor in storeObservations method
- Update dependencies
  - @rosen-bridge/abstract-extractor@3.0.0
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/rosen-extractor@11.2.0
  - @rosen-bridge/tokens@5.0.0

## 0.2.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/rosen-extractor@11.1.1

## 0.2.2

### Patch Changes

- Update Dependencies
  - @rosen-bridge/rosen-extractor@11.1.0

## 0.2.1

### Patch Changes

- Fixed type definitions in entities based migrations
- Update Dependencies
  - @rosen-bridge/rosen-extractor@11.0.0

## 0.2.0

### Minor Changes

- Added preprocessTransactions method
- Add rawData field in ObservationEntity and AbstractObservationExtractor processTransactions method

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
  - @rosen-bridge/abstract-extractor@2.1.2
  - @rosen-bridge/scanner-interfaces@0.2.1

## 0.1.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@2.1.1
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/tokens@4.0.0
  - @rosen-bridge/rosen-extractor@10.0.0
  - @rosen-bridge/abstract-logger@3.0.0

## 0.1.1

### Patch Changes

- Update @rosen-bridge/rosen-extractor version to 9.0.0

## 0.1.0

- The package has been **renamed** from `@rosen-bridge/observation-extractor`.  
  You can track the previous history in the changelog of the old package. The latest update is available [here](https://github.com/rosen-bridge/scanner/blob/d4a5539b01c523b101104470b03ff7023a10b70b/packages/observation-extractor/CHANGELOG.md).
