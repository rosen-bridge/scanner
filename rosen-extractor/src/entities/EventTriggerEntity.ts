
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class EventTriggerEntity {
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
