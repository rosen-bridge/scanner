import { MigrationInterface, QueryRunner } from 'typeorm';
import { getWidInfo } from '../../utils';

export class migration1706610773176 implements MigrationInterface {
  name = 'migration1706610773176';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // get all events before removing WIDs column
    const events = await queryRunner.query(`
            SELECT "id", "WIDs" from "event_trigger_entity"
        `);

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
                "spendBlock" text,
                "spendHeight" integer,
                "spendTxId" text,
                "result" text,
                "paymentTxId" text,
                "WIDsCount" integer NOT NULL,
                "WIDsHash" varchar NOT NULL,
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
                    "spendBlock",
                    "spendHeight",
                    "spendTxId",
                    "result",
                    "paymentTxId",
                    "WIDsCount",
                    "WIDsHash"
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
                "spendBlock",
                "spendHeight",
                "spendTxId",
                "result",
                "paymentTxId",
                0,
                ''
            FROM "event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_trigger_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_event_trigger_entity"
                RENAME TO "event_trigger_entity"
        `);

    // calculate `WIDsCount` and `WIDsHash` columns in `event_trigger_entity`
    for (const event of events) {
      const { WIDsHash, WIDsCount } = getWidInfo((event as any).WIDs);
      await queryRunner.query(`
              UPDATE "event_trigger_entity"
              SET "WIDsHash" = '${WIDsHash}', "WIDsCount" = '${WIDsCount}'
              WHERE "id" = ${event.id}
          `);
    }

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
                "spendTxId" text,
                "spendIndex" integer,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
                "spendBlock" text,
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
                "spendBlock" text,
                "spendHeight" integer,
                "spendTxId" text,
                "result" text,
                "paymentTxId" text,
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
                    "spendBlock",
                    "spendHeight",
                    "spendTxId",
                    "result",
                    "paymentTxId"
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
                "spendBlock",
                "spendHeight",
                "spendTxId",
                "result",
                "paymentTxId"
            FROM "temporary_event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_trigger_entity"
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
                "spendBlock" text,
                "spendHeight" integer,
                "spendTxId" text,
                "result" text,
                "paymentTxId" text,
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
                    "spendBlock",
                    "spendHeight",
                    "spendTxId",
                    "result",
                    "paymentTxId",
                    "WIDs"
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
                "spendBlock",
                "spendHeight",
                "spendTxId",
                "result",
                "paymentTxId",
                ''
            FROM "temporary_event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_trigger_entity"
        `);
  }
}
