import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1766843825000 implements MigrationInterface {
  name = 'Migration1766843825000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" RENAME COLUMN "boxId" TO "identifier"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" RENAME COLUMN "boxSerialized" TO "serialized"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
            DROP CONSTRAINT "UQ_2d4abc2071df9a2300a5e1b4616"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
            ADD CONSTRAINT "UQ_2c1e30eb6bd637e71efd9ca683e" UNIQUE ("identifier", "extractor")
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" DROP COLUMN "spendTxId"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" RENAME COLUMN "identifier" TO "boxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" RENAME COLUMN "serialized" TO "boxSerialized"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
            DROP CONSTRAINT "UQ_2c1e30eb6bd637e71efd9ca683e"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
            ADD CONSTRAINT "UQ_2d4abc2071df9a2300a5e1b4616" UNIQUE ("boxId", "extractor")
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" ADD COLUMN "spendTxId" character varying
        `);
  }
}
