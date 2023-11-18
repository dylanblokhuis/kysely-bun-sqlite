import { DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler, SqliteDialectConfig } from "kysely"
import { BunSqliteAdapter } from "./adapter.ts"
import { BunSqliteDialectConfig } from "./config.ts"
import { BunSqliteDriver } from "./driver.ts"
import { BunSqliteIntrospector } from "./introspector.ts"
import { BunSqliteQueryCompiler } from "./query-compiler.ts"

export class BunSqliteDialect implements Dialect {
  readonly #config: BunSqliteDialectConfig

  constructor(config: BunSqliteDialectConfig) {
    this.#config = { ...config }
  }

  createDriver(): Driver {
    return new BunSqliteDriver(this.#config)
  }

  createQueryCompiler(): QueryCompiler {
    return new BunSqliteQueryCompiler()
  }

  createAdapter(): DialectAdapter {
    return new BunSqliteAdapter()
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new BunSqliteIntrospector(db)
  }
}
