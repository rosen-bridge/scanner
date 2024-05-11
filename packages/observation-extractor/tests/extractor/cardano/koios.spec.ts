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
import { ERGO_NATIVE_TOKEN } from '../../../lib/abstract-extractor/const';
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
          'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
        toAddress: 'ergoAddress',
        height: 1,
        amount: '10',
        networkFee: '10000',
        bridgeFee: '10000',
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
        metadata: {
          '0': JSON.parse(
            '{"to": "ergo","bridgeFee": "10000","toAddress": "ergoAddress","targetChainTokenId": "cardanoTokenId"}'
          ),
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
