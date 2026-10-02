# Bitcoin Cash scanner

`BitcoinCashRpcNetwork` connects to BCHN RPC and rechecks the configured chain
and daemon identity on each call. It validates block references and exact raw
transaction bytes, retains CashToken metadata and bounds transaction, response
and aggregate block work. Missing raw bytes use block-qualified lookups.

`BitcoinCashRpcScanner` uses the shared general scanner under the distinct
`bitcoin-cash` identity. Configure an explicit `main`, `test` or `regtest`
network and independent operator endpoints. Unit tests mock the HTTP client.
