import { BlockEntity, Transaction } from '@rosen-bridge/scanner';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export const awcNft =
  '3825b2b4acaaaba626440113153246c65ddb2e9df406c4a56418b5842c9f839a';

export const extractor = 'extractor';

export const collateralAddress =
  '2DxRv75maq3FewTq4mCgRzJ7kUjfUTz9QmtoTUXpRLJLPDjxhxMzEWKKQ4qBgDCuRumVWLs3ANP2pTU4a8qSxeBkm8K5dqcXi2DCyd4EM6gZijm47DYDmdjsJwtQFHziyRNq2asQuWfBb5R33z3fV826Cx4K9FKNf6t5558TDdB1Zo7z4eWUEn8LWZRtBjuGXz6TtxTu1A758c689cP6jVYxq';

export const explorerUrl = 'https://api.ergoplatform.com';

export const rsn =
  'f8fe64d3d94d4eb193ea9d6304646db67bd914ed42cebd3a4f614d9d9de75cf0';

const hexToUint8Array = (hex: string): Uint8Array =>
  Uint8Array.from(Buffer.from(hex, 'hex'));

export const generateCollateralBox = (
  address: string,
  awcNft: string,
  value: bigint,
  height: number,
  wid: string,
  rwtCount: bigint,
  rsn: string,
  rsnCollateral: bigint
): ergoLib.ErgoBoxCandidate => {
  const boxBuilder = new ergoLib.ErgoBoxCandidateBuilder(
    ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(value.toString())),
    ergoLib.Contract.pay_to_address(ergoLib.Address.from_base58(address)),
    height
  );

  boxBuilder.set_register_value(
    4,
    ergoLib.Constant.from_byte_array(hexToUint8Array(wid))
  );

  boxBuilder.set_register_value(
    5,
    ergoLib.Constant.from_i64(ergoLib.I64.from_str(rwtCount.toString()))
  );

  boxBuilder.add_token(
    ergoLib.TokenId.from_str(awcNft),
    ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str('1'))
  );

  boxBuilder.add_token(
    ergoLib.TokenId.from_str(rsn),
    ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str(rsnCollateral.toString()))
  );

  return boxBuilder.build();
};

export const generateTx = (
  txId: string,
  inputs: string[],
  outputs: ergoLib.ErgoBox[]
): Transaction => {
  return {
    id: txId,
    inputs: inputs.map((boxId) => ({ boxId })),
    dataInputs: [],
    outputs: outputs.map((box) => box.to_js_eip12()),
  };
};

export const toErgoBox = (
  boxCandidate: ergoLib.ErgoBoxCandidate,
  txId: string,
  boxIndex: number
): ergoLib.ErgoBox =>
  ergoLib.ErgoBox.from_box_candidate(
    boxCandidate,
    ergoLib.TxId.from_str(txId),
    boxIndex
  );

export const txId1 =
  '8c494da0242fd04ecb4efd3d9de11813848c79b38592f29d579836dfbc459f96';
export const height1 = 20;
export const collateralBoxesTx1 = [
  { wid: '444a', rwtCount: 200n, rsnCollateral: 333n },
  { wid: '234f', rwtCount: 300n, rsnCollateral: 45n },
  { wid: '7da8', rwtCount: 600n, rsnCollateral: 74n },
  {
    wid: '9afd',
    rwtCount: 700n,
    rsnCollateral: 4000n,
    awcNft: 'e4dca5c7b35ead14e65699505bdd65af5c00b2249327e0ed9ba0e2b509101a82',
  },
]
  .map((data) =>
    generateCollateralBox(
      collateralAddress,
      data.awcNft || awcNft,
      2_000_000_000n,
      height1,
      data.wid,
      data.rwtCount,
      rsn,
      data.rsnCollateral
    )
  )
  .map((box, i) => toErgoBox(box, txId1, i));
export const tx1 = generateTx(txId1, [], collateralBoxesTx1);
export const block1: BlockEntity = {
  id: 10,
  height: height1,
  hash: 'hash',
  parentHash: 'parentHash',
  status: 'hi',
  scanner: '1',
  timestamp: 10,
};

export const txId2 =
  '0a7404b9e376cf39618c904ac797b7b2688ce3b9b2a7236e319781dc8b360a08';
export const height2 = 30;
export const collateralBoxesTx2 = [
  { wid: 'abcd', rwtCount: 200n, rsnCollateral: 333n },
  { wid: '12cd', rwtCount: 300n, rsnCollateral: 45n },
  { wid: '30de', rwtCount: 600n, rsnCollateral: 74n },
  { wid: '18af', rwtCount: 700n, rsnCollateral: 4000n },
]
  .map((data) =>
    generateCollateralBox(
      collateralAddress,
      awcNft,
      2_000_000_000n,
      height2,
      data.wid,
      data.rwtCount,
      rsn,
      data.rsnCollateral
    )
  )
  .map((box, i) => toErgoBox(box, txId2, i));
export const tx2 = generateTx(
  txId2,
  collateralBoxesTx1.map((box) => box.box_id().to_str()).slice(0, 2),
  collateralBoxesTx2
);
export const block2: BlockEntity = {
  id: 20,
  height: height2,
  hash: 'hash2',
  parentHash: 'parentHash2',
  status: 'hi',
  scanner: '1',
  timestamp: 11,
};
