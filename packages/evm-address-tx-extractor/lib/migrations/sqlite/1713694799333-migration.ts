import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1713694799333 implements MigrationInterface {
  name = 'Migration1713694799333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "address_txs_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "unsignedHash" varchar NOT NULL,
                "signedHash" varchar NOT NULL,
                "nonce" integer NOT NULL,
                "address" varchar NOT NULL,
                "blockId" varchar NOT NULL,
                "extractor" varchar NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "address_txs_entity"
        `);
  }
}
