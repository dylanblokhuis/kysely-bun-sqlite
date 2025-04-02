import { DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely"
import { BunSqliteDialectConfig } from "./config.ts"
import { BunSqliteDriver } from "./driver.ts"

export class BunSqliteDialect implements Dialect {
  readonly #config: BunSqliteDialectConfig

  constructor(config: BunSqliteDialectConfig) {
    this.#config = { ...config }
  }

  createDriver(): Driver {
    return new BunSqliteDriver(this.#config)
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler()
  }

  createAdapter(): DialectAdapter {
    return new SqliteAdapter()
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SqliteIntrospector(db)
  }
}
