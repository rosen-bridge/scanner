import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1688555766601 implements MigrationInterface {
  name = 'migration1688555766601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "event_trigger_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL DEFAULT ('Not-set'),
                "txId" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "boxSerialized" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "fromAddress" varchar NOT NULL,
                "toAddress" varchar NOT NULL,
                "amount" varchar NOT NULL,
                "bridgeFee" varchar NOT NULL,
                "networkFee" varchar NOT NULL,
                "sourceChainTokenId" varchar NOT NULL,
                "sourceChainHeight" integer NOT NULL,
                "targetChainTokenId" varchar NOT NULL,
                "sourceTxId" varchar NOT NULL,
                "sourceBlockId" varchar NOT NULL,
                "WIDs" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" varchar,
                CONSTRAINT "UQ_c905f221a1b6271ca4405dbbe5f" UNIQUE ("boxId", "extractor")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "commitment_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "txId" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "eventId" varchar NOT NULL,
                "commitment" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "boxSerialized" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "rwtCount" varchar,
                CONSTRAINT "UQ_cc294fc304a66f8f194840f1ece" UNIQUE ("boxId", "extractor")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "permit_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "extractor" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "boxSerialized" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "txId" varchar NOT NULL,
                CONSTRAINT "UQ_d3226602b909b64bcaeadc39c3c" UNIQUE ("boxId", "extractor")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "permit_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "commitment_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_trigger_entity"
        `);
  }
}
