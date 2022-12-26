import { boxEntity1659770552000 } from './sqlite/boxEntity1659770552000';
import { boxEntity1671714075083 } from './postgres/boxEntity1671714075083';

export const migrations = {
  sqlite: [boxEntity1659770552000],
  postgres: [boxEntity1671714075083],
};
