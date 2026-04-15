# @rosen-bridge/fraud-extractor

## 3.0.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.1

## 3.0.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.0

## 3.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.0.1
  - @rosen-bridge/scanner-interfaces@0.2.2

## 3.0.0

### Major Changes

- Refactor fraud extractor to extend AbstractErgoBoxExtractor
- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`

### Minor Changes

- Update AbstractExtractor interface; add `createUsedBlocksQuery` method that returns the query for used blocks

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/abstract-extractor@3.0.0

## 2.2.3

### Patch Changes

- Fixed type definitions in entities based migrations

## 2.2.2

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

## 2.2.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@2.1.1
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/json-bigint@1.0.0
  - @rosen-bridge/abstract-logger@3.0.0
  - @rosen-clients/ergo-explorer@2.0.0

## 2.2.0

### Minor Changes

- Upgrade to Node.js version 22.18.0

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@2.1.0
  - @rosen-bridge/scanner-interfaces@0.2.0

## 2.1.3

### Patch Changes

- Update package license to MIT
- Update dependencies
  - @rosen-bridge/abstract-extractor@2.0.3
  - @rosen-bridge/scanner-interfaces@0.1.1

## 2.1.2

### Patch Changes

- Update network clients and ethers and rateLimitedAxios packages
- Update dependencies
  - @rosen-bridge/abstract-extractor@2.0.2

## 2.1.1

### Patch Changes

- Use rate limiting methods using @rosen-bridge/rate-limited-axios to prevent overwhelming the endpoints
- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.1

## 2.1.0

### Minor Changes

- Unify and move shared interfaces and update all package dependencies

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.0

## 2.0.13

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@5.1.0
  - @rosen-bridge/abstract-extractor@1.0.2

## 2.0.12

### Patch Changes

- Update node version to 20
- Update logger package
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.1
  - @rosen-bridge/scanner@5.0.2

## 2.0.11

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.0
  - @rosen-bridge/scanner@5.0.1

## 2.0.10

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@5.0.0
  - @rosen-bridge/abstract-extractor@0.3.1

## 2.0.9

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@4.1.3

## 2.0.8

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.3.0
  - @rosen-bridge/scanner@4.1.2

## 2.0.7

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@4.1.1

## 2.0.6

### Patch Changes

- Fix explorer response test data
- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.2.0
  - @rosen-bridge/scanner@4.1.0

## 2.0.5

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.5
  - @rosen-bridge/scanner@4.0.5

## 2.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.4
  - @rosen-bridge/scanner@4.0.4

## 2.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.3
  - @rosen-bridge/scanner@4.0.3

## 2.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.2
  - @rosen-bridge/scanner@4.0.2

## 2.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.1
  - @rosen-bridge/scanner@4.0.1

## 2.0.0

### Major Changes

- Updated the InitializeBoxes interface to include the block hash. Previously, only block height was used as initialization point.

### Patch Changes

- Update abstract extractor interface
- Updated dependencies
  - @rosen-bridge/scanner@4.0.0

## 1.2.9

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@3.2.9

## 1.2.8

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@3.2.8

## 1.2.7

### Patch Changes

- Update typeorm version
- Updated dependencies
  - @rosen-bridge/scanner@3.2.7
