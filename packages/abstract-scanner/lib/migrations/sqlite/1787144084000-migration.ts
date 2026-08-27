import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class migration1787144084000 implements MigrationInterface {
  name = 'migration1787144084000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_521d830047d5fe08988538289dd"
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_521d830047d5fe08988538289dd" ON "block_entity" ("scanner", "height")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_521d830047d5fe08988538289dd"
      `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_521d830047d5fe08988538289dd" ON "block_entity" ("height", "scanner")
    `);
  }
}
