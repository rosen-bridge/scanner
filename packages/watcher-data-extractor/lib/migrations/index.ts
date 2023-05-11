import { migration1683776215472 } from './sqlite/1683776215472-migration';
import { migration1683776413304 } from './postgres/1683776413304-migration';

export const migrations = {
  sqlite: [migration1683776215472],
  postgres: [migration1683776413304],
};
