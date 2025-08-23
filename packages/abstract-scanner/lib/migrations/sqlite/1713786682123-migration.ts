import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1713786682123 implements MigrationInterface {
  name = 'migration1713786682123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "extractor_status_entity" (
                "scannerId" varchar NOT NULL,
                "extractorId" varchar NOT NULL,
                "updateHeight" integer NOT NULL,
                "updateBlockHash" varchar NOT NULL,
                PRIMARY KEY ("scannerId", "extractorId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "extractor_status_entity"
        `);
  }
}
