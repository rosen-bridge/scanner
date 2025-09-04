import { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

export class migration1737532655167 implements MigrationInterface {
  name = 'Migration1737532655167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_box_entity" (
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
            INSERT INTO "temporary_box_entity"(
                    "id",
                    "address",
                    "boxId",
                    "serialized",
                    "spendBlock",
                    "extractor",
                    "spendHeight",
                    "block",
                    "height"
                )
            SELECT "id",
                "address",
                "boxId",
                "serialized",
                "spendBlock",
                "extractor",
                "spendHeight",
                "createBlock",
                "creationHeight"
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
                "address" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "spendBlock" text,
                "extractor" varchar NOT NULL,
                "spendHeight" integer,
                "createBlock" varchar NOT NULL,
                "creationHeight" integer NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "box_entity"(
                    "id",
                    "address",
                    "boxId",
                    "serialized",
                    "spendBlock",
                    "extractor",
                    "spendHeight",
                    "createBlock",
                    "creationHeight"
                )
            SELECT "id",
                "address",
                "boxId",
                "serialized",
                "spendBlock",
                "extractor",
                "spendHeight",
                "block",
                "height"
            FROM "temporary_box_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_box_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
                RENAME TO "temporary_box_entity"
        `);
  }
}
