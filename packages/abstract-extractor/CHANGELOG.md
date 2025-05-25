# @rosen-bridge/abstract-extractor

## 2.0.1

### Patch Changes

- Use rate limiting methods using @rosen-bridge/rate-limited-axios to prevent overwhelming the endpoints

## 2.0.0

### Major Changes

- Unify and move shared interfaces and update all package dependencies
- Update extra information interfaces and extraction functions

## 1.0.2

### Patch Changes

- Add input box extension to network api interfaces
- Refactor query logic in abstract ergo extractor actions

## 1.0.1

### Patch Changes

- Update node version to 20
- Update logger package

## 1.0.0

### Major Changes

- Move database action shared logic to abstract class
- Add callback support to abstract ergo extractor and update abstract db action interface

### Patch Changes

- Ensure initialization with the node is stateful and resilient to network issues
- Fix `processTransaction` to return false if data insertion encounters error
- Modify the initialization procedure to retry upon failure

## 0.3.1

### Patch Changes

- Remove unnecessary properties from abstract extracted data type
- Add extras field to store extra information for spending

## 0.3.0

### Minor Changes

- Add abstract extractor class that can be initialized using address transactions.

### Patch Changes

- Change processTransaction Block interface to use minimal information

## 0.2.0

### Minor Changes

- Add spendIndex to extracted data in initialization

## 0.1.5

### Patch Changes

- fix storing duplicate boxes

## 0.1.4

### Patch Changes

- prevent to store multiple boxes on initialize

## 0.1.3

### Patch Changes

- switch to using unspent boxes for initialization

## 0.1.2

### Patch Changes

- fix spend info extraction in initialize process

## 0.1.1

### Patch Changes

- Export constants and AbstractNetwork interface
