import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1791275463650 implements MigrationInterface {
  name = 'Migration1791275463650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_permit_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "txId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" text,
                "spendIndex" integer,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_205c6c8499dff192ec078910956" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_permit_entity"(
                    "id",
                    "identifier",
                    "block",
                    "height",
                    "txId",
                    "serialized",
                    "WID",
                    "spendBlock",
                    "spendHeight",
                    "spendTxId",
                    "extractor"
                )
            SELECT "id",
                "identifier",
                "block",
                "height",
                "txId",
                "serialized",
                "WID",
                "spendBlock",
                "spendHeight",
                "spendTxId",
                "extractor"
            FROM "permit_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "permit_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_permit_entity"
                RENAME TO "permit_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_collateral_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "txId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "wid" varchar NOT NULL,
                "rwtCount" bigint NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" text,
                "spendIndex" integer,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_2c1e30eb6bd637e71efd9ca683e" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_collateral_entity"(
                    "id",
                    "identifier",
                    "block",
                    "height",
                    "txId",
                    "serialized",
                    "wid",
                    "rwtCount",
                    "spendBlock",
                    "spendHeight",
                    "extractor"
                )
            SELECT "id",
                "identifier",
                "block",
                "height",
                "txId",
                "serialized",
                "wid",
                "rwtCount",
                "spendBlock",
                "spendHeight",
                "extractor"
            FROM "collateral_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "collateral_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_collateral_entity"
                RENAME TO "collateral_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_event_trigger_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL DEFAULT ('Not-set'),
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "extractor" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "txId" varchar NOT NULL,
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
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" text,
                "spendIndex" integer,
                "result" text,
                "paymentTxId" text,
                "WIDsCount" integer NOT NULL,
                "WIDsHash" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                CONSTRAINT "UQ_d88f2963a5dacea7b163f134100" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_event_trigger_entity"(
                    "id",
                    "eventId",
                    "identifier",
                    "block",
                    "height",
                    "extractor",
                    "fromChain",
                    "toChain",
                    "txId",
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
                    "WIDsHash",
                    "serialized"
                )
            SELECT "id",
                "eventId",
                "identifier",
                "block",
                "height",
                "extractor",
                "fromChain",
                "toChain",
                "txId",
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
                "WIDsHash",
                "serialized"
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
            UPDATE "permit_entity"
            SET "spendIndex" = 0,
                "spendTxId" = COALESCE("spendTxId", 'NOT_EXTRACTED_YET')
            WHERE "spendBlock" IS NOT NULL
        `);
    await queryRunner.query(`
            UPDATE "collateral_entity"
            SET "spendIndex" = 0,
                "spendTxId" = COALESCE("spendTxId", 'NOT_EXTRACTED_YET')
            WHERE "spendBlock" IS NOT NULL
        `);
    await queryRunner.query(`
            UPDATE "event_trigger_entity"
            SET "spendIndex" = 0,
                "spendTxId" = COALESCE("spendTxId", 'NOT_EXTRACTED_YET')
            WHERE "spendBlock" IS NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "event_trigger_entity" SET "spendTxId" = NULL
            WHERE "spendTxId" = 'NOT_EXTRACTED_YET'
        `);
    await queryRunner.query(`
            UPDATE "permit_entity" SET "spendTxId" = NULL
            WHERE "spendTxId" = 'NOT_EXTRACTED_YET'
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
                RENAME TO "temporary_event_trigger_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "event_trigger_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL DEFAULT ('Not-set'),
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "extractor" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "txId" varchar NOT NULL,
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
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" text,
                "result" text,
                "paymentTxId" text,
                "WIDsCount" integer NOT NULL,
                "WIDsHash" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                CONSTRAINT "UQ_d88f2963a5dacea7b163f134100" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "event_trigger_entity"(
                    "id",
                    "eventId",
                    "identifier",
                    "block",
                    "height",
                    "extractor",
                    "fromChain",
                    "toChain",
                    "txId",
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
                    "WIDsHash",
                    "serialized"
                )
            SELECT "id",
                "eventId",
                "identifier",
                "block",
                "height",
                "extractor",
                "fromChain",
                "toChain",
                "txId",
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
                "WIDsHash",
                "serialized"
            FROM "temporary_event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_trigger_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "collateral_entity"
                RENAME TO "temporary_collateral_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "collateral_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "txId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "wid" varchar NOT NULL,
                "rwtCount" bigint NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_2c1e30eb6bd637e71efd9ca683e" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "collateral_entity"(
                    "id",
                    "identifier",
                    "block",
                    "height",
                    "txId",
                    "serialized",
                    "wid",
                    "rwtCount",
                    "spendBlock",
                    "spendHeight",
                    "extractor"
                )
            SELECT "id",
                "identifier",
                "block",
                "height",
                "txId",
                "serialized",
                "wid",
                "rwtCount",
                "spendBlock",
                "spendHeight",
                "extractor"
            FROM "temporary_collateral_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_collateral_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
                RENAME TO "temporary_permit_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "permit_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "txId" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "WID" varchar NOT NULL,
                "spendBlock" varchar,
                "spendHeight" integer,
                "spendTxId" varchar,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_2c1e30eb6bd637e71efd9ca683e" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "permit_entity"(
                    "id",
                    "identifier",
                    "block",
                    "height",
                    "txId",
                    "serialized",
                    "WID",
                    "spendBlock",
                    "spendHeight",
                    "spendTxId",
                    "extractor"
                )
            SELECT "id",
                "identifier",
                "block",
                "height",
                "txId",
                "serialized",
                "WID",
                "spendBlock",
                "spendHeight",
                "spendTxId",
                "extractor"
            FROM "temporary_permit_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_permit_entity"
        `);
  }
}
