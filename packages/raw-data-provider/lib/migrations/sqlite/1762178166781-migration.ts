import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1762178166781 implements MigrationInterface {
  name = 'Migration1762178166781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "raw_data_provider_state" (
                "chain" varchar PRIMARY KEY NOT NULL,
                "lastHeight" integer NOT NULL,
                "syncedHeight" integer NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "raw_data_provider_state"
        `);
  }
}
