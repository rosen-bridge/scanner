import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1685962243297 implements MigrationInterface {
  name = 'migration1685962243297';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "txId" varchar NOT NULL DEFAULT '';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity" 
            DROP COLUMN "txId";
        `);
  }
}
