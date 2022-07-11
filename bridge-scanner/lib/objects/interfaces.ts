import { BoxType } from "../entities/bridge/BoxEntity";
import { SpendReason } from "../entities/bridge/ObservedCommitmentEntity";

export interface SpecialBox{
    boxId: string,
    type: BoxType,
    value: string,
    boxJson: string
}

export interface Commitment{
    eventId: string,
    commitment: string,
    WID: string,
    commitmentBoxId: string
}

export interface SpentBox{
    boxId: string,
    spendReason: SpendReason
}
