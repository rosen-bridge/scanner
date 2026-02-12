import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1766229066209 implements MigrationInterface {
  name = 'Migration1766229066209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "boxId" TO "identifier"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "creationBlock" TO "block"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "creationHeight" TO "height"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "creationTxId" TO "txId"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity"
            ADD CONSTRAINT "UQ_255733ddd78b7ff6784a94892c1" UNIQUE ("identifier", "extractor")
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" ALTER COLUMN "spendBlock" TYPE character varying;
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" DROP COLUMN "spendTxId"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" ADD COLUMN "spendTxId" TYPE text
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" ALTER COLUMN "spendBlock" TYPE text
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity"
            DROP CONSTRAINT "UQ_255733ddd78b7ff6784a94892c1"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "txId" TO "creationTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "height" TO "creationHeight"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "block" TO "creationBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "fraud_entity" RENAME COLUMN "identifier" TO "boxId"
        `);
  }
}
