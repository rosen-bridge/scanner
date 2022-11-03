import { DataSource } from 'typeorm';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { ExtractedObservation } from '../interfaces/extractedObservation';
import { ObservationEntityAction } from '../actions/db';
import { KoiosTransaction, MetaData } from '../interfaces/koiosTransaction';
import { RosenData } from '../interfaces/rosen';
import { AbstractExtractor, BlockEntity } from '@rosen-bridge/scanner';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';

export class CardanoObservationExtractor extends AbstractExtractor<KoiosTransaction> {
  private readonly dataSource: DataSource;
  private readonly tokens: TokenMap;
  private readonly actions: ObservationEntityAction;
  private readonly bankAddress: string;
  static readonly FROM_CHAIN: string = 'cardano';

  constructor(dataSource: DataSource, tokens: RosenTokens, address: string) {
    super();
    this.bankAddress = address;
    this.dataSource = dataSource;
    this.tokens = new TokenMap(tokens);
    this.actions = new ObservationEntityAction(dataSource);
  }

  /**
   * get Id for current extractor
   */
  getId = () => 'ergo-cardano-koios-extractor';

  /**
   * returns rosenData object if the box format is like rosen bridge observations otherwise returns undefined
   * @param metaData
   */
  getRosenData = (metaData: MetaData): RosenData | undefined => {
    // Rosen data type exists with the '0' key on the cardano tx metadata
    if (Object.prototype.hasOwnProperty.call(metaData, '0')) {
      try {
        const data = metaData['0'];
        if (
          'toChain' in data &&
          'bridgeFee' in data &&
          'networkFee' in data &&
          'toAddress' in data &&
          // 'toAddress' in data
          'fromAddress' in data
        ) {
          const rosenData = data as unknown as {
            toChain: string;
            bridgeFee: string;
            networkFee: string;
            toAddress: string;
            // targetChainTokenId: string;
            fromAddress: string;
          };
          return {
            toChain: rosenData.toChain,
            bridgeFee: rosenData.bridgeFee,
            networkFee: rosenData.networkFee,
            toAddress: rosenData.toAddress,
            // targetChainTokenId: rosenData.targetChainTokenId,
            // targetChainTokenId:"",
            fromAddress: rosenData.fromAddress,
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
   * Should return the target token hex string id
   * @param policyId
   * @param assetName
   * @param toChain
   */
  toTargetToken = (
    policyId: string,
    assetName: string,
    toChain: string
  ): { fromChain: string; toChain: string } => {
    const tokens = this.tokens.search(CardanoObservationExtractor.FROM_CHAIN, {
      assetName: assetName,
      policyId: policyId,
    })[0];
    return {
      fromChain: this.tokens.getID(
        tokens,
        CardanoObservationExtractor.FROM_CHAIN
      ),
      toChain: this.tokens.getID(tokens, toChain),
    };
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
              if (
                transaction.outputs[0].payment_addr.bech32 ===
                  this.bankAddress &&
                data !== undefined &&
                transaction.outputs[0].asset_list.length !== 0
              ) {
                const asset = transaction.outputs[0].asset_list[0];
                const assetId = this.toTargetToken(
                  asset.policy_id,
                  asset.asset_name,
                  data.toChain
                );
                const requestId = Buffer.from(
                  blake2b(transaction.tx_hash, undefined, 32)
                ).toString('hex');
                observations.push({
                  fromChain: CardanoObservationExtractor.FROM_CHAIN,
                  toChain: data.toChain,
                  amount: asset.quantity,
                  sourceChainTokenId: assetId.fromChain,
                  targetChainTokenId: assetId.toChain,
                  sourceTxId: transaction.tx_hash,
                  bridgeFee: data.bridgeFee,
                  networkFee: data.networkFee,
                  sourceBlockId: block.hash,
                  requestId: requestId,
                  toAddress: data.toAddress,
                  fromAddress: data.fromAddress,
                });
              }
            } catch (e) {
              console.log('error during observing cardano transactions', e);
            }
          }
        });
        this.actions
          .storeObservations(observations, block, this.getId())
          .then((status) => {
            resolve(status);
          })
          .catch((e) => {
            console.log(`An error occurred during store observations: ${e}`);
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
