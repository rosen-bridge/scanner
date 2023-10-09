import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1693308311652 implements MigrationInterface {
  name = 'migration1693308311652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "fraud_entity" (
                "id" SERIAL NOT NULL,
                "boxId" character varying NOT NULL,
                "creationBlock" character varying NOT NULL,
                "creationHeight" integer NOT NULL,
                "creationTxId" character varying NOT NULL,
                "serialized" character varying NOT NULL,
                "triggerBoxId" character varying NOT NULL,
                "wid" character varying NOT NULL,
                "rwtCount" character varying NOT NULL,
                "spendBlock" text,
                "spendHeight" integer,
                "spendTxId" text,
                "extractor" character varying NOT NULL,
                CONSTRAINT "PK_2cf2cfa218dd4a5642bc3f3cf98" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "fraud_entity"
        `);
  }
}
