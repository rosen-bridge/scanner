---
'@rosen-bridge/bitcoin-cash-scanner': patch
---

Require HTTPS for remote RPC endpoints, reject URL credentials and redirects, and validate bounded request timeouts. Add configurable resource budgets with typed limit diagnostics and operator recovery at the unchanged block checkpoint.

Add an uncached BCHN finalization eligibility check for exact observed block ancestry, relevant parked forks and stable tip/finalization snapshots, with a shared 30-second request deadline.
