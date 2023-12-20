import { gql } from '@apollo/client/core';

export const currentHeight = gql(`
query currentHeight {
  cardano {
    tip {
      number
    }
  }
}
`);

export const blockInfo = gql(`
query blockInfo($where: Block_bool_exp) {
  blocks(where: $where) {
    hash
    number
    previousBlock {
      hash
    }
    forgedAt
  }
}
`);

export const blockTxs = gql(`
query blockTxs($where: Block_bool_exp) {
  blocks(where: $where) {
    transactions {
      hash
      inputs {
        sourceTxIndex
        sourceTxHash
        value
        tokens {
          asset {
            assetName
            policyId
          }
          quantity
        }
      }
      outputs {
        address
        value
        tokens {
          quantity
          asset {
            assetName
            policyId
          }
        }
      }
      fee
      metadata {
        key
        value
      }
    }
  }
}
`);
