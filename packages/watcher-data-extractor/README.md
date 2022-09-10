# Watcher Data Extractor


### Table of Contents
- [Description](#description)  
- [Related Projects](#related-projects)
- [How to Use the Watcher Data Extractor](#how-to-use-the-watcher-data-extractor)
    - [Install](#install)
    - [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<a name="headers"/>

## Description
Data extractors are modules that are integrated within a scanner. They drive the required information from the scanned blocks and store them in their own database. The watcher data extractor is responsible for tracking all watcher-related data in the network. These data includes permit, commitment and event trigger boxes; all these boxes are created in the network by the watchers. The watchers use their permits to create new commitments, and need to track created commitments and triggers to continue their procedures. On the other side, guards need to track event trigger boxes to verify the related user payment and start an agreement on the exchange transaction.
 
 
## Related Projects
This module is used within the [Scanner](https://github.com/rosen-bridge/scanner) project. As stated above, this module is used in the [Watcher](https://github.com/rosen-bridge/watcher) service to drive the related boxes. It also used in the [Guard](https://github.com/rosen-bridge/watcher) to track the created event triggers.


## How to Use the Watcher Data Extractor
### Install
This project is written in node-js using Esnext module and typeorm database. Extractors are not standalone projects and should be used as scanner modules. You can easily install it using npm with the command:
 
```shell
npm install @rosen-bridge/watcher-data-extractor
```
 
Alternatively, you can build and use it manually by cloning the project and running:
```shell
npm install
npm run build
```
 
### Usage
In the first step, you need to create a scanner instance; follow the steps [here](https://github.com/rosen-bridge/scanner) to create a running instance of the scanner. Then, you need to instantiate your desired extractors and register them to your ergo scanner:
```javascript
const commitmentExtractor = new CommitmentExtractor(
    <extractor_name>, 
    <Array<commitment_address>>,
    <rwt_id>,
    dataSource
)
const permitExtractor = new PermitExtractor(
    <extractor_name>, 
    dataSource, 
    <permit_address>, 
    <rwt_id>
)
const eventTriggerExtractor = new EventTriggerExtractor(
    <extractor_name>, 
    dataSource, 
    <event_trigger_address>, 
    <rwt_id>
)
ergoScanner.registerExtractor(commitmentExtractor)
ergoScanner.registerExtractor(permitExtractor)
ergoScanner.registerExtractor(eventTriggerExtractor)
```

## Contributing
TBD

## License
TBD
