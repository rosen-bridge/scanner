import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1758958886549 implements MigrationInterface {
  name = 'Migration1758958886549';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP CONSTRAINT "UQ_c905f221a1b6271ca4405dbbe5f"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
                RENAME COLUMN "boxId" TO "identifier"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD CONSTRAINT "UQ_d88f2963a5dacea7b163f134100" UNIQUE ("identifier", "extractor")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP CONSTRAINT "UQ_d88f2963a5dacea7b163f134100"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
                RENAME COLUMN "identifier" TO "boxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD CONSTRAINT "UQ_c905f221a1b6271ca4405dbbe5f" UNIQUE ("extractor", "boxId")
        `);
  }
}
