import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1789048116200 implements MigrationInterface {
  name = 'Migration1789048116200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "minfee_box_entity" (
                "id" SERIAL NOT NULL,
                "block" character varying NOT NULL,
                "height" integer NOT NULL,
                "extractor" character varying NOT NULL,
                "identifier" character varying NOT NULL,
                "serialized" character varying NOT NULL,
                "spendBlock" character varying,
                "spendHeight" integer,
                "token" character varying,
                CONSTRAINT "UQ_c6c8659b5b4bdd6e2e5e59f1d1e" UNIQUE ("identifier", "extractor"),
                CONSTRAINT "PK_9b6e0163f0d0e0f5f6d99e0b7f0" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "minfee_box_entity"
        `);
  }
}
