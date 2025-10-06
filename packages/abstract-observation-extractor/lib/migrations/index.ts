import { migration1688545935708 } from './postgres/1688545935708-migration';
import { Migration1759307285120 } from './postgres/1759307285120-migration';
import { migration1688555621494 } from './sqlite/1688555621494-migration';
import { Migration1759315440593 } from './sqlite/1759315440593-migration';

export const migrations = {
  sqlite: [migration1688555621494, Migration1759315440593],
  postgres: [migration1688545935708, Migration1759307285120],
};
