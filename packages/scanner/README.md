# Scanner

### Table of Contents

- [Description](#description)
- [Related Projects](#related-projects)
- [How to Use the Scanner](#how-to-use-the-scanner)
  - [Install](#install)
  - [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
  <a name="headers"/>

## Description

Scanner is a bridge component responsible for observing and tracking the latest blocks in a target networks.

The goal of this project is to create an infrastructure for other projects. Bridge services, like watcher and guard, use this component to track the needed information. Moreover, this library can be utilized in other projects rather than bridge-related services to make them independent of the ergo explorer. It would help the network to be as decentralized as possible.

While the scanner itself only tracks the latest target network blocks, you can register a data extractor to the scanner to save your required data. In Rosen bridge, we use 4 different extractors on top of the scanner to extract bridge information. Check out these extractors [here](https://github.com/orgs/rosen-bridge/repositories).

## Related Projects

As mentioned above, data extractors can be added to the scanner to extract and store all required information. Finally, these components are used in the [Watcher](https://github.com/rosen-bridge/watcher) and [Guard](https://github.com/rosen-bridge/ts-guard-service) services.

## How to Use the Scanner

### Install

This project is written in node-js using Esnext module and typeorm database. Since the scanner is a core service, it's not designed to be used independently. However, you can easily install and use this library in your projects by running:

```shell
npm i @rosen-bridge/scanner
```

Additionally, it is possible to build this project manually as well. In order to build the project, clone the scanner repo and follow these steps:

```shell
npm install
npm run build
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

Registering data extractor:

```javascript
const dataExtractor = new DataExtractor(dataSource, <PARAMETERS>)
scanner.registerExtractor(dataExtractor)
```

## Contributing

TBD

## License

TBD
