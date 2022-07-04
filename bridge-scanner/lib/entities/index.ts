import { BoxEntity } from "./bridge/BoxEntity";
import { BridgeBlockEntity } from "./bridge/BridgeBlockEntity";
import { ObservedCommitmentEntity } from "./bridge/ObservedCommitmentEntity";
import { BlockEntity } from "./bridge/BlockEntity";
import { CommitmentEntity } from "./bridge/CommitmentEntity";
import { ObservationEntity } from "./bridge/ObservationEntity";

export const commitmentEntities = [BridgeBlockEntity, ObservedCommitmentEntity, BoxEntity];
export const entities = [BlockEntity, CommitmentEntity, ObservationEntity];
