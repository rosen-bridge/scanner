import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1683776413304 implements MigrationInterface {
  name = 'migration1683776413304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "commitment_entity" (
                "id" SERIAL NOT NULL,
                "txId" character varying NOT NULL,
                "extractor" character varying NOT NULL,
                "eventId" character varying NOT NULL,
                "commitment" character varying NOT NULL,
                "WID" character varying NOT NULL,
                "boxId" character varying NOT NULL,
                "block" character varying NOT NULL,
                "height" integer NOT NULL,
                "boxSerialized" character varying NOT NULL,
                "spendBlock" character varying,
                "spendHeight" integer,
                "rwtCount" character varying,
                CONSTRAINT "UQ_cc294fc304a66f8f194840f1ece" UNIQUE ("boxId", "extractor"),
                CONSTRAINT "PK_eebaa301006c443985916edfe0c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_trigger_entity" (
                "id" SERIAL NOT NULL,
                "eventId" character varying NOT NULL DEFAULT 'Not-set',
                "txId" character varying NOT NULL,
                "extractor" character varying NOT NULL,
                "boxId" character varying NOT NULL,
                "boxSerialized" character varying NOT NULL,
                "block" character varying NOT NULL,
                "height" integer NOT NULL,
                "fromChain" character varying NOT NULL,
                "toChain" character varying NOT NULL,
                "fromAddress" character varying NOT NULL,
                "toAddress" character varying NOT NULL,
                "amount" character varying NOT NULL,
                "bridgeFee" character varying NOT NULL,
                "networkFee" character varying NOT NULL,
                "sourceChainTokenId" character varying NOT NULL,
                "sourceChainHeight" integer NOT NULL,
                "targetChainTokenId" character varying NOT NULL,
                "sourceTxId" character varying NOT NULL,
                "sourceBlockId" character varying NOT NULL,
                "WIDs" character varying NOT NULL,
                "spendBlock" character varying,
                "spendHeight" integer,
                "spendTxId" character varying,
                CONSTRAINT "UQ_c905f221a1b6271ca4405dbbe5f" UNIQUE ("boxId", "extractor"),
                CONSTRAINT "PK_bcecfc8fa47ed7af65cdcefcfb2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "permit_entity" (
                "id" SERIAL NOT NULL,
                "extractor" character varying NOT NULL,
                "boxId" character varying NOT NULL,
                "boxSerialized" character varying NOT NULL,
                "WID" character varying NOT NULL,
                "block" character varying NOT NULL,
                "height" integer NOT NULL,
                "spendBlock" character varying,
                "spendHeight" integer,
                CONSTRAINT "UQ_d3226602b909b64bcaeadc39c3c" UNIQUE ("boxId", "extractor"),
                CONSTRAINT "PK_326e9f1a5442266ee38175eeab9" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "permit_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_trigger_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "commitment_entity"
        `);
  }
}
