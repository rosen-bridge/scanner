import { ErgoObservationExtractor } from '../../lib';
import {
  generateBlockEntity,
  createDatabase,
  observationTxGenerator,
} from '../utils.mock';
import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { tokens } from '../tokens.mock';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';

class ExtractorErgo extends ErgoObservationExtractor {}

const bankAddress = '9f53ZBeKFk3VKS4KPj1Lap96BKFSw8zfdWb4FHYZH6qBBV6p9ZS';
const bankSK =
  'f133100250abf1494e9ff5a0f998dc2fea7a5aa35641454ba723c913bff0e8fa';
const watcherSK =
  '3870dab5e5fb3eebfdcb30031b65a8dbb8eec75ffe3558e7d0c7ef9529984ee1';
let dataSource: DataSource;

describe('extractorErgo', () => {
  beforeEach(async () => {
    dataSource = await createDatabase();
  });
  describe('processTransactions', () => {
    /**
     * @target ExtractorErgo.processTransactions should ignore tx containing
     * output box with invalid creation height
     * @dependencies
     * @scenario
     * - mock test txs
     * - mock block with high height
     * - run test
     * - check returned value
     * - check stored observations
     * @expected
     * - it should return true
     * - no observation should be stored
     */
    it('should ignore tx containing output box with invalid creation height', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokens);
      const extractor = new ExtractorErgo(bankAddress, dataSource, tokenMap);
      const Tx1 = observationTxGenerator(
        true,
        [
          'cardano',
          'addr1vyq4t43mlfv2l6pfd8g7wmnlrnfdcy58utnzpv989nnd5jq0ymfve',
          '10000',
          '1000',
          '9i1EZHaRPTLajwJivCFpdoi65r7A8ZgJxVbMtxZ23W5Z2gDkKdM',
        ],
        bankSK,
        watcherSK,
      );
      const Tx2 = observationTxGenerator(
        true,
        [
          'cardano',
          'addr1vyq4t43mlfv2l6pfd8g7wmnlrnfdcy58utnzpv989nnd5jq0ymfve',
          '10000',
          '1000',
        ],
        bankSK,
        watcherSK,
      );
      const Tx3 = observationTxGenerator(
        false,
        [
          'cardano',
          'addr1vyq4t43mlfv2l6pfd8g7wmnlrnfdcy58utnzpv989nnd5jq0ymfve',
          '10000',
          '1000',
          '9i1EZHaRPTLajwJivCFpdoi65r7A8ZgJxVbMtxZ23W5Z2gDkKdM',
        ],
        bankSK,
        watcherSK,
      );
      const res = await extractor.processTransactions(
        [Tx1, Tx2, Tx3],
        generateBlockEntity(dataSource, '1', '1', 500000),
      );
      expect(res).toEqual(true);
      const repository = dataSource.getRepository(ObservationEntity);
      const [, rowsCount] = await repository.findAndCount();
      expect(rowsCount).toEqual(0);
    });
  });
});
