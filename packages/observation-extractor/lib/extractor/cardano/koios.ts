import { DataSource } from 'typeorm';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { ExtractedObservation } from '../../interfaces/extractedObservation';
import { ObservationEntityAction } from '../../actions/db';
import {
  KoiosTransaction,
  MetaData,
  UTXO,
} from '../../interfaces/koiosTransaction';
import { CardanoRosenData } from '../../interfaces/rosen';
import {
  AbstractExtractor,
  BlockEntity,
  AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/scanner';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { CARDANO_NATIVE_TOKEN } from '../const';

export class CardanoKoiosObservationExtractor extends AbstractExtractor<KoiosTransaction> {
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

  /**
   * get Id for current extractor
   */
  getId = () => 'ergo-cardano-koios-extractor';

  /**
   * returns rosenData object if the box format is like rosen bridge observations otherwise returns undefined
   * @param metaData
   */
  getRosenData = (metaData: MetaData): CardanoRosenData | undefined => {
    // Rosen data type exists with the '0' key on the cardano tx metadata
    if (metaData && Object.prototype.hasOwnProperty.call(metaData, '0')) {
      try {
        const data = metaData['0'];
        if (
          'to' in data &&
          'bridgeFee' in data &&
          'networkFee' in data &&
          'toAddress' in data &&
          'fromAddress' in data
        ) {
          const rosenData = data as unknown as {
            to: string;
            bridgeFee: string;
            networkFee: string;
            toAddress: string;
            fromAddress: Array<string>;
          };
          return {
            toChain: rosenData.to,
            bridgeFee: rosenData.bridgeFee,
            networkFee: rosenData.networkFee,
            toAddress: rosenData.toAddress,
            fromAddress: rosenData.fromAddress.join(''),
          };
        }
        return undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  /**
   * calculate transformation token id in both sides and transfer amount
   * @param box
   * @param toChain
   */
  getTokenDetail = (
    box: UTXO,
    toChain: string
  ): { from: string; to: string; amount: string } | undefined => {
    if (box.asset_list.length > 0) {
      const asset = box.asset_list[0];
      const token = this.tokens.search(
        CardanoKoiosObservationExtractor.FROM_CHAIN,
        {
          assetName: asset.asset_name,
          policyId: asset.policy_id,
        }
      )[0];
      return {
        from: this.tokens.getID(
          token,
          CardanoKoiosObservationExtractor.FROM_CHAIN
        ),
        to: this.tokens.getID(token, toChain),
        amount: asset.quantity,
      };
    }
    const lovelace = this.tokens.search(
      CardanoKoiosObservationExtractor.FROM_CHAIN,
      {
        [this.tokens.getIdKey(CardanoKoiosObservationExtractor.FROM_CHAIN)]:
          CARDANO_NATIVE_TOKEN,
      }
    );
    if (lovelace.length) {
      return {
        from: CARDANO_NATIVE_TOKEN,
        to: this.tokens.getID(lovelace[0], toChain),
        amount: box.value,
      };
    }
  };

  /**
   * gets block id and transactions corresponding to the block and saves if they are valid rosen
   *  transactions and in case of success return true and in case of failure returns false
   * @param block
   * @param txs
   */
  processTransactions = (
    txs: Array<KoiosTransaction>,
    block: BlockEntity
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const observations: Array<ExtractedObservation> = [];
        txs.forEach((transaction) => {
          if (transaction.metadata !== undefined) {
            try {
              const data = this.getRosenData(transaction.metadata);
              // TODO: The order of output box are different from what we sent from wallet to Network
              //  https://git.ergopool.io/ergo/rosen-bridge/scanner/-/issues/27
              const paymentOutputs = transaction.outputs.filter(
                (output) => output.payment_addr.bech32 === this.bankAddress
              );
              if (paymentOutputs.length > 0 && data !== undefined) {
                const transferAsset = this.getTokenDetail(
                  paymentOutputs[0],
                  data.toChain
                );
                if (transferAsset) {
                  const requestId = Buffer.from(
                    blake2b(transaction.tx_hash, undefined, 32)
                  ).toString('hex');
                  observations.push({
                    fromChain: CardanoKoiosObservationExtractor.FROM_CHAIN,
                    toChain: data.toChain,
                    amount: transferAsset.amount,
                    sourceChainTokenId: transferAsset.from,
                    targetChainTokenId: transferAsset.to,
                    sourceTxId: transaction.tx_hash,
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
              this.logger.warn(
                `Error during observing cardano transactions with error [${e}]`
              );
            }
          }
        });
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
