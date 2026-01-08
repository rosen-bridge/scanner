import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1766843824000 implements MigrationInterface {
  name = 'Migration1766843824000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_collateral_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "txId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "wid" varchar NOT NULL,
                "rwtCount" bigint NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_2c1e30eb6bd637e71efd9ca683e" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_collateral_entity"(
                    "id",
                    "identifier",
                    "txId",
                    "block",
                    "height",
                    "serialized",
                    "wid",
                    "rwtCount",
                    "spendBlock",
                    "spendHeight",
                    "extractor"
                )
            SELECT "id",
                "boxId",
                "txId",
                "block",
                "height",
                "boxSerialized",
                "wid",
                "rwtCount",
                "spendBlock",
                "spendHeight",
                "extractor"
            FROM "collateral_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "collateral_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_collateral_entity"
                RENAME TO "collateral_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
                RENAME TO "temporary_collateral_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "collateral_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "extractor" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "boxSerialized" varchar NOT NULL,
                "wid" varchar NOT NULL,
                "rwtCount" bigint NOT NULL,
                "txId" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" varchar,
                CONSTRAINT "UQ_2d4abc2071df9a2300a5e1b4616" UNIQUE ("boxId", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "collateral_entity"(
                    "id",
                    "boxId",
                    "boxSerialized",
                    "wid",
                    "rwtCount",
                    "txId",
                    "block",
                    "height",
                    "spendBlock",
                    "spendHeight",
                    "extractor"
                )
            SELECT "id",
                "identifier",
                "serialized",
                "wid",
                "rwtCount",
                "txId",
                "block",
                "height",
                "spendBlock",
                "spendHeight",
                "extractor"
            FROM "temporary_collateral_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_collateral_entity"
        `);
  }
}
