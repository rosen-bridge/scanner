import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1770648229381 implements MigrationInterface {
  name = 'Migration1770648229381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "reward_entity" (
                "id" SERIAL NOT NULL,
                "block" character varying NOT NULL,
                "height" integer NOT NULL,
                "extractor" character varying NOT NULL,
                "identifier" character varying NOT NULL,
                "serialized" character varying NOT NULL,
                "tokenId" character varying NOT NULL,
                "bridgeFee" bigint NOT NULL,
                "networkFee" bigint NOT NULL,
                "emissionTokenId" character varying NOT NULL,
                "guardsEmission" bigint NOT NULL,
                "watchersEmission" bigint NOT NULL,
                "rewardedWIDsCount" integer NOT NULL,
                "rewardedWIDs" character varying NOT NULL,
                CONSTRAINT "UQ_f791d9b1f1013fe8173296b1524" UNIQUE ("identifier", "extractor"),
                CONSTRAINT "PK_4d86733b11358cd7eda87e9d8b1" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "reward_entity"
        `);
  }
}
