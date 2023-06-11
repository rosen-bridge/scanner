import { migration1683776215472 } from './sqlite/1683776215472-migration';
import { migration1685962565687 } from './sqlite/1685962565687-migration';
import { migration1683776413304 } from './postgres/1683776413304-migration';
import { migration1685962243297 } from './postgres/1685962243297-migration';

export const migrations = {
  sqlite: [migration1683776215472, migration1685962565687],
  postgres: [migration1683776413304, migration1685962243297],
};
