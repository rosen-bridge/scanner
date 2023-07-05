import { migration1688558553044 } from './postgres/1688558553044-migration';
import { migration1688555566662 } from './sqlite/1688555566662-migration';

export const migrations = {
  sqlite: [migration1688555566662],
  postgres: [migration1688558553044],
};
