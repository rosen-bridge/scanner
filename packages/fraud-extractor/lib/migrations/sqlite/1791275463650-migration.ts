import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1791275463650 implements MigrationInterface {
  name = 'Migration1791275463650';

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
                "spendTxId" text,
                "spendIndex" integer,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_255733ddd78b7ff6784a94892c1" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_fraud_entity"(
                    "id",
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
    await queryRunner.query(`
            UPDATE "fraud_entity"
            SET "spendIndex" = 0,
                "spendTxId" = COALESCE("spendTxId", 'NOT_EXTRACTED_YET')
            WHERE "spendBlock" IS NOT NULL
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
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_255733ddd78b7ff6784a94892c1" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "fraud_entity"(
                    "id",
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
                "extractor"
            FROM "temporary_fraud_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_fraud_entity"
        `);
  }
}
