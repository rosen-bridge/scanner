import { BoxType } from "../entities/BoxEntity";

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
