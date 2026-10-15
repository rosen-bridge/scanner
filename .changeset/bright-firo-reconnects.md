---
'@rosen-bridge/firo-scanner': patch
---

Destroy the ElectrumX socket when the server.version handshake fails so a timed-out handshake no longer leaves the Firo scanner stuck until the server drops the idle session
