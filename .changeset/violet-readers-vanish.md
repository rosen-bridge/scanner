---
'@rosen-bridge/evm-address-tx-extractor': major
---

- **Add Nonce-Based Range Validation**: Added the `hasEventInHeightRange` method to `EvmTxExtractor` to determine if an address may have transactions within a specified block range by comparing stored nonce values with network nonce data.
  - Added `checkNonceAtToHeight` option to the constructor, allowing the extractor to fetch nonce at the specified `toHeight` before falling back to the latest nonce (useful for archive nodes).
  - Added RPC URL and optional auth token to the constructor so the extractor can directly fetch nonce data from the network via ethers `JsonRpcProvider`.
