# minfee-box-extractor

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

Minimum fee box extractor. It tracks boxes sent to a specific address whose
first token is a specific NFT, and stores the box's second token (if any)
alongside the standard box fields (id, block, height, identifier, serialized,
spend info).

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
  <extractor_name>,
  <node_or_explorer_url>,
  <network_type>,
  <address>,
  <nft_token_id>,
)
scanner.registerExtractor(minFeeBoxExtractor)
```
