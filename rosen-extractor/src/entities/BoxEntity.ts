import { Column, Entity, PrimaryColumn } from "typeorm";

Entity()
export class BoxEntity{
    @PrimaryColumn()
    id: number

    @Column()
    extractor: string;

    @Column()
    boxId: string

    @Column()
    boxSerialized: string

    @Column()
    block: string
}