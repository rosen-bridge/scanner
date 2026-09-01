import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class migration1788340428756 implements MigrationInterface {
  name = 'migration1788340428756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entity" DROP CONSTRAINT "UQ_521d830047d5fe08988538289dd"
        `);

    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ADD CONSTRAINT "UQ_521d830047d5fe08988538289dd" UNIQUE ("scanner", "height")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entity" DROP CONSTRAINT "UQ_521d830047d5fe08988538289dd"
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ADD CONSTRAINT "UQ_521d830047d5fe08988538289dd" UNIQUE ("height", "scanner")
        `);
  }
}
