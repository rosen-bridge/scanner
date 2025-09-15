# @rosen-bridge/cardano-scanner

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)

## Introduction

A Cardano blockchain scanner based on blackfrost , koios and ogmios API.

## Installation

npm:

```sh
npm i @rosen-bridge/cardano-scanner
```

yarn:

```sh
yarn add @rosen-bridge/cardano-scanner
```

### Usage

Cardano Scanner:

```javascript
const cardanoScannerConfig = {
    koiosUrl: <koios_url>,
    timeout: <api_timeout>,
    initialHeight: <cardano_initial_height>,
    dataSource: dataSource,
}
cardanoScanner = new CardanoKoiosScanner(cardanoScannerConfig)
```
