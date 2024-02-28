import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1709058785649 implements MigrationInterface {
  name = 'Migration1709058785649';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
                "spendBlock" text,
                "spendHeight" integer,
                "spendTxId" text,
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
