import { Column, Entity, PrimaryColumn } from "typeorm";

const PROCESSING = "PROCESSING";
const PROCEED = "PROCEED"

@Entity()
export class BlockEntity {
    @PrimaryColumn({
        unique: true,
    })
    height: number

    @Column({
        length: 64,
        unique: true
    })
    hash: string

    @Column({
        length: 64,
        unique: true
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
