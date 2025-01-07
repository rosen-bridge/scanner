import { CardanoKoiosObservationExtractor } from '../../../lib';
import { KoiosTransaction } from '../../../lib/interfaces/koiosTransaction';
import {
  cardanoTxValid,
  generateBlockEntity,
  createDatabase,
} from '../utils.mock';
import { ObservationEntity } from '../../../lib';
import { tokens } from '../tokens.mock';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { ERGO_NATIVE_TOKEN } from '../../../lib/extractor/const';
import { DataSource } from 'typeorm';

class CardanoKoiosExtractor extends CardanoKoiosObservationExtractor {}

const bankAddress =
  'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re';

let dataSource: DataSource;

describe('cardanoKoiosObservationExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });
  describe('processTransactionsCardano', () => {
    /**
     * one Valid Transaction should save successfully
     * Dependency: action.storeObservations
     * Scenario: one observation should save successfully
     * Expected: processTransactions should returns true and database row count should be 1 and dataBase
     *  field should fulfill expected values
     */
    it('should returns true valid rosen transaction', async () => {
      const extractor = new CardanoKoiosExtractor(
        dataSource,
        tokens,
        bankAddress
      );
      const Tx: KoiosTransaction = cardanoTxValid;
      const res = await extractor.processTransactions(
        [Tx],
        generateBlockEntity(dataSource, '1')
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      const observation1 = rows[0];
      const txHash =
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6';
      expect(observation1).toEqual({
        id: 1,
        fromChain: 'cardano',
        toChain: 'ergo',
        fromAddress:
          'addr1qytsk73jatycajqksafza5z90cw3zj2exhtdqx226r2l6dphvyt647kn7zl3svpnzjmuty2sfsr28cmf3aaa263hazqqxwdedk',
        toAddress: '9i1EZHaRPTLajwJivCFpdoi65r7A8ZgJxVbMtxZ23W5Z2gDkKdM',
        height: 1,
        amount: '1635516886333',
        networkFee: '3829872',
        bridgeFee: '10376749',
        sourceChainTokenId:
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
        targetChainTokenId: ERGO_NATIVE_TOKEN,
        sourceBlockId: '1',
        sourceTxId: txHash,
        block: '1',
        requestId: Buffer.from(blake2b(txHash, undefined, 32)).toString('hex'),
        extractor: 'cardano-koios-extractor',
      });
    }, 100000);

    /**
     * one valid transaction to the wrong bank Address should not save in database
     * Dependency: action.storeObservations
     * Scenario: no observation should save
     * Expected: processTransactions should returns true and database row count should be 0
     */
    it('database row count should be zero because of invalid bankAddress', async () => {
      const extractor = new CardanoKoiosExtractor(
        dataSource,
        tokens,
        'addr_test1qq5qeusgymq8ledv9gltp9fuh5jchetjeafha75n6dghur4gtzcgx'
      );
      const Tx: KoiosTransaction = cardanoTxValid;
      const res = await extractor.processTransactions(
        [Tx],
        generateBlockEntity(dataSource, '1')
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(ObservationEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    });

    /**
     * zero Valid Transaction should save successfully
     * Dependency: action.storeObservations
     * Scenario: zero observation should save successfully
     * Expected: processTransactions should returns true and database row count should be 0
     */
    it('should returns false invalid rosen metadata', async () => {
      const extractor = new CardanoKoiosExtractor(
        dataSource,
        tokens,
        bankAddress
      );
      const Tx: KoiosTransaction = {
        ...cardanoTxValid,
        auxiliary_data: {
          prefer_alonzo_format: false,
          metadata: {
            '0': '{"map":[{"k":{"string":"to"},"v":{"string":"ergo"}},{"k":{"string":"bridgeFee"},"v":{"string":"10376749"}},{"k":{"string":"networkFee"},"v":{"string":"3829872"}},{"k":{"string":"toAddress"},"v":{"string":"9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG"}}}',
          },
        },
      };
      const res = await extractor.processTransactions(
        [Tx],
        generateBlockEntity(dataSource, '1')
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(ObservationEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    });
  });
});
