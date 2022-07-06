import { DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler, SqliteDialectConfig } from "kysely"
import { BunSqliteAdapter } from "./adapter"
import { BunSqliteDialectConfig } from "./config"
import { BunSqliteDriver } from "./driver"
import { BunSqliteIntrospector } from "./introspector"
import { BunSqliteQueryCompiler } from "./query-compiler"

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
