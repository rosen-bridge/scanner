import { Column, Entity, PrimaryColumn } from "typeorm";

Entity()
export class BoxEntity{
    @PrimaryColumn()
    id: number

    @Column()
    boxId: string

    @Column()
    boxJson: string

    @Column()
    block: string
}