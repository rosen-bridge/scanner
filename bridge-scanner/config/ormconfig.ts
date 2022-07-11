import path from 'path';
import { DataSource } from "typeorm";
import { fileURLToPath } from 'url';
import { commitmentEntities } from "../lib/entities";
import { migrations } from "../lib/migrations";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const bridgeOrmConfig = new DataSource({
    type: "sqlite",
    database: __dirname + "/../sqlite/bridgeWatcher.sqlite",
    entities: commitmentEntities,
    migrations: migrations,
    synchronize: false,
    logging: false,
});
