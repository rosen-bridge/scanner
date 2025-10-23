# Abstract Observation Extractor

.

### Table of Contents

- [Description](#description)
- [Related Projects](#related-projects)
- [How to Use the Observation Extractor](#how-to-use-the-observation-extractor)
  - [Install](#install)
  - [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<a name="headers"/>

## Description

Data extractors are modules that are integrated within a scanner. They drive the required information from the scanned blocks and store them in their own database. The observation extractor is designed to fulfill a watcher's main task: observing user payments in source networks. The bridge payment transaction has its own structure, and the observation extractor searches for this pattern occurrence in source chains and stores all needed information for a watcher commitment creation and revealment.

## Related Projects

This module is used within the [Scanner](https://github.com/rosen-bridge/scanner) project. The address scanner is currently used in the [Watcher](https://github.com/rosen-bridge/watcher) service to drive the valid source chain observations.

## How to Use the Observation Extractor

### Install

This project is written in node-js using Esnext module and typeorm database. Extractors are not standalone projects and should be used as scanner modules. You can easily install it using npm with the command:

```shell
npm install @rosen-bridge/abstract-observation-extractor
```

Alternatively, you can build and use it manually by cloning the project and running:

```shell
npm install
npm run build
```

### Usage

## Contributing

TBD

## License

TBD
