import { initMigration1659787165000 } from './sqlite/initMigration1659787165000';
import { initMigration1671716035915 } from './postgres/initMigration1671716035915';

export const migrations = {
  sqlite: [initMigration1659787165000],
  postgres: [initMigration1671716035915],
};
