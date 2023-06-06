import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1685962243297 implements MigrationInterface {
  name = 'migration1685962243297';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "txId" varchar,
            ADD "txTimestamp" bigint;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity" 
            DROP COLUMN "txId",
            DROP COLUMN "txTimestamp";
        `);
  }
}
