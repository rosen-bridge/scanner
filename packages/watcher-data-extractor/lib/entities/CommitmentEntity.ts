import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["boxId", "extractor"])
class CommitmentEntity{
    @PrimaryGeneratedColumn()
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
    boxId: string;

    @Column()
    block: string;

    @Column()
    height: number

    @Column()
    boxSerialized: string;

    @Column({nullable: true})
    spendBlock!: string;

    @Column({nullable: true})
    spendHeight?: number;
}

export default CommitmentEntity;
