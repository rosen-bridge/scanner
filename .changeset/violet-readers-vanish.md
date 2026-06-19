---
'@rosen-bridge/evm-address-tx-extractor': major
---

# @rosen-bridge/evm-address-tx-extractor

## 3.0.0

### Major Changes

- **Implement Fast-Forward via `hasEventInHeightRange`**: Added the `hasEventInHeightRange` method to `EvmTxExtractor`, enabling the scanner's fast-forward feature. This allows the extractor to efficiently skip blocks without relevant transactions by comparing address nonce values.
- **Add Nonce-Based Event Detection**: The extractor now fetches the current network nonce and compares it with the last recorded nonce from the database (`lastDbNonce + 1`). A difference indicates new transactions in the block range, optimizing scanning performance.
- **Add `checkNonceAtToHeight` Option**: Introduced a new option to allow checking the nonce at the `toHeight` before falling back to the latest nonce, providing flexibility for archive nodes.
- **Add RPC Provider Integration**: The extractor now accepts an RPC URL and optional auth token to directly fetch nonce data from the network.
- **Add Database Helper `getLastNonceBeforeHeight`**: Added a new method in `TxAction` to retrieve the highest nonce for a specific address and extractor before a given block height.
- **Update Dependencies**: Added `@rosen-bridge/abstract-scanner` as a dependency to align with the fast-forward feature changes in the abstract scanner.
