import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class migration1787144733000 implements MigrationInterface {
  name = 'migration1787144733000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
     ALTER TABLE "block_entity" DROP CONSTRAINT IF EXISTS "UQ_521d830047d5fe08988538289dd"
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "CONSTRAINT "UQ_521d830047d5fe08988538289dd" UNIQUE ("scanner", "height")" ON "block_entity" ("scanner", "height")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "block_entity" DROP CONSTRAINT IF EXISTS "UQ_521d830047d5fe08988538289dd"
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_521d830047d5fe08988538289dd" ON "block_entity" ("hash", "scanner")
    `);
  }
}
