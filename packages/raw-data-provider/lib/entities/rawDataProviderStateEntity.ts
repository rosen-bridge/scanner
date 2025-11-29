import { Entity, Column, PrimaryColumn } from '@rosen-bridge/extended-typeorm';

@Entity('raw_data_provider_state_entity')
export class RawDataProviderStateEntity {
  @PrimaryColumn({ type: 'varchar' })
  chain: string;

  @Column({ type: 'integer' })
  lastHeight: number;

  @Column({ type: 'integer' })
  syncedHeight: number;
}
