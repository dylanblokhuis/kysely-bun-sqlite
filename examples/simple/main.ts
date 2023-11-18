import { FileMigrationProvider, Kysely, Migrator } from "kysely";
import { BunSqliteDialect } from "../../src/index.ts";

import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'
import { Database } from "bun:sqlite";
import fs from "node:fs/promises";
import path from "node:path"

interface PetTable {
    id: Generated<number>
    name: string
}

export interface KyselyDatabase {
    pet: PetTable
}

const db = new Kysely<KyselyDatabase>({
    dialect: new BunSqliteDialect({
        database: new Database('db.sqlite'),
    }),
});


async function migrateToLatest() {
    const db = new Kysely<KyselyDatabase>({
        dialect: new BunSqliteDialect({
            database: new Database('db.sqlite'),
        }),
    });

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            // This needs to be an absolute path.
            migrationFolder: path.join(__dirname, './migrations'),
        }),
    })

    const { error, results } = await migrator.migrateToLatest()

    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`)
        }
    })

    if (error) {
        console.error('failed to migrate')
        console.error(error)
        process.exit(1)
    }
}

await migrateToLatest();

await db.deleteFrom('pet').where("name", '=', "Fluffy").execute();
await db.insertInto('pet').values({
    name: 'Fluffy',
}).executeTakeFirstOrThrow();
const result = await db.selectFrom('pet').selectAll().executeTakeFirstOrThrow();
console.log(result);