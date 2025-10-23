# box-tracker

.

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)

## Introduction

Tracking specific Ergo boxes where only one instance should exist at any time.
Includes an in-memory Extractor to filter and hold recent data without a database.
Added MempoolTracker for handling unconfirmed transactions and ensuring the latest unspent box is tracked.
Added optional TxPotTracker for monitoring the local mempool

## Installation

npm:

```sh
npm i  @rosen-bridge/box-tracker
```

yarn:

```sh
yarn add  @rosen-bridge/box-tracker
```
