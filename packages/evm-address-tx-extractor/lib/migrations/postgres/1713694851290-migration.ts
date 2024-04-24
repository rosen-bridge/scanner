import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1713694851290 implements MigrationInterface {
  name = 'Migration1713694851290';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "address_txs_entity" (
                "id" SERIAL NOT NULL,
                "unsignedHash" character varying NOT NULL,
                "signedHash" character varying NOT NULL,
                "nonce" integer NOT NULL,
                "address" character varying NOT NULL,
                "blockId" character varying NOT NULL,
                "extractor" character varying NOT NULL,
                CONSTRAINT "PK_3d12ab238cb8eed0354cec04ea4" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "address_txs_entity"
        `);
  }
}
