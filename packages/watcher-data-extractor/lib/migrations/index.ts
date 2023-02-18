import { initMigration1659787165000 } from './sqlite/initMigration1659787165000';
import { initMigration1671716035915 } from './postgres/initMigration1671716035915';
import { migration1673422203210 } from './sqlite/migration1673422203210';
import { migration1673422203223 } from './postgres/migration1673422203223';
import { migration1676360753347 } from './sqlite/migration1676360753347';
import { migration1676360759874 } from './postgres/migration1676360759874';

export const migrations = {
  sqlite: [
    initMigration1659787165000,
    migration1673422203210,
    migration1676360753347,
  ],
  postgres: [
    initMigration1671716035915,
    migration1673422203223,
    migration1676360759874,
  ],
};
