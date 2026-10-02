# Bitcoin Cash observation extractor

`BitcoinCashRpcObservationExtractor` consumes the transaction type exported by
`@rosen-bridge/bitcoin-cash-scanner`. It joins the native BCH Rosen extractor
with shared observation processing and persistence, using the distinct
`bitcoin-cash-rpc-extractor` identity.

The adapter preserves raw-data suppression and canonical transaction IDs.
Only native BCH deposits with a token-free treasury output are admitted.
Tests use real parsing, address codecs and TokenMap with mocked storage.
