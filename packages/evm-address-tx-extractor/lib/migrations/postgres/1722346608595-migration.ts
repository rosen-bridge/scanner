import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1722346608595 implements MigrationInterface {
  name = 'Migration1722346608595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "address_txs_entity"
          ADD "status" character varying NOT NULL
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "address_txs_entity" DROP COLUMN "status"
      `);
  }
}
