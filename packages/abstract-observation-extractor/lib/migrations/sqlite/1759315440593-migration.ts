import { MigrationInterface, QueryRunner } from "@rosen-bridge/extended-typeorm";

export class Migration1759315440593 implements MigrationInterface {
    name = 'Migration1759315440593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "temporary_observation_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar(30) NOT NULL,
                "toChain" varchar(30) NOT NULL,
                "fromAddress" varchar NOT NULL,
                "toAddress" varchar NOT NULL,
                "height" integer NOT NULL,
                "amount" varchar NOT NULL,
                "networkFee" varchar NOT NULL,
                "bridgeFee" varchar NOT NULL,
                "sourceChainTokenId" varchar NOT NULL,
                "targetChainTokenId" varchar NOT NULL,
                "sourceTxId" varchar NOT NULL,
                "sourceBlockId" varchar NOT NULL,
                "requestId" varchar NOT NULL,
                "block" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                "rawData" varchar NOT NULL DEFAULT '',
                CONSTRAINT "UQ_a871fab5aa20b9306e13a057924" UNIQUE ("requestId", "extractor")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_observation_entity"(
                    "id",
                    "fromChain",
                    "toChain",
                    "fromAddress",
                    "toAddress",
                    "height",
                    "amount",
                    "networkFee",
                    "bridgeFee",
                    "sourceChainTokenId",
                    "targetChainTokenId",
                    "sourceTxId",
                    "sourceBlockId",
                    "requestId",
                    "block",
                    "extractor"
                )
            SELECT "id",
                "fromChain",
                "toChain",
                "fromAddress",
                "toAddress",
                "height",
                "amount",
                "networkFee",
                "bridgeFee",
                "sourceChainTokenId",
                "targetChainTokenId",
                "sourceTxId",
                "sourceBlockId",
                "requestId",
                "block",
                "extractor"
            FROM "observation_entity"
        `);
        await queryRunner.query(`
            DROP TABLE "observation_entity"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_observation_entity"
                RENAME TO "observation_entity"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "observation_entity"
                RENAME TO "temporary_observation_entity"
        `);
        await queryRunner.query(`
            CREATE TABLE "observation_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar(30) NOT NULL,
                "toChain" varchar(30) NOT NULL,
                "fromAddress" varchar NOT NULL,
                "toAddress" varchar NOT NULL,
                "height" integer NOT NULL,
                "amount" varchar NOT NULL,
                "networkFee" varchar NOT NULL,
                "bridgeFee" varchar NOT NULL,
                "sourceChainTokenId" varchar NOT NULL,
                "targetChainTokenId" varchar NOT NULL,
                "sourceTxId" varchar NOT NULL,
                "sourceBlockId" varchar NOT NULL,
                "requestId" varchar NOT NULL,
                "block" varchar NOT NULL,
                "extractor" varchar NOT NULL,
                CONSTRAINT "UQ_a871fab5aa20b9306e13a057924" UNIQUE ("requestId", "extractor")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "observation_entity"(
                    "id",
                    "fromChain",
                    "toChain",
                    "fromAddress",
                    "toAddress",
                    "height",
                    "amount",
                    "networkFee",
                    "bridgeFee",
                    "sourceChainTokenId",
                    "targetChainTokenId",
                    "sourceTxId",
                    "sourceBlockId",
                    "requestId",
                    "block",
                    "extractor"
                )
            SELECT "id",
                "fromChain",
                "toChain",
                "fromAddress",
                "toAddress",
                "height",
                "amount",
                "networkFee",
                "bridgeFee",
                "sourceChainTokenId",
                "targetChainTokenId",
                "sourceTxId",
                "sourceBlockId",
                "requestId",
                "block",
                "extractor"
            FROM "temporary_observation_entity"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_observation_entity"
        `);
    }

}
