import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1722346500068 implements MigrationInterface {
  name = 'Migration1722346500068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_address_txs_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "unsignedHash" varchar NOT NULL,
                "signedHash" varchar NOT NULL,
                "nonce" integer NOT NULL,
                "address" varchar NOT NULL,
                "blockId" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "status" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_address_txs_entity"(
                    "id",
                    "unsignedHash",
                    "signedHash",
                    "nonce",
                    "address",
                    "blockId",
                    "extractor"
                )
            SELECT "id",
                "unsignedHash",
                "signedHash",
                "nonce",
                "address",
                "blockId",
                "extractor"
            FROM "address_txs_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "address_txs_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_address_txs_entity"
                RENAME TO "address_txs_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "address_txs_entity"
                RENAME TO "temporary_address_txs_entity"
        `);
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
    await queryRunner.query(`
            INSERT INTO "address_txs_entity"(
                    "id",
                    "unsignedHash",
                    "signedHash",
                    "nonce",
                    "address",
                    "blockId",
                    "extractor"
                )
            SELECT "id",
                "unsignedHash",
                "signedHash",
                "nonce",
                "address",
                "blockId",
                "extractor"
            FROM "temporary_address_txs_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_address_txs_entity"
        `);
  }
}
