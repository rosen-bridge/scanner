---
'@rosen-bridge/evm-address-tx-extractor': major
---

- **Implement Fast-Forward via `hasEventInHeightRange`**: Added the `hasEventInHeightRange` method to `EvmTxExtractor`, enabling the scanner's fast-forward feature. This allows the extractor to efficiently skip blocks without relevant transactions by comparing address nonce values.
  - Added `checkNonceAtToHeight` option to constructor, allowing the extractor to check nonce at `toHeight` before falling back to latest nonce (useful for archive nodes).
  - Added RPC URL and optional auth token to constructor so the extractor can directly fetch nonce data from the network.
