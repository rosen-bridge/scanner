import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1746354253000 implements MigrationInterface {
  name = 'migration1746354253000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // fix `paymentTxId` column for all events targeted to Ergo in `event_trigger_entity`
    await queryRunner.query(`
        UPDATE "event_trigger_entity"
        SET "paymentTxId" = "spendTxId"
        WHERE "toChain" = 'ergo' AND "spendTxId" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // do nothing
  }
}
