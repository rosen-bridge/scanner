import { Migration1770648229381 } from './postgres/1770648229381-migration';
import { Migration1770648419211 } from './sqlite/1770648419211-migration';

export const migrations = {
  sqlite: [Migration1770648419211],
  postgres: [Migration1770648229381],
};
