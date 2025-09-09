import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1737547743177 implements MigrationInterface {
  name = 'Migration1737547743177';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_event_trigger_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL DEFAULT ('Not-set'),
                "boxId" varchar NOT NULL,
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
                "spendTxId" varchar,
                "result" varchar,
                "paymentTxId" varchar,
                "WIDsCount" integer NOT NULL,
                "WIDsHash" varchar NOT NULL,
                "serialized" varchar NOT NULL,
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
                    "WIDsHash",
                    "serialized"
                )
            SELECT "id",
                "eventId",
                "txId",
                "extractor",
                "boxId",
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
                "WIDsHash",
                "boxSerialized"
            FROM "event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_trigger_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_event_trigger_entity"
                RENAME TO "event_trigger_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
                "WIDsCount" integer NOT NULL,
                "WIDsHash" varchar NOT NULL,
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
                    "WIDsHash",
                    "boxSerialized"
                )
            SELECT "id",
                "eventId",
                "txId",
                "extractor",
                "boxId",
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
                "WIDsHash",
                "serialized"
            FROM "temporary_event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_trigger_entity"
        `);
  }
}
