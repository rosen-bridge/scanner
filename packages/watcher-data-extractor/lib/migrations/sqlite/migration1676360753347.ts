import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1676360753347 implements MigrationInterface {
  name = 'migration1676360753347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_trigger_entity" ADD "txId" varchar NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "event_trigger_entity" ADD "spendTxId" varchar`
    );
    await queryRunner.query(
      `ALTER TABLE "commitment_entity" ADD "txId" varchar`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_trigger_entity" DROP COLUMN "txId"`
    );
    await queryRunner.query(
      `ALTER TABLE "event_trigger_entity" DROP COLUMN "spendTxId"`
    );
    await queryRunner.query(
      `ALTER TABLE "commitment_entity" DROP COLUMN "txId"`
    );
  }
}
