import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1746701087234 implements MigrationInterface {
  name = 'migration1746701087234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update block_entity table
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'ergo' 
      WHERE scanner IN ('ergo-node', 'ergo-explorer')
    `);

    // Update block_entity table for cardano
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'cardano' 
      WHERE scanner IN (
        'cardano-BlockFrost',
        'cardano-graphql',
        'cardano-koios',
        'cardano-ogmios'
      )
    `);

    // Update extractor_status_entity table
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'ergo' 
      WHERE scannerId IN ('ergo-node', 'ergo-explorer')
    `);

    // Update extractor_status_entity table for cardano
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'cardano' 
      WHERE scannerId IN (
        'cardano-BlockFrost',
        'cardano-graphql',
        'cardano-koios',
        'cardano-ogmios'
      )
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

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'cardano-koios' 
      WHERE scanner = 'cardano'
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'cardano-koios' 
      WHERE scannerId = 'cardano'
    `);
  }
}
