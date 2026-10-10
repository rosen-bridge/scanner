# @rosen-bridge/abstract-observation-extractor

## 3.0.0

### Major Changes

- Rename and standardize observation extractor ids to `<chain>-observation-extractor` and add a migration to rename the stored ids in `observation_entity` and `extractor_status_entity`:
  - `bitcoin-esplora-extractor`, `bitcoin-rpc-extractor` → `bitcoin-observation-extractor`
  - `doge-esplora-extractor`, `doge-rpc-extractor` → `doge-observation-extractor`
  - `bitcoin-runes-esplora-extractor`, `bitcoin-runes-rpc-extractor` → `bitcoin-runes-observation-extractor`
  - `cardano-blockfrost-extractor`, `cardano-koios-extractor`, `cardano-ogmios-extractor` → `cardano-observation-extractor`
  - `ethereum-rpc-extractor` → `ethereum-observation-extractor`
  - `binance-rpc-extractor` → `binance-observation-extractor`
  - `handshake-rpc-extractor` → `handshake-observation-extractor`

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@4.1.0

## 2.0.0

### Major Changes

- Refactor `createUsedBlocksQuery` to return an array of `SelectQueryBuilder` instead of a single query

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@4.0.0

## 1.0.11

### Patch Changes

- Update dependencies
  - @rosen-bridge/rosen-extractor@12.1.2

## 1.0.10

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.3

## 1.0.9

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.2
  - @rosen-bridge/rosen-extractor@12.1.1
  - @rosen-bridge/tokens@6.0.2

## 1.0.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.1

## 1.0.7

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.0
  - @rosen-bridge/scanner-interfaces@1.0.0

## 1.0.6

### Patch Changes

- Update dependencies
  - @rosen-bridge/rosen-extractor@12.0.2

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
