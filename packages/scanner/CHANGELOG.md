# @rosen-bridge/scanner

## 7.1.0

### Minor Changes

- Added latest block height caching in GeneralScanner with a public accessor method

### Patch Changes

- Use rate limiting methods using @rosen-bridge/rate-limited-axios to prevent overwhelming the endpoints
- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.1

## 7.0.0

### Major Changes

- Update scanner to delegate the network connection creation to the user. User can instantiate multiple network connectors and use a selection strategy via NetworkConnectorManager

## 6.1.0

### Minor Changes

- Add delay time between processing of blocks

## 6.0.0

### Major Changes

- Unify and move shared interfaces and update all package dependencies

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.0

## 5.1.0

### Minor Changes

- Update koios scanner to use the new serialized APIs

### Patch Changes

- Add input box extension to network api interfaces
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.2

## 5.0.2

### Patch Changes

- Update node version to 20
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.1

## 5.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.0

## 5.0.0

### Major Changes

- Add ogmios connection retrial with exponential backoff policy
- Use protected methods for scanner subclasses
- Use protected methods for inner functionalities in abstract scanner

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.3.1

## 4.1.3

### Patch Changes

- Update ogmios client and schema.

## 4.1.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.3.0

## 4.1.1

### Patch Changes

- fix postgres migration

## 4.1.0

### Minor Changes

- Add ogmios connection close handler
- remove hash and parentHash length constraint in BlockEntity

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.2.0

## 4.0.5

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.5

## 4.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.4

## 4.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.3

## 4.0.2

### Patch Changes

- Fix initialization height of extractors
- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.2

## 4.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.1

## 4.0.0

### Major Changes

- Updated the InitializeBoxes interface to include the block hash. Previously, only block height was used as initialization point.

- Move abstract extractor interface to the extractor package

### Minor Changes

- Add extractor status table to store registered extractors information and not run all extractor initializations everytime.

### Patch Changes

- Update ogmios client version

## 3.2.9

### Patch Changes

- Update ogmios client and schema

## 3.2.8

### Patch Changes

- Update axios to latest

## 3.2.7

### Patch Changes

- Update typeorm version
