import { migration1688545935708 } from './postgres/1688545935708-migration';
import { migration1688555621494 } from './sqlite/1688555621494-migration';

export const migrations = {
  sqlite: [migration1688555621494],
  postgres: [migration1688545935708],
};
