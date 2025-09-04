import { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

export class migration1746701087234 implements MigrationInterface {
  name = 'migration1746701087234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update block_entity table
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'ergo' 
      WHERE scanner IN ('ergo-node', 'ergo-explorer')
    `);

    // Update extractor_status_entity table
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'ergo' 
      WHERE scannerId IN ('ergo-node', 'ergo-explorer')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert block_entity table
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'ergo-node' 
      WHERE scanner = 'ergo'
    `);

    // Revert extractor_status_entity table
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'ergo-node' 
      WHERE scannerId = 'ergo'
    `);
  }
}
