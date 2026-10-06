---
'@rosen-bridge/bitcoin-runes-observation-extractor': major
'@rosen-bridge/handshake-observation-extractor': major
'@rosen-bridge/bitcoin-observation-extractor': major
'@rosen-bridge/cardano-observation-extractor': major
'@rosen-bridge/evm-observation-extractor': major
'@rosen-bridge/abstract-observation-extractor': major
---

Rename and standardize observation extractor ids to `<chain>-observation-extractor` and add a migration to rename the stored ids in `observation_entity` and `extractor_status_entity`:

- `bitcoin-esplora-extractor`, `bitcoin-rpc-extractor` → `bitcoin-observation-extractor`
- `doge-esplora-extractor`, `doge-rpc-extractor` → `doge-observation-extractor`
- `bitcoin-runes-esplora-extractor`, `bitcoin-runes-rpc-extractor` → `bitcoin-runes-observation-extractor`
- `cardano-blockfrost-extractor`, `cardano-koios-extractor`, `cardano-ogmios-extractor` → `cardano-observation-extractor`
- `ethereum-rpc-extractor` → `ethereum-observation-extractor`
- `binance-rpc-extractor` → `binance-observation-extractor`
- `handshake-rpc-extractor` → `handshake-observation-extractor`
