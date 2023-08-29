import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1693122371215 implements MigrationInterface {
  name = 'migration1693122371215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "fraud_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "boxId" varchar NOT NULL,
                "createBlock" varchar NOT NULL,
                "creationHeight" integer NOT NULL,
                "serialized" varchar NOT NULL,
                "triggerBoxId" varchar NOT NULL,
                "wid" varchar NOT NULL,
                "rwtCount" varchar NOT NULL,
                "spendBlock" text,
                "spendHeight" integer,
                "extractor" varchar NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "fraud_entity"
        `);
  }
}
