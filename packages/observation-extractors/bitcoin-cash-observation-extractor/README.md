# Bitcoin Cash observation extractor

`BitcoinCashRpcObservationExtractor` consumes the transaction type exported by
`@rosen-bridge/bitcoin-cash-scanner`. It joins the native BCH Rosen extractor
with shared observation processing and persistence, using the distinct
`bitcoin-cash-rpc-extractor` identity.

The adapter preserves raw-data suppression and canonical transaction IDs.
Only native BCH deposits with a token-free treasury output are admitted.
Tests use real parsing, address codecs and TokenMap with mocked storage.

This BCH-only adapter imports the dedicated
`@rosen-bridge/rosen-extractor/dist/bitcoinCash.js` entry. The generic extractor
root no longer exports BCH classes. A multi-chain service must load this
observation package only on its BCH configuration branch: importing it eagerly
also imports the BCH transaction decoder and its cryptographic runtime.
