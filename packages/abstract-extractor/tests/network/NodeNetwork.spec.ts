import { describe, expect, it, vitest } from 'vitest';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

import { NodeNetwork } from '../../lib';
import {
  convertedBox,
  nodeBox,
  nodeSpendingTxInfo,
  nodeCreationTxInfo,
  nodeTx,
  convertedTx,
} from './testData';

vitest.mock('@rosen-clients/ergo-node');

describe('NodeNetwork', () => {
  describe('convertBox', () => {
    /**
     * @target covertBox should properly convert node api box to ergo box
     * @dependencies
     * @scenario
     * - mock getTxById to return creation and spending transaction
     * - run test (call `covertBox`)
     * @expected
     * - to convert box properly
     */
    it('should properly convert node api box to ergo box', async () => {
      vitest.mocked(ergoNodeClientFactory).mockReturnValue({
        getTxById: async (txId: string) => {
          if (txId == nodeSpendingTxInfo.id) return nodeSpendingTxInfo;
          else return nodeCreationTxInfo;
        },
      } as unknown as ReturnType<typeof ergoNodeClientFactory>);
      const nodeNetwork = new NodeNetwork('node_url');
      const ergoBox = await nodeNetwork['convertBox'](nodeBox);
      expect(ergoBox).toEqual(convertedBox);
    });
  });

  describe('convertTransaction', () => {
    /**
     * @target convertTransaction should properly convert node api tx to
     * extractor transaction
     * @dependencies
     * @scenario
     * - mock getTxById to return creation and spending transaction
     * - run test (call `convertTransaction`)
     * @expected
     * - to convert tx properly
     */
    it('should properly convert node api tx to extractor transaction', async () => {
      const nodeNetwork = new NodeNetwork('node_url');
      const tx = await nodeNetwork['convertTransaction'](nodeTx);
      expect(tx).toEqual(convertedTx);
    });
  });
});
