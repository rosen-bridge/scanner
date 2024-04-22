import { migration1688545690867 } from './postgres/1688545690867-migration';
import { Migration1713803486477 } from './postgres/1713803486477-migration';
import { migration1688555497475 } from './sqlite/1688555497475-migration';
import { Migration1713786682123 } from './sqlite/1713786682123-migration';

export const migrations = {
  sqlite: [migration1688555497475, Migration1713786682123],
  postgres: [migration1688545690867, Migration1713803486477],
};
