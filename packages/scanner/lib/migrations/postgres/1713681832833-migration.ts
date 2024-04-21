import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1713681832833 implements MigrationInterface {
  name = 'Migration1713681832833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "extractor_status_entity" (
                "extractorId" character varying NOT NULL,
                "updateHeight" integer NOT NULL,
                CONSTRAINT "PK_2dc3cb25b6890abfdfe8437c209" PRIMARY KEY ("extractorId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "extractor_status_entity"
        `);
  }
}
