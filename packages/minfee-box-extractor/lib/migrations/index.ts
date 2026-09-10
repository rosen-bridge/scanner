import { Migration1789048116200 } from './postgres/1789048116200-migration';
import { Migration1789048116110 } from './sqlite/1789048116110-migration';

export const migrations = {
  sqlite: [Migration1789048116110],
  postgres: [Migration1789048116200],
};
