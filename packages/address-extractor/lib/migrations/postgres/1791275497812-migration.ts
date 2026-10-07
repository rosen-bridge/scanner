import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1791275497812 implements MigrationInterface {
  name = 'Migration1791275497812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD "spendTxId" text
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD "spendIndex" integer
        `);
    await queryRunner.query(`
            UPDATE "box_entity"
            SET "spendIndex" = 0,
                "spendTxId" = COALESCE("spendTxId", 'NOT_EXTRACTED_YET')
            WHERE "spendBlock" IS NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP COLUMN "spendIndex"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP COLUMN "spendTxId"
        `);
  }
}
