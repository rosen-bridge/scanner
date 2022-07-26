import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({name: "commitment_entity"})
export class CommitmentEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    extractor: string;

    @Column()
    eventId: string;

    @Column()
    commitment: string;

    @Column()
    WID: string;

    @Column()
    commitmentBoxId: string;

    @Column()
    block: string;

    @Column({nullable: true})
    spendBlock?: string;

}
