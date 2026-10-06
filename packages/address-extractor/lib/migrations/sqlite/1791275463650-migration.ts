import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1791275463650 implements MigrationInterface {
  name = 'Migration1791275463650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_box_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "height" integer NOT NULL,
                "block" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" text,
                "spendIndex" integer,
                "address" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                CONSTRAINT "UQ_a7a8410fbcd784583cae876e6b9" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_box_entity"(
                    "id",
                    "identifier",
                    "height",
                    "block",
                    "spendBlock",
                    "spendHeight",
                    "address",
                    "extractor",
                    "serialized"
                )
            SELECT "id",
                "identifier",
                "height",
                "block",
                "spendBlock",
                "spendHeight",
                "address",
                "extractor",
                "serialized"
            FROM "box_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "box_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_box_entity"
                RENAME TO "box_entity"
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
            ALTER TABLE "box_entity"
                RENAME TO "temporary_box_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "box_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "height" integer NOT NULL,
                "block" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "address" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                CONSTRAINT "UQ_a7a8410fbcd784583cae876e6b9" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "box_entity"(
                    "id",
                    "identifier",
                    "height",
                    "block",
                    "spendBlock",
                    "spendHeight",
                    "address",
                    "extractor",
                    "serialized"
                )
            SELECT "id",
                "identifier",
                "height",
                "block",
                "spendBlock",
                "spendHeight",
                "address",
                "extractor",
                "serialized"
            FROM "temporary_box_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_box_entity"
        `);
  }
}
