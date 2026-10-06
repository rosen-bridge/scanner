import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1791275497812 implements MigrationInterface {
  name = 'Migration1791275497812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "spendTxId" text
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "spendIndex" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
            ADD "spendTxId" text
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
            ADD "spendIndex" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "spendIndex" integer
        `);
    await queryRunner.query(`
            UPDATE "permit_entity"
            SET "spendIndex" = 0,
                "spendTxId" = COALESCE("spendTxId", 'NOT_EXTRACTED_YET')
            WHERE "spendBlock" IS NOT NULL
        `);
    await queryRunner.query(`
            UPDATE "collateral_entity"
            SET "spendIndex" = 0,
                "spendTxId" = COALESCE("spendTxId", 'NOT_EXTRACTED_YET')
            WHERE "spendBlock" IS NOT NULL
        `);
    await queryRunner.query(`
            UPDATE "event_trigger_entity"
            SET "spendIndex" = 0
            WHERE "spendBlock" IS NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "event_trigger_entity" SET "spendTxId" = NULL
            WHERE "spendTxId" = 'NOT_EXTRACTED_YET'
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "spendIndex"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" DROP COLUMN "spendIndex"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity" DROP COLUMN "spendTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "spendIndex"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "spendTxId"
        `);
  }
}
