import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1758439835359 implements MigrationInterface {
  name = 'Migration1758439835359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_event_trigger_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL DEFAULT ('Not-set'),
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
                "identifier" varchar NOT NULL,
                CONSTRAINT "UQ_d88f2963a5dacea7b163f134100" UNIQUE ("identifier", "extractor")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_event_trigger_entity"(
                    "id",
                    "eventId",
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
                    "serialized",
                    "identifier"
                )
            SELECT "id",
                "eventId",
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
                "serialized",
                "boxId"
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
            CREATE TABLE "event_trigger_entity" (
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
            INSERT INTO "event_trigger_entity"(
                    "id",
                    "eventId",
                    "boxId",
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
  }
}
