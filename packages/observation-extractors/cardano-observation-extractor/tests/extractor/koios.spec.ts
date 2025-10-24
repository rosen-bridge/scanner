import { CardanoKoiosObservationExtractor } from '../../lib';
import {
  cardanoTxValid,
  generateBlockEntity,
  createDatabase,
} from '../utils.mock';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { tokens } from '../tokens.mock';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { KoiosTransaction } from '../../lib/interfaces/koiosTransaction';

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
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokens);
      const extractor = new CardanoKoiosExtractor(
        dataSource,
        tokenMap,
        bankAddress,
      );
      const Tx: KoiosTransaction = cardanoTxValid;
      const res = await extractor.processTransactions(
        [Tx],
        generateBlockEntity(dataSource, '1'),
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
        targetChainTokenId: 'erg',
        sourceBlockId: '1',
        sourceTxId: txHash,
        block: '1',
        requestId: Buffer.from(blake2b(txHash, undefined, 32)).toString('hex'),
        extractor: 'cardano-koios-extractor',
        rawData:
          'a100a562746f646572676f696272696467654665656a383137373538343433316a6e6574776f726b4665656932303730303030303069746f416464726573737833396946737765744e66436572595432574e6f55544a62664d663657644247425179366a6157374731326b795655383162566d696b66726f6d41646472657373827840616464723171793264716a6133707079346e7664366561397567387a6761616b346b6671636a77646b656632737170383673396b396a35713970713237396a667827396b6c766130363663306772346676686e326e6c78673364396a6c786c756d6b717234337a667a',
      });
    }, 100000);

    /**
     * one valid transaction to the wrong bank Address should not save in database
     * Dependency: action.storeObservations
     * Scenario: no observation should save
     * Expected: processTransactions should returns true and database row count should be 0
     */
    it('database row count should be zero because of invalid bankAddress', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokens);
      const extractor = new CardanoKoiosExtractor(
        dataSource,
        tokenMap,
        'addr_test1qq5qeusgymq8ledv9gltp9fuh5jchetjeafha75n6dghur4gtzcgx',
      );
      const Tx: KoiosTransaction = cardanoTxValid;
      const res = await extractor.processTransactions(
        [Tx],
        generateBlockEntity(dataSource, '1'),
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
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokens);
      const extractor = new CardanoKoiosExtractor(
        dataSource,
        tokenMap,
        bankAddress,
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
        generateBlockEntity(dataSource, '1'),
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(ObservationEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    });
  });
});
