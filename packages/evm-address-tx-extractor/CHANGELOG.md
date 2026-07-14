# @rosen-bridge/evm-address-tx-extractor

## 3.0.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.3
  - @rosen-bridge/abstract-scanner@2.0.3

## 3.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.2
  - @rosen-bridge/abstract-scanner@2.0.2

## 3.0.0

### Major Changes

- **Add Nonce-Based Range Validation**: Added the `hasEventInHeightRange` method to `EvmTxExtractor` to determine if an address may have transactions within a specified block range by comparing stored nonce values with network nonce data.
  - Added `checkNonceAtToHeight` option to the constructor, allowing the extractor to fetch nonce at the specified `toHeight` before falling back to the latest nonce (useful for archive nodes).
  - Added RPC URL and optional auth token to the constructor so the extractor can directly fetch nonce data from the network via ethers `JsonRpcProvider`.

### Patch Changes

- Add dependency
  - @rosen-bridge/abstract-scanner@2.0.1
- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.1

## 2.0.5

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.2.0
  - @rosen-bridge/scanner-interfaces@1.0.0

## 2.0.4

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.2
  - @rosen-bridge/extended-typeorm@1.1.0

## 2.0.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.1

## 2.0.2

### Patch Changes

- Fix typo in logs descriptions
- Update dependencies
  - @rosen-bridge/abstract-extractor@3.1.0

## 2.0.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@3.0.1
  - @rosen-bridge/scanner-interfaces@0.2.2
  - ethers@6.16.0

## 2.0.0

### Major Changes

- Update AbstractExtractor interface; use `BlockInfo` in `processTransactions` and rename `initializeBoxes` to `initializeData`

### Minor Changes

- Update AbstractExtractor interface; add `createUsedBlocksQuery` method that returns the query for used blocks

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/abstract-extractor@3.0.0

## 1.2.3

### Patch Changes

- Update Dependencies
  - @rosen-bridge/rosen-extractor@11.0.0

## 1.2.2

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

## 1.2.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@2.1.1
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/abstract-logger@3.0.0

## 1.2.0

### Minor Changes

- Upgrade to Node.js version 22.18.0

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-extractor@2.1.0
  - @rosen-bridge/scanner-interfaces@0.2.0

## 1.1.4

### Patch Changes

- Update package license to MIT
- Update dependencies
  - @rosen-bridge/abstract-extractor@2.0.3
  - @rosen-bridge/scanner-interfaces@0.1.1

## 1.1.3

### Patch Changes

- Downgrade ethers version

## 1.1.2

### Patch Changes

- Update network clients and ethers and rateLimitedAxios packages
- Update dependencies
  - @rosen-bridge/abstract-extractor@2.0.2

## 1.1.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.1

## 1.1.0

### Minor Changes

- Unify and move shared interfaces and update all package dependencies

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@2.0.0

## 1.0.8

### Patch Changes

- Improve extraction speed by applying the checks on response and transform only the desired transactions
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.2

## 1.0.7

### Patch Changes

- Update node version to 20
- Update logger package
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.1
  - @rosen-bridge/scanner@5.0.2

## 1.0.6

### Patch Changes

- Prevent redundant store function calls
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.0
  - @rosen-bridge/scanner@5.0.1

## 1.0.5

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@5.0.0
  - @rosen-bridge/abstract-extractor@0.3.1

## 1.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@4.1.3

## 1.0.3

### Patch Changes

- fix address comparision (uses lower case address while comparing)
- change log levels to debug
- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.3.0
  - @rosen-bridge/scanner@4.1.2

## 1.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@4.1.1

## 1.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.2.0
  - @rosen-bridge/scanner@4.1.0

## 1.0.0

### Major Changes

- change transaction type to TransactionResponse
- add status to AddressTxsEntity which represents if the transaction succeeded or failed

## 0.1.8

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.5
  - @rosen-bridge/scanner@4.0.5

## 0.1.7

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.4
  - @rosen-bridge/scanner@4.0.4

## 0.1.6

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.3
  - @rosen-bridge/scanner@4.0.3

## 0.1.5

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.2
  - @rosen-bridge/scanner@4.0.2

## 0.1.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.1
  - @rosen-bridge/scanner@4.0.1

## 0.1.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@4.0.0

## 0.1.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@3.2.9

## 0.1.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@3.2.8
