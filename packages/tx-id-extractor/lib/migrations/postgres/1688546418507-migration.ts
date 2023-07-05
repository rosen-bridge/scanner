import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1688546418507 implements MigrationInterface {
  name = 'migration1688546418507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "tx_id_entity" (
                "id" SERIAL NOT NULL,
                "txId" character varying NOT NULL,
                "blockId" character varying NOT NULL,
                "extractor" character varying NOT NULL,
                CONSTRAINT "PK_1948ce2a252592c6792ea234de9" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "tx_id_entity"
        `);
  }
}
