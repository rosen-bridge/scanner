import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1689175103163 implements MigrationInterface {
  name = 'migration1689175103163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_event_trigger_entity" (
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
                "spendBlock" text,
                "spendHeight" integer,
                "spendTxId" varchar,
                CONSTRAINT "UQ_c905f221a1b6271ca4405dbbe5f" UNIQUE ("boxId", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_event_trigger_entity"(
                    "id",
                    "eventId",
                    "txId",
                    "extractor",
                    "boxId",
                    "boxSerialized",
                    "block",
                    "height",
                    "fromChain",
                    "toChain",
                    "fromAddress",
                    "toAddress",
                    "amount",
                    "bridgeFee",
                    "networkFee",
                    "sourceChainTokenId",
                    "sourceChainHeight",
                    "targetChainTokenId",
                    "sourceTxId",
                    "sourceBlockId",
                    "WIDs",
                    "spendBlock",
                    "spendHeight",
                    "spendTxId"
                )
            SELECT "id",
                "eventId",
                "txId",
                "extractor",
                "boxId",
                "boxSerialized",
                "block",
                "height",
                "fromChain",
                "toChain",
                "fromAddress",
                "toAddress",
                "amount",
                "bridgeFee",
                "networkFee",
                "sourceChainTokenId",
                "sourceChainHeight",
                "targetChainTokenId",
                "sourceTxId",
                "sourceBlockId",
                "WIDs",
                "spendBlock",
                "spendHeight",
                "spendTxId"
            FROM "event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_trigger_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_event_trigger_entity"
                RENAME TO "event_trigger_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_commitment_entity" (
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
                "spendBlock" text,
                "spendHeight" integer,
                "rwtCount" varchar,
                CONSTRAINT "UQ_cc294fc304a66f8f194840f1ece" UNIQUE ("boxId", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_commitment_entity"(
                    "id",
                    "txId",
                    "extractor",
                    "eventId",
                    "commitment",
                    "WID",
                    "boxId",
                    "block",
                    "height",
                    "boxSerialized",
                    "spendBlock",
                    "spendHeight",
                    "rwtCount"
                )
            SELECT "id",
                "txId",
                "extractor",
                "eventId",
                "commitment",
                "WID",
                "boxId",
                "block",
                "height",
                "boxSerialized",
                "spendBlock",
                "spendHeight",
                "rwtCount"
            FROM "commitment_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "commitment_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_commitment_entity"
                RENAME TO "commitment_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_permit_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "extractor" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "boxSerialized" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "spendBlock" text,
                "spendHeight" integer,
                "txId" varchar NOT NULL,
                CONSTRAINT "UQ_d3226602b909b64bcaeadc39c3c" UNIQUE ("boxId", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_permit_entity"(
                    "id",
                    "extractor",
                    "boxId",
                    "boxSerialized",
                    "WID",
                    "block",
                    "height",
                    "spendBlock",
                    "spendHeight",
                    "txId"
                )
            SELECT "id",
                "extractor",
                "boxId",
                "boxSerialized",
                "WID",
                "block",
                "height",
                "spendBlock",
                "spendHeight",
                "txId"
            FROM "permit_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "permit_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_permit_entity"
                RENAME TO "permit_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
                RENAME TO "temporary_permit_entity"
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
    await queryRunner.query(`
            INSERT INTO "permit_entity"(
                    "id",
                    "extractor",
                    "boxId",
                    "boxSerialized",
                    "WID",
                    "block",
                    "height",
                    "spendBlock",
                    "spendHeight",
                    "txId"
                )
            SELECT "id",
                "extractor",
                "boxId",
                "boxSerialized",
                "WID",
                "block",
                "height",
                "spendBlock",
                "spendHeight",
                "txId"
            FROM "temporary_permit_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_permit_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity"
                RENAME TO "temporary_commitment_entity"
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
            INSERT INTO "commitment_entity"(
                    "id",
                    "txId",
                    "extractor",
                    "eventId",
                    "commitment",
                    "WID",
                    "boxId",
                    "block",
                    "height",
                    "boxSerialized",
                    "spendBlock",
                    "spendHeight",
                    "rwtCount"
                )
            SELECT "id",
                "txId",
                "extractor",
                "eventId",
                "commitment",
                "WID",
                "boxId",
                "block",
                "height",
                "boxSerialized",
                "spendBlock",
                "spendHeight",
                "rwtCount"
            FROM "temporary_commitment_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_commitment_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
                RENAME TO "temporary_event_trigger_entity"
        `);
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
            INSERT INTO "event_trigger_entity"(
                    "id",
                    "eventId",
                    "txId",
                    "extractor",
                    "boxId",
                    "boxSerialized",
                    "block",
                    "height",
                    "fromChain",
                    "toChain",
                    "fromAddress",
                    "toAddress",
                    "amount",
                    "bridgeFee",
                    "networkFee",
                    "sourceChainTokenId",
                    "sourceChainHeight",
                    "targetChainTokenId",
                    "sourceTxId",
                    "sourceBlockId",
                    "WIDs",
                    "spendBlock",
                    "spendHeight",
                    "spendTxId"
                )
            SELECT "id",
                "eventId",
                "txId",
                "extractor",
                "boxId",
                "boxSerialized",
                "block",
                "height",
                "fromChain",
                "toChain",
                "fromAddress",
                "toAddress",
                "amount",
                "bridgeFee",
                "networkFee",
                "sourceChainTokenId",
                "sourceChainHeight",
                "targetChainTokenId",
                "sourceTxId",
                "sourceBlockId",
                "WIDs",
                "spendBlock",
                "spendHeight",
                "spendTxId"
            FROM "temporary_event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_trigger_entity"
        `);
  }
}
