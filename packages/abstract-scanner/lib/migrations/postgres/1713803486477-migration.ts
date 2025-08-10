import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1713803486477 implements MigrationInterface {
  name = 'migration1713803486477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "extractor_status_entity" (
                "scannerId" character varying NOT NULL,
                "extractorId" character varying NOT NULL,
                "updateHeight" integer NOT NULL,
                "updateBlockHash" character varying NOT NULL,
                CONSTRAINT "PK_74b8d00f8f0bbfc3814ef77e07e" PRIMARY KEY ("scannerId", "extractorId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "extractor_status_entity"
        `);
  }
}
