# @rosen-bridge/ergo-scanner

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)

## Introduction

A ergo blockchain scanner based on Node or Explorer API

## Installation

npm:

```sh
npm i @rosen-bridge/ergo-scanner
```

yarn:

```sh
yarn add @rosen-bridge/ergo-scanner
```

### Usage

Ergo Scanner:

```javascript
const ergoScannerConfig = {
    nodeUrl: <node_url>,
    timeout: <node_timeout>,
    initialHeight: <ergo_initial_height>,
    dataSource: dataSource,
}
scanner = new ErgoScanner(ergoScannerConfig);
```
