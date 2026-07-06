import { ExtractedCommitment } from '../../lib/interfaces/extractedCommitment';
import { ExtractedPermit } from '../../lib/interfaces/extractedPermit';

export const samplePermit1: ExtractedPermit = {
  identifier: '1',
  serialized: 'serialized1',
  WID: 'wid1',
  txId: 'txId1',
};
export const samplePermit2: ExtractedPermit = {
  identifier: '2',
  serialized: 'serialized2',
  WID: 'wid2',
  txId: 'txId2',
};

export const sampleCommitment1: ExtractedCommitment = {
  identifier: '1',
  commitment:
    '5b7a0ea44088523470a54583e19eb298dc1267cabfcfb1a9c3560dd7d4a4baad',
  eventId: '8226f7bf13b879625052d9b37199bd864914ad5a897703839b5f07172d8487e0',
  rwtCount: '1000',
  serialized: 'serialized1',
  WID: 'wid1',
  txId: 'txId1',
};
export const sampleCommitment2: ExtractedCommitment = {
  identifier: '2',
  serialized: 'serialized2',
  commitment:
    '5b7a0ea44088523470a54583e19eb298dc1267cabfcfb1a9c3560dd7d4a4baad',
  eventId: '8226f7bf13b879625052d9b37199bd864914ad5a897703839b5f07172d8487e0',
  rwtCount: '1000',
  WID: 'wid2',
  txId: 'txId2',
};
