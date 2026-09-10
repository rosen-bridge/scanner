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
                "token" varchar NOT NULL,
                CONSTRAINT "UQ_c6c8659b5b4bdd6e2e5e59f1d1e" UNIQUE ("identifier", "extractor")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "minfee_box_entity"
        `);
  }
}
