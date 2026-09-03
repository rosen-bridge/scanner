# @rosen-bridge/watcher-data-extractor

## 14.0.0

### Major Changes

- Refactor the PermitExtractor to inherit from `AbstractBoxExtractor` and implement an initialize option to support flexible setup

## 13.0.10

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.3

## 13.0.9

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.2
  - @rosen-bridge/tokens@6.0.2
  - @rosen-clients/ergo-explorer@2.1.3

## 13.0.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.1

## 13.0.7

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.0
  - @rosen-bridge/scanner-interfaces@1.0.0

## 13.0.6

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.2
  - @rosen-bridge/extended-typeorm@1.1.0
  - @rosen-bridge/tokens@6.0.1

## 13.0.5

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.1
  - @rosen-clients/ergo-explorer@2.1.2

## 13.0.4

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.0

## 13.0.3

### Patch Changes

- Fix sqlite migration on `eventTriggerEntity` table

## 13.0.2

### Patch Changes

- Update dependencies:
  - @rosen-bridge/tokens@6.0.0

## 13.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.0.1
  - @rosen-bridge/scanner-interfaces@0.2.2
  - @rosen-bridge/tokens@5.0.1

## 13.0.0

### Major Changes

- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`
- Update abstract database entity to be general; rename `boxId` columnt to `identifier`
- Refactor collateral extractor to extend AbstractErgoBoxExtractor

### Minor Changes

- Update AbstractExtractor interface; add `createUsedBlocksQuery` method that returns the query for used blocks

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/abstract-extractor@3.0.0

## 12.3.0

### Minor Changes

- Fixed Sqlite migrations
- Fixed type definitions in entities based migrations

## 12.2.2

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

## 12.2.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@2.1.1
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/tokens@4.0.0
  - @rosen-bridge/json-bigint@1.0.0
  - @rosen-bridge/abstract-logger@3.0.0
  - @rosen-clients/ergo-explorer@2.0.0

## 12.2.0

### Minor Changes

- Upgrade to Node.js version 22.18.0

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@2.1.0
  - @rosen-bridge/scanner-interfaces@0.2.0

## 12.1.4

### Patch Changes

- Update package license to MIT
- Update dependencies
  - @rosen-bridge/abstract-extractor@2.0.3
  - @rosen-bridge/scanner-interfaces@0.1.1

## 12.1.3

### Patch Changes

- Update network clients and ethers and rateLimitedAxios packages
- Update dependencies
  - @rosen-bridge/abstract-extractor@2.0.2

## 12.1.2

### Patch Changes

- Use rate limiting methods using @rosen-bridge/rate-limited-axios to prevent overwhelming the endpoints
- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.1

## 12.1.1

### Patch Changes

- Fix event result extraction in EventTriggerExtractor
- Fix fraud result storage in database

## 12.1.0

### Minor Changes

- Unify and move shared interfaces and update all package dependencies
- Update extra information interfaces and extraction functions

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.0
  - @rosen-bridge/tokens@3.1.0
  - @rosen-bridge/rosen-extractor@7.2.2

## 12.0.0

### Major Changes

- Update tokens package to v3.0.0

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@5.1.0
  - @rosen-bridge/abstract-extractor@1.0.2

## 11.0.0

### Major Changes

- Update tokens package version to 2.0.0

## 10.0.1

### Patch Changes

- Update node version to 20
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.1
  - @rosen-bridge/scanner@5.0.2

## 10.0.0

### Major Changes

- Update database entity and action to extend the abstract class

### Minor Changes

- Update db action interface to support callbacks

### Patch Changes

- Optimize `hasData` function not to deserialize all unrelated boxes
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.0
  - @rosen-bridge/scanner@5.0.1

## 9.0.0

### Major Changes

- Refactor event trigger extractor to extend abstract initializable class

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@5.0.0
  - @rosen-bridge/abstract-extractor@0.3.1

## 8.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@4.1.3

## 8.0.1

### Patch Changes

- improve event result extractor to avoid unnecessary errors

## 8.0.0

### Major Changes

- change paymentTxId format in R4 from hex string to string

## 7.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.3.0
  - @rosen-bridge/scanner@4.1.2

## 7.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@4.1.1

## 7.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.2.0
  - @rosen-bridge/scanner@4.1.0

## 7.0.0

### Major Changes

- wrap rwtCount in CommitmentEntity
- add token map to commitmentExtractor constructor arguments

## 6.0.5

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.5
  - @rosen-bridge/scanner@4.0.5

## 6.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.4
  - @rosen-bridge/scanner@4.0.4

## 6.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.3
  - @rosen-bridge/scanner@4.0.3

## 6.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.2
  - @rosen-bridge/scanner@4.0.2

## 6.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.1
  - @rosen-bridge/scanner@4.0.1

## 6.0.0

### Major Changes

- Updated the InitializeBoxes interface to include the block hash. Previously, only block height was used as initialization point.

### Patch Changes

- Update abstract extractor interface
- Updated dependencies
  - @rosen-bridge/scanner@4.0.0

## 5.1.3

### Patch Changes

- Update Ergo explorer client
- Updated dependencies
  - @rosen-bridge/scanner@3.2.9

## 5.1.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@3.2.8

## 5.1.1

### Patch Changes

- Update typeorm version
- Updated dependencies
  - @rosen-bridge/scanner@3.2.7

## 5.1.0

### Minor Changes

- implemented CollateralExtractor to validate and store collateral boxes

### Patch Changes

- Fix spend height column in all entities

## 5.0.1

### Patch Changes

- fix WIDsHash calculation in migrations

## 5.0.0

### Major Changes

- update extractors according to latest version of contracts
