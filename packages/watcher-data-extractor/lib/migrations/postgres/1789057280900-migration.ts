import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1789057280900 implements MigrationInterface {
  name = 'Migration1789057280900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "commitment_entity" SET "rwtCount" = '' WHERE "rwtCount" IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" ALTER COLUMN "rwtCount" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" ALTER COLUMN "rwtCount" DROP NOT NULL
        `);
  }
}
