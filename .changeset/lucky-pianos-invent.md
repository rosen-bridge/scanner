---
'@rosen-bridge/handshake-scanner': patch
---

Raise failed RPC calls in the Handshake scanner network, which hsd reports with HTTP 200 and an `error` object in the body rather than with an error status. A failed call, such as the `getblockhash` a scanner at the chain tip routinely makes for a height the node does not have yet, was previously read as a successful one and surfaced as a type error on an empty result.
