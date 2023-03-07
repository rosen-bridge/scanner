import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1678177462103 implements MigrationInterface {
  name = 'migration1678177462103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "temporary_event_trigger_entity" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "extractor" varchar NOT NULL,
            "boxId" varchar NOT NULL,
            "boxSerialized" varchar NOT NULL,
            "block" varchar NOT NULL,
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
            "sourceBlockId" varchar NOT NULL,
            "sourceTxId" varchar NOT NULL,
            "height" integer NOT NULL,
            "WIDs" varchar NOT NULL,
            "spendBlock" varchar,
            "spendHeight" integer,
            "eventId" varchar NOT NULL DEFAULT ('Not-set'),
            CONSTRAINT "UQ_c905f221a1b6271ca4405dbbe5f" UNIQUE ("boxId", "extractor")
        )
    `);
    await queryRunner.query(`
        INSERT INTO "temporary_event_trigger_entity"(
                "id",
                "extractor",
                "boxId",
                "boxSerialized",
                "block",
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
                "sourceBlockId",
                "sourceTxId",
                "height",
                "WIDs",
                "spendBlock",
                "spendHeight",
                "eventId"
            )
        SELECT "id",
            "extractor",
            "boxId",
            "boxSerialized",
            "block",
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
            "sourceBlockId",
            "sourceTxId",
            "height",
            "WIDs",
            "spendBlock",
            "spendHeight",
            "eventId"
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
            "extractor" varchar NOT NULL,
            "boxId" varchar NOT NULL,
            "boxSerialized" varchar NOT NULL,
            "block" varchar NOT NULL,
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
            "sourceBlockId" varchar NOT NULL,
            "sourceTxId" varchar NOT NULL,
            "height" integer NOT NULL,
            "WIDs" varchar NOT NULL,
            "spendBlock" varchar,
            "spendHeight" integer,
            "eventId" varchar,
            CONSTRAINT "UQ_c905f221a1b6271ca4405dbbe5f" UNIQUE ("boxId", "extractor")
        )
    `);
    await queryRunner.query(`
        INSERT INTO "event_trigger_entity"(
                "id",
                "extractor",
                "boxId",
                "boxSerialized",
                "block",
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
                "sourceBlockId",
                "sourceTxId",
                "height",
                "WIDs",
                "spendBlock",
                "spendHeight",
                "eventId"
            )
        SELECT "id",
            "extractor",
            "boxId",
            "boxSerialized",
            "block",
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
            "sourceBlockId",
            "sourceTxId",
            "height",
            "WIDs",
            "spendBlock",
            "spendHeight",
            "eventId"
        FROM "temporary_event_trigger_entity"
    `);
    await queryRunner.query(`
        DROP TABLE "temporary_event_trigger_entity"
    `);
  }
}
