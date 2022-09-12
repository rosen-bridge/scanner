# Address Extractor


### Table of Contents
- [Description](#description)  
- [Related Projects](#related-projects)
- [How to Use the Address Extractor](#how-to-use-the-address-extractor)
    - [Install](#install)
    - [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<a name="headers"/>

## Description
Data extractors are modules that are integrated within a scanner. They drive the required information from the scanned blocks and store them in their own database. The address extractor is the simplest data extractor that tracks a specific address and stores all boxes belonging to that address. Furthermore, this extractor also can track a list of specific assets within the required address boxes. Currently, the address extractor can only be used to track the ergo addresses.


## Related Projects
This module is used within the [Scanner](https://github.com/rosen-bridge/scanner) project. The address scanner is currently used in the [Watcher](https://github.com/rosen-bridge/watcher) service to drive the watcher fee boxes and WID box (The watcher box with a specific WID token that is used for watcher authentication).
 
## How to Use the Address Extractor
### Install
This project is written in node-js using Esnext module and typeorm database. Extractors are not standalone projects and should be used as scanner modules. You can easily install it using npm with the command:

```shell
npm install @rosen-bridge/address-extractor
```

Alternatively, you can build and use it manually by cloning the project and running:
```shell
npm install
npm run build
```

### Usage
At the first step, you need to create a scanner instance; follow the steps [here](https://github.com/rosen-bridge/scanner) to create a running instance of scanner. Then you need to instantiate your address extractor and register it to your scanner:
```javascript
const addressExtractor = new ErgoUTXOExtractor(
    dataSource, 
    <extractor_name>, 
    <network_type>,
    <address>,
    OPTIONAL<Array<asset_id>>
)
scanner.registerExtractor(addressExtractor)
```

## Contributing
TBD

## License
TBD

