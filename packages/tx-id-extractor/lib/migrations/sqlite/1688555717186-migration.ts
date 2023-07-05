import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1688555717186 implements MigrationInterface {
  name = 'migration1688555717186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "tx_id_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "txId" varchar NOT NULL,
                "blockId" varchar NOT NULL,
                "extractor" varchar NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "tx_id_entity"
        `);
  }
}
