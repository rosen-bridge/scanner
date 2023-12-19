import { CardanoGraphQLObservationExtractor } from '../../../lib';
import { generateBlockEntity, createDatabase } from '../utils.mock';
import { ObservationEntity } from '../../../lib';
import { tokens } from '../tokens.mock';
import { Buffer } from 'buffer';
import { blake2b } from 'blakejs';
import { ERGO_NATIVE_TOKEN } from '../../../lib/extractor/const';
import { DataSource } from 'typeorm';
import { validLockTx, bankAddress } from './graphQLTestData';

let dataSource: DataSource;

describe('CardanoGraphQLObservationExtractor', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });
  describe('processTransactions', () => {
    /**
     * @target CardanoGraphQLObservationExtractor.processTransactions
     * should return true and insert observation into database on valid lock tx
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - observation should be inserted into database
     */
    it('should return true and insert observation into database on valid lock tx', async () => {
      const tx = validLockTx;

      // run test
      const extractor = new CardanoGraphQLObservationExtractor(
        dataSource,
        tokens,
        bankAddress
      );
      const res = await extractor.processTransactions(
        [tx],
        generateBlockEntity(dataSource, '1')
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(1);
      const observation1 = rows[0];
      const txHash = validLockTx.hash;
      expect(observation1).toEqual({
        id: 1,
        fromChain: 'cardano',
        toChain: 'ergo',
        fromAddress:
          'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
        toAddress: 'ergoAddress',
        height: 1,
        amount: '3000000000',
        networkFee: '9842520',
        bridgeFee: '1968503938',
        sourceChainTokenId:
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
        targetChainTokenId: ERGO_NATIVE_TOKEN,
        sourceBlockId: '1',
        sourceTxId: txHash,
        block: '1',
        requestId: Buffer.from(blake2b(txHash, undefined, 32)).toString('hex'),
        extractor: 'cardano-graphql-extractor',
      });
    }, 100000);

    /**
     * @target CardanoGraphQLObservationExtractor.processTransactions
     * should return true with no observation in database on invalid lock tx
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - run test
     * - check returned value
     * - check database
     * @expected
     * - it should return true
     * - no observation should be in database
     */
    it('should return true with no observation in database on invalid lock tx', async () => {
      const tx = validLockTx;

      // run test
      const extractor = new CardanoGraphQLObservationExtractor(
        dataSource,
        tokens,
        'addr_test1qq5qeusgymq8ledv9gltp9fuh5jchetjeafha75n6dghur4gtzcgx'
      );
      const res = await extractor.processTransactions(
        [tx],
        generateBlockEntity(dataSource, '1')
      );

      // check returned valid
      expect(res).toEqual(true);

      // check database
      const repository = dataSource.getRepository(ObservationEntity);
      const [rows, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    }, 100000);
  });
});
