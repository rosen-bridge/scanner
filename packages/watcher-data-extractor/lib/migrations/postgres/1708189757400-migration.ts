import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1708189757400 implements MigrationInterface {
  name = 'Migration1708189757400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "collateral_entity" (
                "id" SERIAL NOT NULL,
                "extractor" character varying NOT NULL,
                "boxId" character varying NOT NULL,
                "boxSerialized" character varying NOT NULL,
                "wId" character varying NOT NULL,
                "rwtCount" bigint NOT NULL,
                "txId" character varying NOT NULL,
                "block" character varying,
                "height" integer,
                "spendBlock" text,
                "spendHeight" integer,
                CONSTRAINT "UQ_2d4abc2071df9a2300a5e1b4616" UNIQUE ("boxId", "extractor"),
                CONSTRAINT "PK_e8506252c52632f4741c8415c3f" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "collateral_entity"
        `);
  }
}
