import { DataSource } from "typeorm";
import { BoxEntity } from "../entities/boxEntity";
import { migrations } from "../migrations";
import { BlockEntity } from "@rosen-bridge/scanner";
import { migrations as scannerMigrations } from '@rosen-bridge/scanner'
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export const loadDataBase = async (name: string): Promise<DataSource> => {
    return new DataSource({
        type: "sqlite",
        database: `./sqlite/${name}-test.sqlite`,
        entities: [BlockEntity, BoxEntity],
        migrations: [...migrations, ...scannerMigrations],
        synchronize: false,
        logging: false
    }).initialize().then(
        async (dataSource) => {
            await dataSource.runMigrations();
            return dataSource
        }
    );
}

export const generateBlockEntity = (dataSource: DataSource, hash: string, parent?: string, height?: number) => {
    const repository = dataSource.getRepository(BlockEntity)
    return repository.create({
        height: height ? height : 1,
        parentHash: parent ? parent : "1",
        hash: hash
    })
}

const tx1Bytes = Buffer.from('Aj33OykgT/oghcOKlY0yLIa+4EcaWhKWsDHxNyNuA4xtOAb7HnhdEqx0iGwNP6DmHbCqTfrva2pCq3qQhiXzch81u86CRYdqsUETuvQf97R5hjUTRiqLQ47DAIRvPO3y/EJCiYQTVY5zpp0Fft2h328nSh7uohm23WLdOCyTD3C6EbNfMuPrkCNjTno5SocU6+eU/XE0q0zqnadTMD8vVua/TRsLBGayn8jOjJScpgLt84iVAAADPfc7KSBP+iCFw4qVjTIshr7gRxpaEpawMfE3I24DjG26aYw8lD4GrSJNQsc2gm+Nw4mB+5KBT1d6icCtk2HDZ90dBpN+x1quB2+RyssvtyHSSVAw/yyAlqYb0rYIvcMRBICU69wDAAjNA5n1cku8TQjG4UbWFEnAWj4FRoaLHU+DQR8yUYfVyk+FkoAQAgBkAVAAgJjckzQACM0CTgbmxgc+E6A/pGKYgqaRCM1g4Kn7suD8yJjOaKcFG2aSgBABAmQA4JFDEAUEAAQADjYQAgSgCwjNAnm+Zn753LusVaBilc6HCwcCm/zbLc4o2VnygVsW+BeY6gLRkqOajMenAXMAcwEQAQIEAtGWgwMBk6OMx7KlcwAAAZPCsqVzAQB0cwJzA4MBCM3urJOxpXMEkoAQAACg+qqJGgAIzQMC5Xyn6/jPoYAtS8eaRVAIMHqTa09Q8GKdm+9IT91RiZKAEAEBFADGlwI=', 'base64')

export const tx1 = ergoLib.Transaction.sigma_parse_bytes(tx1Bytes)
