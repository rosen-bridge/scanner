import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class PermitEntity {
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