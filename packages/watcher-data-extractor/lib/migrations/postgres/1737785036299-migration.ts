import { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

export class Migration1737785036299 implements MigrationInterface {
  name = 'Migration1737785036299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" 
                ALTER COLUMN "boxSerialized" TYPE character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" 
                ALTER COLUMN "spendBlock" TYPE character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
                RENAME COLUMN "boxSerialized" TO "serialized"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
                RENAME COLUMN "serialized" TO "boxSerialized"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" 
                ALTER COLUMN "spendBlock" TYPE text
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" 
                ALTER COLUMN "boxSerialized" TYPE text
        `);
  }
}
