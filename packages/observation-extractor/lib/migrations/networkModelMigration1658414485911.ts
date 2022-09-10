import { MigrationInterface, QueryRunner } from "typeorm";

export class networkModelMigration1658414485911 implements MigrationInterface{
    name = 'networkModelMigration1658414485911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "observation_entity" 
                    ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, 
                    "fromChain" varchar(30) NOT NULL, 
                    "toChain" varchar(30) NOT NULL, 
                    "fromAddress" varchar NOT NULL, 
                    "toAddress" varchar NOT NULL, 
                    "height" INTEGER NOT NULL, 
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
                )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "observation_entity"`);
    }
}
