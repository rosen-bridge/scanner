import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1708175020320 implements MigrationInterface {
  name = 'Migration1708175020320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "collateral_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "extractor" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "boxSerialized" varchar NOT NULL,
                "wId" varchar NOT NULL,
                "rwtCount" bigint NOT NULL,
                "txId" varchar NOT NULL,
                "block" varchar,
                "height" integer,
                "spendBlock" text,
                "spendHeight" integer,
                CONSTRAINT "UQ_2d4abc2071df9a2300a5e1b4616" UNIQUE ("boxId", "extractor")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "collateral_entity"
        `);
  }
}
