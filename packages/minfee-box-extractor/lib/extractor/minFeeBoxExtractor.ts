import { Buffer } from 'buffer';
import * as wasm from 'ergo-lib-wasm-nodejs';

import { AbstractErgoBoxExtractor } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBI from '@rosen-bridge/json-bigint';
import { ErgoNetworkType, OutputBox } from '@rosen-bridge/scanner-interfaces';

import { MinFeeBoxAction } from '../actions/minFeeBoxAction';
import { MinFeeBoxEntity } from '../entities/minFeeBoxEntity';
import { ExtractedMinFeeBox } from '../interfaces/extractedMinFeeBox';

export class MinFeeBoxExtractor extends AbstractErgoBoxExtractor<
  ExtractedMinFeeBox,
  MinFeeBoxEntity
> {
  protected readonly actions: MinFeeBoxAction;
  private readonly ergoTree: string;

  /**
   * Creates a MinFeeBoxExtractor.
   * Tracks boxes sent to `address` whose first token is `nft`.
   *
   * @param dataSource Database connection
   * @param url Node/explorer url used to backfill boxes below the initial height
   * @param type Network type of `url` (node or explorer)
   * @param address Address the tracked boxes are sent to
   * @param nft Id of the required first token on the box
   * @param logger Optional logger
   * @param initialize Whether to backfill boxes created before the initial height
   */
  constructor(
    dataSource: DataSource,
    url: string,
    type: ErgoNetworkType,
    private readonly address: string,
    private readonly nft: string,
    logger: AbstractLogger = new DummyLogger(),
    initialize = true,
  ) {
    super({ type, url, address, active: initialize }, logger);
    this.ergoTree = wasm.Address.from_base58(address)
      .to_ergo_tree()
      .to_base16_bytes();
    this.actions = new MinFeeBoxAction(
      dataSource,
      this.logger.child('minFeeBoxAction'),
    );
  }

  /**
   * get Id for current extractor
   */
  getId = () => `minfee-box-extractor-${this.nft}`;

  /**
   * check that the box is sent to the tracked address and its first token
   * is the required NFT
   * @param box
   * @return true if the box has the required data and false otherwise
   */
  hasBoxData = (box: OutputBox): boolean => {
    return (
      box.ergoTree === this.ergoTree &&
      box.assets.length > 0 &&
      box.assets[0].tokenId === this.nft
    );
  };

  /**
   * extract box data, keeping the box's token (second asset, if any)
   * @param box
   * @return extracted data in proper format
   */
  extractBoxData = (box: OutputBox): ExtractedMinFeeBox | undefined => {
    const ergoBox = wasm.ErgoBox.from_json(JsonBI.stringify(box));
    return {
      identifier: ergoBox.box_id().to_str(),
      serialized: Buffer.from(ergoBox.sigma_serialize_bytes()).toString(
        'base64',
      ),
      token: box.assets.length > 1 ? box.assets[1].tokenId : null,
    };
  };
}
