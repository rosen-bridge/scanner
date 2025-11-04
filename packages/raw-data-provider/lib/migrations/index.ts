import { Migration1762178180934 } from './postgres';
import { Migration1762178166781 } from './sqlite';

export const migrations = {
  postgres: [Migration1762178180934],
  sqlite: [Migration1762178166781],
};
