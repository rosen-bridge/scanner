import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1699874447928 implements MigrationInterface {
  name = 'migration1699874447928';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "result" text
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "paymentTxId" text
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "spendTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "spendTxId" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "spendTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "spendTxId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "paymentTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "result"
        `);
  }
}
