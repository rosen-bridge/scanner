import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1689151869889 implements MigrationInterface {
  name = 'migration1689151869889';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD "spendHeight" integer
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP COLUMN "spendHeight"
        `);
  }
}
