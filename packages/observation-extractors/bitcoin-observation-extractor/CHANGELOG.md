# @rosen-bridge/bitcoin-observation-extractor

## 7.0.4

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.4
  - @rosen-bridge/bitcoin-scanner@1.0.3

## 7.0.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.3
  - @rosen-bridge/bitcoin-scanner@1.0.2
  - @rosen-bridge/rosen-extractor@11.3.0

## 7.0.2

### Patch Changes

- Update dependencies:
  - @rosen-bridge/rosen-extractor@11.2.2
  - @rosen-bridge/tokens@6.0.0
  - @rosen-bridge/abstract-observation-extractor@1.0.2

## 7.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.1
  - @rosen-bridge/bitcoin-scanner@1.0.1
  - @rosen-bridge/rosen-extractor@11.2.1
  - @rosen-bridge/tokens@5.0.1

## 7.0.0

### Major Changes

- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/abstract-observation-extractor@1.0.0
  - @rosen-bridge/bitcoin-scanner@1.0.0
  - @rosen-bridge/rosen-extractor@11.2.0
  - @rosen-bridge/tokens@5.0.0

## 6.4.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.3
  - @rosen-bridge/bitcoin-scanner@0.2.3
  - @rosen-bridge/rosen-extractor@11.1.1

## 6.4.0

### Minor Changes

- Add `storeRawData` option to store observations raw-data into the database

### Patch Changes

- Update Dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.2
  - @rosen-bridge/rosen-extractor@11.1.0

## 6.3.1

### Patch Changes

- Update Dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.1
  - @rosen-bridge/bitcoin-scanner@0.2.2
  - @rosen-bridge/rosen-extractor@11.0.0

## 6.3.0

### Minor Changes

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
  - @rosen-bridge/bitcoin-scanner@0.2.1

## 6.2.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.1.2
  - @rosen-bridge/bitcoin-scanner@0.2.0
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/tokens@4.0.0
  - @rosen-bridge/rosen-extractor@10.0.0
  - @rosen-bridge/abstract-logger@3.0.0

## 6.2.1

### Patch Changes

- Update @rosen-bridge/rosen-extractor version to 9.0.0
- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.1.1

## 6.2.0

### Minor Changes

- Upgrade to Node.js version 22.18.0

### Patch Changes

- Rename observation-extractor package to abstract-observation-extractor

## 6.1.6

### Patch Changes

- Update package license to MIT
- Update dependencies
  - @rosen-bridge/bitcoin-esplora-scanner@3.0.1
  - @rosen-bridge/bitcoin-rpc-scanner@3.0.1
  - @rosen-bridge/observation-extractor@7.1.4

## 6.1.5

### Patch Changes

- Update dependencies
  - @rosen-bridge/observation-extractor@7.1.3

## 6.1.4

### Patch Changes

- Update network clients and ethers and rateLimitedAxios packages
- Update dependencies
  - @rosen-bridge/rosen-extractor@7.3.3
  - @rosen-bridge/bitcoin-esplora-scanner@3.0.0
  - @rosen-bridge/bitcoin-rpc-scanner@3.0.0
  - @rosen-bridge/observation-extractor@7.1.2

## 6.1.3

### Patch Changes

- Use rate limiting methods using @rosen-bridge/rate-limited-axios to prevent overwhelming the endpoints
- Updated dependencies
  - @rosen-bridge/rosen-extractor@7.3.0
  - @rosen-bridge/observation-extractor@7.1.1
  - @rosen-bridge/bitcoin-esplora-scanner@2.0.1
  - @rosen-bridge/bitcoin-rpc-scanner@2.0.1

## 6.1.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/bitcoin-esplora-scanner@2.0.0
  - @rosen-bridge/bitcoin-rpc-scanner@2.0.0

## 6.1.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/bitcoin-rpc-scanner@1.2.1
  - @rosen-bridge/bitcoin-esplora-scanner@1.2.1

## 6.1.0

### Minor Changes

- Unify and move shared interfaces and update all package dependencies

### Patch Changes

- Updated dependencies
  - @rosen-bridge/bitcoin-esplora-scanner@1.2.0
  - @rosen-bridge/bitcoin-rpc-scanner@1.2.0
  - @rosen-bridge/observation-extractor@7.1.0
  - @rosen-bridge/tokens@3.1.0
  - @rosen-bridge/rosen-extractor@7.2.2

## 6.0.0

### Major Changes

- Update tokens package to v3.0.0

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@7.0.0
  - @rosen-bridge/bitcoin-esplora-scanner@1.1.1
  - @rosen-bridge/bitcoin-rpc-scanner@1.1.1

## 5.0.0

### Major Changes

- Change RosenTokens to TokenMap

### Minor Changes

- Add Doge RPC and Esplora observation extractor

### Patch Changes

- Update node version to 20
- Updated dependencies
  - @rosen-bridge/bitcoin-rpc-scanner@1.1.0
  - @rosen-bridge/observation-extractor@6.0.0
  - @rosen-bridge/bitcoin-esplora-scanner@1.1.0

## 4.0.10

### Patch Changes

- Update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.10

## 4.0.9

### Patch Changes

- Update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.9

## 4.0.8

### Patch Changes

- Updated dependencies
  - @rosen-bridge/bitcoin-esplora-scanner@1.0.0
  - @rosen-bridge/bitcoin-rpc-scanner@1.0.0
  - @rosen-bridge/observation-extractor@5.0.8

## 4.0.7

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.7
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.14
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.8

## 4.0.6

### Patch Changes

- Verify destination address in observation extractor
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.6

## 4.0.5

### Patch Changes

- update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.5
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.13
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.7

## 4.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.4
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.12
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.6

## 4.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.3
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.11
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.5

## 4.0.2

### Patch Changes

- update rosen-extractor
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.2

## 4.0.1

### Patch Changes

- update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.1

## 4.0.0

### Major Changes

- consider decimals drop

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.0

## 3.0.5

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.9
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.10
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.4

## 3.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.8
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.9
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.3

## 3.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.7
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.8
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.2

## 3.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.6
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.7
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.1

## 3.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/bitcoin-rpc-scanner@0.2.0
  - @rosen-bridge/observation-extractor@4.4.5
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.6

## 3.0.0

### Major Changes

- update rosen-extractor version (change fromAddress to first input box ID)

### Patch Changes

- Update rosen extractor version
- Updated dependencies
- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.4
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.5
  - @rosen-bridge/bitcoin-rpc-scanner@0.1.1

## 1.0.3

### Patch Changes

- @rosen-bridge/observation-extractor@4.4.3
- @rosen-bridge/bitcoin-esplora-scanner@0.1.4

## 1.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.2
  - @rosen-bridge/bitcoin-esplora-scanner@0.1.3

## 1.0.1

### Patch Changes

- Update typeorm version
- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.1
  - @rosen-bridge/rosen-extractor@4.1.1

## 1.0.0

### Major Changes

- self initialize the rosen extractor

### Minor Changes

- updated @rosen-bridge/rosen-extractor version dependency to ^4.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.0
