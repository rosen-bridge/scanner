import path from 'path';
import { DataSource } from "typeorm";
import { entities } from "../lib/entities";
import { migrations } from "../lib/migrations";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const cardanoOrmConfig = new DataSource({
    type: "sqlite",
    database: __dirname + "/../sqlite/cardanoWatcher.sqlite",
    entities: entities,
    migrations: migrations,
    synchronize: false,
    logging: false,
});
