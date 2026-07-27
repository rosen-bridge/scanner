import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1783430084020 implements MigrationInterface {
  name = 'Migration1783430084020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_commitment_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "txId" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "eventId" varchar NOT NULL,
                "commitment" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "rwtCount" varchar,
                "spendTxId" text,
                "spendIndex" integer,
                "identifier" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                CONSTRAINT "UQ_61e30957d6e9fd30af07bedb28c" UNIQUE ("identifier", "extractor")
            )
        `);

    await queryRunner.query(`
            INSERT INTO "temporary_commitment_entity"(
                "id", "txId", "extractor", "eventId", "commitment", "WID", "block", "height",
                "spendBlock", "spendHeight", "rwtCount", "spendTxId", "spendIndex", "identifier", "serialized"
            )
            SELECT 
                "id", "txId", "extractor", "eventId", "commitment", "WID", "block", "height",
                "spendBlock", "spendHeight", "rwtCount", "spendTxId", "spendIndex", "boxId", "boxSerialized"
            FROM "commitment_entity"
        `);
    await queryRunner.query(`DROP TABLE "commitment_entity"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_commitment_entity" RENAME TO "commitment_entity"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_commitment_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "txId" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "eventId" varchar NOT NULL,
                "commitment" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "spendBlock" text,
                "spendHeight" integer,
                "rwtCount" varchar,
                "spendTxId" text,
                "spendIndex" integer,
                "boxId" varchar NOT NULL,
                "boxSerialized" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_commitment_entity"(
                "id", "txId", "extractor", "eventId", "commitment", "WID", "block", "height",
                "spendBlock", "spendHeight", "rwtCount", "spendTxId", "spendIndex", "boxId", "boxSerialized"
            )
            SELECT 
                "id", "txId", "extractor", "eventId", "commitment", "WID", "block", "height",
                "spendBlock", "spendHeight", "rwtCount", "spendTxId", "spendIndex", "identifier", "serialized"
            FROM "commitment_entity"
        `);
    await queryRunner.query(`DROP TABLE "commitment_entity"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_commitment_entity" RENAME TO "commitment_entity"`,
    );
  }
}
