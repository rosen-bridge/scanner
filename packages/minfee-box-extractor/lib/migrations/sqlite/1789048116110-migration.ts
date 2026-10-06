import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1789048116110 implements MigrationInterface {
  name = 'Migration1789048116110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "minfee_box_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "extractor" varchar NOT NULL,
                "identifier" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" text,
                "spendIndex" integer,
                "token" varchar NOT NULL,
                "R4" varchar NOT NULL,
                "R5" varchar NOT NULL,
                "R6" varchar NOT NULL,
                "R7" varchar NOT NULL,
                "R8" varchar NOT NULL,
                "R9" varchar NOT NULL,
                CONSTRAINT "UQ_d411bef8531285c296e9841b24e" UNIQUE ("identifier", "extractor")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "minfee_box_entity"
        `);
  }
}
