# minfee-box-extractor

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

Minimum fee box extractor. It tracks boxes sent to a specific address whose
first token is a specific NFT and which carry all of the additional
registers R4-R9. Boxes missing any of R4-R9 are ignored. It stores the box's
second token (if any) and R4-R9 (as raw serialized strings) alongside the
standard box fields (id, block, height, identifier, serialized, spend info).

## Installation

npm:

```sh
npm i minfee-box-extractor
```

## Usage

Instantiate the extractor and register it on your Ergo scanner:

```javascript
const minFeeBoxExtractor = new MinFeeBoxExtractor(
  dataSource,
  <node_or_explorer_url>,
  <network_type>,
  <address>,
  <nft_token_id>,
  new ConsoleLogger(), // you can use any logger from @rosen-bridge/logger
  true
)
scanner.registerExtractor(minFeeBoxExtractor)
```
