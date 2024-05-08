import { describe, it, expect, vitest } from 'vitest';

describe('AbstractInitializableErgoExtractorAction', () => {
  // describe('getTxBlock', () => {
  //   /**
  //    * @target getTxBlock should extract block id and height for a transaction
  //    * @dependencies
  //    * @scenario
  //    * - call getTxBlock with api output
  //    * - check the extract info
  //    * @expected
  //    * - should extract block data from api output
  //    */
  //   it('should extract block id and height for a transaction', async () => {
  //     vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
  //       v1: {
  //         getApiV1TransactionsP1: async () => ({
  //           blockId: 'blockId',
  //           inclusionHeight: 100,
  //         }),
  //       },
  //     } as any);
  //     const extractor = new MockedInitializableErgoExtractor();
  //     const boxData = await extractor.getTxBlock('txId');
  //     expect(boxData).toEqual({
  //       id: 'blockId',
  //       height: 100,
  //     });
  //   });
  // });
});
