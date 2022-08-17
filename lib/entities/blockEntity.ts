import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

const PROCESSING = "PROCESSING";
const PROCEED = "PROCEED"

@Entity()
@Unique(['height', 'scanner'])
@Unique(['hash', 'scanner'])
@Unique(['parentHash', 'scanner'])
export class BlockEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    height: number

    @Column({
        length: 64,
    })
    hash: string

    @Column({
        length: 64,
    })
    parentHash: string

    @Column()
    status: string

    @Column()
    scanner: string
}


export {
    PROCEED,
    PROCESSING
}
