import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1689151869889 implements MigrationInterface {
  name = 'migration1689151869889';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD "spendHeight" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD "spendBlock" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD "spendBlock" text
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP COLUMN "spendHeight"
        `);
  }
}
