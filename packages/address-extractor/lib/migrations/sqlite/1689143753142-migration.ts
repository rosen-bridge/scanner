import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1689143753142 implements MigrationInterface {
  name = 'migration1689143753142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_box_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "address" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "createBlock" varchar NOT NULL,
                "creationHeight" integer NOT NULL,
                "serialized" varchar NOT NULL,
                "spendBlock" text,
                "extractor" varchar NOT NULL,
                "spendHeight" integer
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_box_entity"(
                    "id",
                    "address",
                    "boxId",
                    "createBlock",
                    "creationHeight",
                    "serialized",
                    "spendBlock",
                    "extractor"
                )
            SELECT "id",
                "address",
                "boxId",
                "createBlock",
                "creationHeight",
                "serialized",
                "spendBlock",
                "extractor"
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
            CREATE TABLE "box_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "address" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "createBlock" varchar NOT NULL,
                "creationHeight" integer NOT NULL,
                "serialized" varchar NOT NULL,
                "spendBlock" text,
                "extractor" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "box_entity"(
                    "id",
                    "address",
                    "boxId",
                    "createBlock",
                    "creationHeight",
                    "serialized",
                    "spendBlock",
                    "extractor"
                )
            SELECT "id",
                "address",
                "boxId",
                "createBlock",
                "creationHeight",
                "serialized",
                "spendBlock",
                "extractor"
            FROM "temporary_box_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_box_entity"
        `);
  }
}
