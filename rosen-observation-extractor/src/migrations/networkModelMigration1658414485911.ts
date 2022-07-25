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
                    "amount" varchar NOT NULL, 
                    "networkFee" varchar NOT NULL, 
                    "bridgeFee" varchar NOT NULL, 
                    "sourceChainTokenId" varchar NOT NULL, 
                    "targetChainTokenId" varchar NOT NULL, 
                    "sourceTxId" varchar NOT NULL, 
                    "sourceBlockId" varchar NOT NULL, 
                    "requestId" varchar NOT NULL, 
                    "block" varchar NOT NULL,
                    CONSTRAINT "UQ_f0af4ab9dd56c983ce8a83adcbf" UNIQUE ("requestId") 
                )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "observation_entity"`);
    }
}
