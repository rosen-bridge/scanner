import {
  AbstractExtractor,
  BlockEntity,
  DummyLogger,
  AbstractLogger,
} from '@rosen-bridge/scanner';
import { AuxiliaryData, TxBabbage, TxOut } from '@cardano-ogmios/schema';
import { DataSource } from 'typeorm';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { ObservationEntityAction } from '../../actions/db';
import { getDictValue, JsonObject, ListObject } from '../utils';
import { CARDANO_NATIVE_TOKEN } from '../const';
import { CardanoRosenData } from '../../interfaces/rosen';
import { ExtractedObservation } from '../../interfaces/extractedObservation';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';

export class CardanoOgmiosObservationExtractor extends AbstractExtractor<TxBabbage> {
  readonly logger: AbstractLogger;
  private readonly dataSource: DataSource;
  private readonly tokens: TokenMap;
  private readonly actions: ObservationEntityAction;
  private readonly bankAddress: string;
  static readonly FROM_CHAIN: string = 'cardano';

  constructor(
    dataSource: DataSource,
    tokens: RosenTokens,
    address: string,
    logger?: AbstractLogger
  ) {
    super();
    this.bankAddress = address;
    this.dataSource = dataSource;
    this.tokens = new TokenMap(tokens);
    this.logger = logger ? logger : new DummyLogger();
    this.actions = new ObservationEntityAction(dataSource, this.logger);
  }

  getObjectKeyAsStringOrUndefined = (
    val: JsonObject,
    key: string
  ): string | undefined => {
    if (Object.prototype.hasOwnProperty.call(val, key)) {
      const res = val[key];
      if (typeof res === 'string') return res;
    }
    return undefined;
  };

  /**
   * get Id for current extractor
   */
  getId = () => 'ergo-cardano-ogmios-extractor';

  /**
   * calculate transformation token id in both sides and transfer amount
   * @param box
   * @param toChain
   */
  getTokenDetail = (
    box: TxOut,
    toChain: string
  ): { from: string; to: string; amount: string } | undefined => {
    let res: { from: string; to: string; amount: string } | undefined =
      undefined;
    if (box.value.assets) {
      const asset = box.value.assets;
      Object.keys(asset).map((tokenKey) => {
        let token = this.tokens.search(
          CardanoOgmiosObservationExtractor.FROM_CHAIN,
          { policyId: tokenKey }
        );
        // according to ogmios docs assets are stores as
        //      [policyId.assetName]: amount
        //      [policyId]: amount        if assetName not exists.
        // check if assetName exists search token with policyId and asset name
        if (tokenKey.indexOf('.') != -1) {
          const parts = tokenKey.split('.');
          token = this.tokens.search(
            CardanoOgmiosObservationExtractor.FROM_CHAIN,
            {
              policyId: parts[0],
              assetName: parts[1],
            }
          );
        }
        // it no tokens are extracted we search token with policyId
        if (token.length > 0) {
          res = {
            from: this.tokens.getID(
              token[0],
              CardanoOgmiosObservationExtractor.FROM_CHAIN
            ),
            to: this.tokens.getID(token[0], toChain),
            amount: asset[tokenKey].toString(),
          };
        }
      });
    }
    if (res) return res;
    const lovelace = this.tokens.search(
      CardanoOgmiosObservationExtractor.FROM_CHAIN,
      {
        [this.tokens.getIdKey(CardanoOgmiosObservationExtractor.FROM_CHAIN)]:
          CARDANO_NATIVE_TOKEN,
      }
    );
    if (lovelace.length) {
      return {
        from: CARDANO_NATIVE_TOKEN,
        to: this.tokens.getID(lovelace[0], toChain),
        amount: box.value.coins.toString(),
      };
    }
  };

  /**
   * returns rosenData object if the box format is like rosen bridge observations otherwise returns undefined
   * @param metaData
   */
  getRosenData = (metaData: AuxiliaryData): CardanoRosenData | undefined => {
    try {
      const blob = metaData.body.blob;
      if (blob?.['0']) {
        const value = getDictValue(blob['0']);
        if (value && typeof value === 'object') {
          const toChain = this.getObjectKeyAsStringOrUndefined(
            value as JsonObject,
            'to'
          );
          const bridgeFee = this.getObjectKeyAsStringOrUndefined(
            value as JsonObject,
            'bridgeFee'
          );
          const networkFee = this.getObjectKeyAsStringOrUndefined(
            value as JsonObject,
            'networkFee'
          );
          const toAddress = this.getObjectKeyAsStringOrUndefined(
            value as JsonObject,
            'toAddress'
          );
          const fromAddress = (
            (value as JsonObject).fromAddress as ListObject
          ).join('');
          if (toChain && bridgeFee && networkFee && toAddress && fromAddress) {
            return {
              toChain,
              bridgeFee,
              networkFee,
              toAddress,
              fromAddress,
            };
          }
        }
      }
    } catch (e) {
      this.logger.warn(`Error during fetch rosen data. ${e}`);
    }
    return undefined;
  };

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param block
   * @param txs
   */
  processTransactions = (
    txs: Array<TxBabbage>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const observations: Array<ExtractedObservation> = [];
        for (const transaction of txs) {
          if (transaction.metadata !== null) {
            try {
              const data = this.getRosenData(transaction.metadata);
              const paymentOutput = transaction.body.outputs[0];
              if (
                data &&
                paymentOutput &&
                paymentOutput.address === this.bankAddress
              ) {
                const transferAsset = this.getTokenDetail(
                  paymentOutput,
                  data.toChain
                );
                if (transferAsset) {
                  const requestId = Buffer.from(
                    blake2b(transaction.id, undefined, 32)
                  ).toString('hex');
                  observations.push({
                    fromChain: CardanoOgmiosObservationExtractor.FROM_CHAIN,
                    toChain: data.toChain,
                    amount: transferAsset.amount,
                    sourceChainTokenId: transferAsset.from,
                    targetChainTokenId: transferAsset.to,
                    sourceTxId: transaction.id,
                    bridgeFee: data.bridgeFee,
                    networkFee: data.networkFee,
                    sourceBlockId: block.hash,
                    requestId: requestId,
                    toAddress: data.toAddress,
                    fromAddress: data.fromAddress,
                  });
                }
              }
            } catch (e) {
              this.logger.error(
                `error during observing cardano transactions: ${e}`
              );
            }
          }
        }
        this.actions
          .storeObservations(observations, block, this.getId())
          .then((status) => {
            resolve(status);
          })
          .catch((e) => {
            this.logger.error(
              `An error occurred during store observations: ${e}`
            );
            reject(e);
          });
      } catch (e) {
        reject(e);
      }
    });
  };

  /**
   * fork one block and remove all stored information for this block
   * @param hash: block hash
   */
  forkBlock = async (hash: string): Promise<void> => {
    await this.actions.deleteBlockObservation(hash, this.getId());
  };

  /**
   * Extractor box initialization
   * No action needed in cardano extractors
   */
  initializeBoxes = async () => {
    return;
  };
}
