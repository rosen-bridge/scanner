# @rosen-bridge/cardano-observation-extractor

## 2.0.0

### Major Changes

- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/abstract-observation-extractor@1.0.0
  - @rosen-bridge/rosen-extractor@11.2.0
  - @rosen-bridge/tokens@5.0.0

## 1.1.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.3
  - @rosen-bridge/rosen-extractor@11.1.1

## 1.1.0

### Minor Changes

- Add `storeRawData` option to store observations raw-data into the database

### Patch Changes

- Update Dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.2
  - @rosen-bridge/rosen-extractor@11.1.0

## 1.0.0

### Major Changes

- Change type of metadata for Blockfrost

### Patch Changes

- Update Dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.1
  - @rosen-bridge/rosen-extractor@11.0.0

## 0.2.0

### Minor Changes

- The observation extractor have been updated to follow the format defined in `abstract-observation-extractor`
- Update rosen-extractor version to the 10.1.0

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
  - @rosen-bridge/abstract-observation-extractor@0.2.0

## 0.1.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.1.2
  - @rosen-bridge/abstract-extractor@2.1.1
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/tokens@4.0.0
  - @rosen-bridge/rosen-extractor@10.0.0
  - @rosen-bridge/abstract-logger@3.0.0

## 0.1.1

### Patch Changes

- Update @rosen-bridge/rosen-extractor version to 9.0.0
- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.1.1

## 0.1.0

- This package was **extracted** from `@rosen-bridge/observation-extractor`.  
  You can follow the previous history in the old package’s changelog. The last changelog update is available [here](https://github.com/rosen-bridge/scanner/blob/d4a5539b01c523b101104470b03ff7023a10b70b/packages/observation-extractor/CHANGELOG.md).
