import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1782948174639 implements MigrationInterface {
  name = 'Migration1782948174639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_permit_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "txId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_2c1e30eb6bd637e71efd9ca683e" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_permit_entity"(
                    "id",
                    "identifier",
                    "txId",
                    "block",
                    "height",
                    "serialized",
                    "WID",
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
                "WID",
                "spendBlock",
                "spendHeight",
                "extractor"
            FROM "collateral_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "permit_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_permit_entity"
                RENAME TO "permit_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
                RENAME TO "temporary_permit_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "permit_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "extractor" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "boxSerialized" varchar NOT NULL,
                "WID" varchar NOT NULL,
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
            INSERT INTO "permit_entity"(
                    "id",
                    "boxId",
                    "boxSerialized",
                    "WID",
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
                "WID",
                "txId",
                "block",
                "height",
                "spendBlock",
                "spendHeight",
                "extractor"
            FROM "temporary_permit_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_permit_entity"
        `);
  }
}
