# @rosen-bridge/address-extractor

## 6.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.2

## 6.0.1

### Patch Changes

- Update node version to 20
- Update logger package
- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.1

## 6.0.0

### Major Changes

- Update database entity and action to extend the abstract class

### Minor Changes

- Update db action interface to support callbacks

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@1.0.0

## 5.0.8

### Patch Changes

- Remove unnecessary properties from abstract extracted data type
- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.3.1

## 5.0.7

### Patch Changes

- Change processTransaction Block interface to use minimal information
- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.3.0

## 5.0.6

### Patch Changes

- Remove redundant `getTxBlock` function
- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.2.0

## 5.0.5

### Patch Changes

- fix storing duplicate boxes
- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.5

## 5.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.4

## 5.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.3

## 5.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.2

## 5.0.1

### Patch Changes

- Fix ErgoNetworkType import

## 5.0.0

### Major Changes

- Use abstract initializable extractor and update initilialization procedure to support both node and expolorer APIs

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-extractor@0.1.1

## 4.0.0

### Major Changes

- Updated the InitializeBoxes interface to include the block hash. Previously, only block height was used as initialization point.

### Patch Changes

- Update abstract extractor interface
- Updated dependencies
  - @rosen-bridge/scanner@4.0.0

## 3.3.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@3.2.9

## 3.3.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/scanner@3.2.8

## 3.3.1

### Patch Changes

- Update typeorm version
- Updated dependencies
  - @rosen-bridge/scanner@3.2.7

## 3.3.0

### Minor Changes

- Ignore old spent boxes validation in address extractor initialization
