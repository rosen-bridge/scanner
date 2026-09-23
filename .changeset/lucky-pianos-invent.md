---
'@rosen-bridge/handshake-scanner': patch
---

Raise failed RPC calls in the Handshake scanner network, which hsd reports with HTTP 200 and an `error` object in the body rather than with an error status.
