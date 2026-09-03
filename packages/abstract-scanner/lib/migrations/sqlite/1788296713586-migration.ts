import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class migration1788296713586 implements MigrationInterface {
  name = 'migration1788296713586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_block_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "height" integer NOT NULL,
                "hash" varchar NOT NULL,
                "parentHash" varchar NOT NULL,
                "status" varchar NOT NULL,
                "extra" varchar,
                "scanner" varchar NOT NULL,
                "timestamp" integer NOT NULL,
                "year" integer,
                "month" integer,
                "day" integer,
                CONSTRAINT "UQ_7e20625b11840edf7f120565c3d" UNIQUE ("parentHash", "scanner"),
                CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2" UNIQUE ("hash", "scanner"),
                CONSTRAINT "UQ_521d830047d5fe08988538289dd" UNIQUE ("scanner", "height")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_block_entity"(
                    "id",
                    "height",
                    "hash",
                    "parentHash",
                    "status",
                    "extra",
                    "scanner",
                    "timestamp",
                    "year",
                    "month",
                    "day"
                )
            SELECT "id",
                "height",
                "hash",
                "parentHash",
                "status",
                "extra",
                "scanner",
                "timestamp",
                "year",
                "month",
                "day"
            FROM "block_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "block_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_block_entity"
                RENAME TO "block_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entity"
                RENAME TO "temporary_block_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "block_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "height" integer NOT NULL,
                "hash" varchar NOT NULL,
                "parentHash" varchar NOT NULL,
                "status" varchar NOT NULL,
                "extra" varchar,
                "scanner" varchar NOT NULL,
                "timestamp" integer NOT NULL,
                "year" integer,
                "month" integer,
                "day" integer,
                CONSTRAINT "UQ_521d830047d5fe08988538289dd" UNIQUE ("height", "scanner"),
                CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2" UNIQUE ("hash", "scanner"),
                CONSTRAINT "UQ_7e20625b11840edf7f120565c3d" UNIQUE ("parentHash", "scanner")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "block_entity"(
                    "id",
                    "height",
                    "hash",
                    "parentHash",
                    "status",
                    "extra",
                    "scanner",
                    "timestamp",
                    "year",
                    "month",
                    "day"
                )
            SELECT "id",
                "height",
                "hash",
                "parentHash",
                "status",
                "extra",
                "scanner",
                "timestamp",
                "year",
                "month",
                "day"
            FROM "temporary_block_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_block_entity"
        `);
  }
}
