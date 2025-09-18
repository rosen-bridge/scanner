import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1758049849122 implements MigrationInterface {
  name = 'Migration1758049849122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_box_entity" (
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
                "boxId",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity"
                RENAME TO "temporary_box_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "box_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "boxId" varchar NOT NULL,
                "height" integer NOT NULL,
                "block" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "address" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                CONSTRAINT "UQ_86fbe5bb307de1305cc22efa762" UNIQUE ("boxId", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "box_entity"(
                    "id",
                    "boxId",
                    "height",
                    "block",
                    "spendBlock",
                    "spendHeight",
                    "address",
                    "extractor",
                    "serialized"
                )
            SELECT "id",
                "boxId",
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
