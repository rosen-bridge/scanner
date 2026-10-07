---
'@rosen-bridge/evm-scanner': patch
---

Fix the EVM RPC timeout being silently ignored: set it on the `FetchRequest` the `JsonRpcProvider` is constructed with instead of on the throwaway clone returned by `_getConnection()`, so the configured timeout actually applies to RPC calls.
