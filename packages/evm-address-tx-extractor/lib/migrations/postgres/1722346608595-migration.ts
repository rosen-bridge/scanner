import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1722346608595 implements MigrationInterface {
  name = 'Migration1722346608595';

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
    await queryRunner.query(`
            CREATE TABLE "address_txs_entity" (
                "id" SERIAL NOT NULL,
                "unsignedHash" character varying NOT NULL,
                "signedHash" character varying NOT NULL,
                "nonce" integer NOT NULL,
                "address" character varying NOT NULL,
                "blockId" character varying NOT NULL,
                "extractor" character varying NOT NULL,
                "status" character varying NOT NULL,
                CONSTRAINT "PK_3d12ab238cb8eed0354cec04ea4" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "address_txs_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "extractor_status_entity"
        `);
  }
}
