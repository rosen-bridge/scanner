import { Column, Entity, ManyToOne, PrimaryColumn, Relation } from "typeorm";

export enum SpendReason {
    MERGE = "merge",
    REDEEM = "redeem"
}

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
    //
    // @ManyToOne(
    //     "BridgeBlockEntity",
    //     "height",
    //     {onDelete: 'CASCADE',}
    // )

    // block: Relation<BridgeBlockEntity>

    // @ManyToOne(
    //     "BridgeBlockEntity",
    //     "height",
    //     {onDelete: 'SET NULL', nullable: true}
    // )
    // spendBlock: Relation<BridgeBlockEntity>

    @Column({nullable: true})
    spendReason?: string;
}
