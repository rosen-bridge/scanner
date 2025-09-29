# @rosen-bridge/bitcoin-runes-observation-extractor

## 0.2.0

### Minor Changes

- Use @rosen-clients/rate-limited-axios instead of @rosen-bridge/rate-limited-axios

### Patch Changes

- Handle Unisat indexed height (it throws error if the given block is not indexed by Unisat yet)
- Change unisatApiKey header to Authorization and Bearer
- Update dependencies
  - @rosen-bridge/scanner-interfaces@0.2.0
  - @rosen-bridge/abstract-observation-extractor@0.1.2
  - @rosen-bridge/bitcoin-scanner@0.2.0
  - @rosen-bridge/extended-typeorm@1.0.0
  - @rosen-bridge/tokens@4.0.0
  - @rosen-bridge/rosen-extractor@10.0.0
  - @rosen-bridge/json-bigint@1.0.0
  - @rosen-bridge/abstract-logger@3.0.0

## 0.1.1

### Patch Changes

- Fix getTxOutputRunes incorrect output array
- Remove eslint and prettier related dependencies
- Update vitest.config and tsconfig files to match the kodegen template
- Update dependencies
  - @rosen-bridge/abstract-observation-extractor@0.1.1

## 0.1.0

- The package has been **renamed** from `@rosen-bridge/runes-observation-extractor`.
  You can track the previous history in the changelog of the old package. The latest update is available [here](https://github.com/rosen-bridge/scanner/blob/415b6caac5fbb065fb7cee5e517894ace67c9f81/packages/observation-extractors/runes-observation-extractor/CHANGELOG.md).
