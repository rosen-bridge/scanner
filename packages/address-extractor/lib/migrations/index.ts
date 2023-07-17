import { migration1688558553044 } from './postgres/1688558553044-migration';
import { migration1689151869889 } from './postgres/1689151869889-migration';
import { migration1688555566662 } from './sqlite/1688555566662-migration';
import { migration1689143753142 } from './sqlite/1689143753142-migration';

export const migrations = {
  sqlite: [migration1688555566662, migration1689143753142],
  postgres: [migration1688558553044, migration1689151869889],
};
