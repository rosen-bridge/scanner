import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity()
@Unique(["requestId", "extractor"])
export class ObservationEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 30,
    })
    fromChain: string

    @Column({
        length: 30,
    })
    toChain: string

    @Column()
    fromAddress: string

    @Column()
    toAddress: string

    @Column()
    height: number

    @Column()
    amount: string

    @Column()
    networkFee: string

    @Column()
    bridgeFee: string

    @Column()
    sourceChainTokenId: string

    @Column()
    targetChainTokenId: string

    @Column()
    sourceTxId: string

    @Column()
    sourceBlockId: string

    @Column()
    requestId: string

    @Column()
    block: string;

    @Column()
    extractor: string;
}
