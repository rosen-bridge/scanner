import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1688545935708 implements MigrationInterface {
  name = 'migration1688545935708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "observation_entity" (
                "id" SERIAL NOT NULL,
                "fromChain" character varying(30) NOT NULL,
                "toChain" character varying(30) NOT NULL,
                "fromAddress" character varying NOT NULL,
                "toAddress" character varying NOT NULL,
                "height" integer NOT NULL,
                "amount" character varying NOT NULL,
                "networkFee" character varying NOT NULL,
                "bridgeFee" character varying NOT NULL,
                "sourceChainTokenId" character varying NOT NULL,
                "targetChainTokenId" character varying NOT NULL,
                "sourceTxId" character varying NOT NULL,
                "sourceBlockId" character varying NOT NULL,
                "requestId" character varying NOT NULL,
                "block" character varying NOT NULL,
                "extractor" character varying NOT NULL,
                CONSTRAINT "UQ_a871fab5aa20b9306e13a057924" UNIQUE ("requestId", "extractor"),
                CONSTRAINT "PK_1192341f36ee5eb313976dc1ae2" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "observation_entity"
        `);
  }
}
