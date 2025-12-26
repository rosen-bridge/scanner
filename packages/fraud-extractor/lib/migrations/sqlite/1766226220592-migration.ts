import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1766226220592 implements MigrationInterface {
  name = 'Migration1766226220592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_fraud_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "txId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "triggerBoxId" varchar NOT NULL,
                "wid" varchar NOT NULL,
                "rwtCount" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" varchar,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_255733ddd78b7ff6784a94892c1" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_fraud_entity"(
                    "id",
                    "identifier",
                    "txId",
                    "block",
                    "height",
                    "serialized",
                    "triggerBoxId",
                    "wid",
                    "rwtCount",
                    "spendBlock",
                    "spendHeight",
                    "spendTxId",
                    "extractor"
                )
            SELECT "id",
                "boxId",
                "creationTxId",
                "creationBlock",
                "creationHeight",
                "serialized",
                "triggerBoxId",
                "wid",
                "rwtCount",
                "spendBlock",
                "spendHeight",
                "spendTxId",
                "extractor"
            FROM "fraud_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "fraud_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_fraud_entity"
                RENAME TO "fraud_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fraud_entity"
                RENAME TO "temporary_fraud_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "fraud_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "boxId" varchar NOT NULL,
                "creationBlock" varchar NOT NULL,
                "creationHeight" integer NOT NULL,
                "creationTxId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "triggerBoxId" varchar NOT NULL,
                "wid" varchar NOT NULL,
                "rwtCount" varchar NOT NULL,
                "spendBlock" text,
                "spendHeight" integer,
                "spendTxId" text,
                "extractor" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "fraud_entity"(
                    "id",
                    "boxId",
                    "creationBlock",
                    "creationHeight",
                    "creationTxId",
                    "serialized",
                    "triggerBoxId",
                    "wid",
                    "rwtCount",
                    "spendBlock",
                    "spendHeight",
                    "spendTxId",
                    "extractor"
                )
            SELECT "id",
                "identifier",
                "block",
                "height",
                "txId",
                "serialized",
                "triggerBoxId",
                "wid",
                "rwtCount",
                "spendBlock",
                "spendHeight",
                "spendTxId",
                "extractor"
            FROM "temporary_fraud_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_fraud_entity"
        `);
  }
}
