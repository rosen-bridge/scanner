import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1759307285120 implements MigrationInterface {
  name = 'Migration1759307285120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "observation_entity"
            ADD "rawData" character varying NOT NULL DEFAULT ''
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "observation_entity" DROP COLUMN "rawData"
        `);
  }
}
