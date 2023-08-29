import { migration1693308311652 } from './postgres/1693308311652-migration';
import { migration1693122371215 } from './sqlite/1693122371215-migration';

export const migrations = {
  sqlite: [migration1693122371215],
  postgres: [migration1693308311652],
};
