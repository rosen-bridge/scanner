import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1713678251901 implements MigrationInterface {
  name = 'Migration1713678251901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "extractor_status_entity" (
                "extractorId" varchar PRIMARY KEY NOT NULL,
                "updateHeight" integer NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "extractor_status_entity"
        `);
  }
}
