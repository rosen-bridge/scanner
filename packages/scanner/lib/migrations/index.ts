import { migration1688545690867 } from './postgres/1688545690867-migration';
import { migration1688555497475 } from './sqlite/1688555497475-migration';
import { Migration1713678251901 } from './sqlite/1713678251901-migration';

export const migrations = {
  sqlite: [migration1688555497475, Migration1713678251901],
  postgres: [migration1688545690867],
};
