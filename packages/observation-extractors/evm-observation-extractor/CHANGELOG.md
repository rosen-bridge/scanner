# @rosen-bridge/evm-observation-extractor

## 7.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.6
  - @rosen-bridge/rosen-extractor@12.0.2

## 7.0.0

### Major Changes

- Any service that uses this packages requires to initialize the `AddressManager`, provided by `@rosen-bridge/address-manager`, so the Rosen extractor becomes functional

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.5
  - @rosen-bridge/extended-typeorm@1.1.0
  - @rosen-bridge/rosen-extractor@12.0.1
  - @rosen-bridge/tokens@6.0.1

## 6.0.4

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.4

## 6.0.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.3
  - @rosen-bridge/rosen-extractor@11.3.0

## 6.0.2

### Patch Changes

- Update dependencies:
  - @rosen-bridge/rosen-extractor@11.2.2
  - @rosen-bridge/tokens@6.0.0
  - @rosen-bridge/abstract-observation-extractor@1.0.2

## 6.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@1.0.1
  - @rosen-bridge/rosen-extractor@11.2.1
  - @rosen-bridge/scanner-interfaces@0.2.2
  - @rosen-bridge/tokens@5.0.1
  - ethers@6.16.0

## 6.0.0

### Major Changes

- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/abstract-observation-extractor@1.0.0
  - @rosen-bridge/rosen-extractor@11.2.0
  - @rosen-bridge/tokens@5.0.0

## 5.4.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.3
  - @rosen-bridge/rosen-extractor@11.1.1

## 5.4.0

### Minor Changes

- Add `storeRawData` option to store observations raw-data into the database

### Patch Changes

- Update Dependencies
  - @rosen-bridge/rosen-extractor@11.1.0
  - @rosen-bridge/abstract-observation-extractor@0.2.2

## 5.3.1

### Patch Changes

- Update Dependencies
  - @rosen-bridge/abstract-observation-extractor@0.2.1
  - @rosen-bridge/rosen-extractor@11.0.0

## 5.3.0

### Minor Changes

- Add rawData to the return data of the extractor's `processTransactions` method

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
  - @rosen-bridge/scanner-interfaces@0.2.1

## 5.2.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.1.2
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/tokens@4.0.0
  - @rosen-bridge/rosen-extractor@10.0.0
  - @rosen-bridge/abstract-logger@3.0.0

## 5.2.1

### Patch Changes

- Update @rosen-bridge/rosen-extractor version to 9.0.0
- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.1.1

## 5.2.0

### Minor Changes

- Upgrade to Node.js version 22.18.0

### Patch Changes

- Rename observation-extractor package to abstract-observation-extractor
- Update dependencies
  - @rosen-bridge/scanner-interfaces@0.2.0

## 5.1.6

### Patch Changes

- Update package license to MIT
- Update dependencies
  - @rosen-bridge/observation-extractor@7.1.4
  - @rosen-bridge/scanner-interfaces@0.1.1

## 5.1.5

### Patch Changes

- Downgrade ethers version
- Update dependencies
  - @rosen-bridge/evm-rpc-scanner@4.0.1
  - @rosen-bridge/observation-extractor@7.1.3

## 5.1.4

### Patch Changes

- Update network clients and ethers and rateLimitedAxios packages
- Update dependencies
  - @rosen-bridge/rosen-extractor@7.3.3
  - @rosen-bridge/evm-rpc-scanner@4.0.0
  - @rosen-bridge/observation-extractor@7.1.2

## 5.1.3

### Patch Changes

- Use rate limiting methods using @rosen-bridge/rate-limited-axios to prevent overwhelming the endpoints
- Updated dependencies
  - @rosen-bridge/rosen-extractor@7.3.0
  - @rosen-bridge/observation-extractor@7.1.1
  - @rosen-bridge/evm-rpc-scanner@3.0.1

## 5.1.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/evm-rpc-scanner@3.0.0

## 5.1.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/evm-rpc-scanner@2.1.1

## 5.1.0

### Minor Changes

- Unify and move shared interfaces and update all package dependencies

### Patch Changes

- Updated dependencies
  - @rosen-bridge/evm-rpc-scanner@2.1.0
  - @rosen-bridge/observation-extractor@7.1.0
  - @rosen-bridge/tokens@3.1.0
  - @rosen-bridge/rosen-extractor@7.2.2

## 5.0.0

### Major Changes

- Update tokens package to v3.0.0

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@7.0.0
  - @rosen-bridge/evm-rpc-scanner@2.0.3

## 4.0.0

### Major Changes

- Change RosenTokens to TokenMap

### Patch Changes

- Update node version to 20
- Updated dependencies
  - @rosen-bridge/observation-extractor@6.0.0
  - @rosen-bridge/evm-rpc-scanner@2.0.2

## 3.1.2

### Patch Changes

- Update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.10

## 3.1.1

### Patch Changes

- Update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.9

## 3.1.0

### Minor Changes

- Add Binance RPC observation extractor

### Patch Changes

- Updated dependencies
  - @rosen-bridge/evm-rpc-scanner@2.0.0
  - @rosen-bridge/observation-extractor@5.0.8

## 3.0.5

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.7
  - @rosen-bridge/evm-rpc-scanner@1.0.4

## 3.0.4

### Patch Changes

- Verify destination address in observation extractor
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.6

## 3.0.3

### Patch Changes

- update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.5
  - @rosen-bridge/evm-rpc-scanner@1.0.3

## 3.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.4
  - @rosen-bridge/evm-rpc-scanner@1.0.2

## 3.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.3
  - @rosen-bridge/evm-rpc-scanner@1.0.1

## 3.0.0

### Major Changes

- change transaction type to TransactionResponse
- check lock transaction status (success or failure) before storing observation

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.2
  - @rosen-bridge/evm-rpc-scanner@1.0.0

## 2.0.1

### Patch Changes

- update rosen-extractor version
- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.1

## 2.0.0

### Major Changes

- consider decimals drop

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@5.0.0

## 1.0.9

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.9
  - @rosen-bridge/evm-rpc-scanner@0.2.9

## 1.0.8

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.8
  - @rosen-bridge/evm-rpc-scanner@0.2.8

## 1.0.7

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.7
  - @rosen-bridge/evm-rpc-scanner@0.2.7

## 1.0.6

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.6
  - @rosen-bridge/evm-rpc-scanner@0.2.6

## 1.0.5

### Patch Changes

- @rosen-bridge/observation-extractor@4.4.5
- @rosen-bridge/evm-rpc-scanner@0.2.5

## 1.0.4

### Patch Changes

- update rosen-extractor version
- Updated dependencies
- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.4
  - @rosen-bridge/evm-rpc-scanner@0.2.4

## 1.0.3

### Patch Changes

- @rosen-bridge/observation-extractor@4.4.3
- @rosen-bridge/evm-rpc-scanner@0.2.3

## 1.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.2
  - @rosen-bridge/evm-rpc-scanner@0.2.2

## 1.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.1
  - @rosen-bridge/rosen-extractor@4.1.1

## 1.0.0

### Major Changes

- changed to Transaction from TransactionResponse

### Minor Changes

- updated @rosen-bridge/rosen-extractor version dependency to ^4.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/observation-extractor@4.4.0
