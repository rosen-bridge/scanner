import { MigrationInterface, QueryRunner } from 'typeorm';
import EventTriggerEntity from '../../entities/EventTriggerEntity';
import { getWidInfo } from '../../utils';

export class migration1703509820315 implements MigrationInterface {
  name = 'migration1703509820315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "WIDsCount" integer NOT NULL DEFAULT 0
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "WIDsHash" character varying NOT NULL DEFAULT ''
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ALTER "WIDsCount" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ALTER "WIDsHash" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity"
            ADD "spendTxId" text
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity"
            ADD "spendIndex" integer
        `);

    // calculate `WIDsCount` and `WIDsHash` columns in `event_trigger_entity`
    const eventRepository =
      queryRunner.connection.getRepository(EventTriggerEntity);
    const events = await eventRepository.find();

    for (const event of events) {
      const { WIDsHash, WIDsCount } = getWidInfo((event as any).WIDs);
      await eventRepository.update({ id: event.id }, { WIDsHash, WIDsCount });
    }

    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "WIDs"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" DROP COLUMN "spendIndex"
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" DROP COLUMN "spendTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "WIDsHash"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "WIDsCount"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "WIDs" character varying NOT NULL
        `);
  }
}
