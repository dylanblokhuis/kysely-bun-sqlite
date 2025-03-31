import { Database } from "bun:sqlite"
import { CompiledQuery, DatabaseConnection, Driver, QueryResult } from "kysely"
import { BunSqliteDialectConfig } from "./config.ts"

export class BunSqliteDriver implements Driver {
  readonly #config: BunSqliteDialectConfig
  readonly #connectionMutex = new ConnectionMutex()

  #db?: Database
  #connection?: DatabaseConnection

  constructor(config: BunSqliteDialectConfig) {
    this.#config = { ...config }
  }

  async init(): Promise<void> {
    this.#db = this.#config.database

    this.#connection = new BunSqliteConnection(this.#db)

    if (this.#config.onCreateConnection) {
      await this.#config.onCreateConnection(this.#connection)
    }
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    // SQLite only has one single connection. We use a mutex here to wait
    // until the single connection has been released.
    await this.#connectionMutex.lock()
    return this.#connection!
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('begin'))
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('commit'))
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('rollback'))
  }

  async releaseConnection(): Promise<void> {
    this.#connectionMutex.unlock()
  }

  async destroy(): Promise<void> {
    this.#db?.close()
  }
}

class BunSqliteConnection implements DatabaseConnection {
  readonly #db: Database

  constructor(db: Database) {
    this.#db = db
  }

  executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery
    const stmt = this.#db.prepare(sql)

    return Promise.resolve({
      rows: stmt.all(parameters as any) as O[],
    })
  }

  async *streamQuery<R>(compiledQuery: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
    const { sql, parameters } = compiledQuery;
    const stmt = this.#db.prepare(sql);

    if (!('iterator' in stmt)) {
      throw new Error("bun:sqlite supports streaming in 1.1.31 or above. Please upgrade to use streaming.")
    }

    for await (const row of stmt.iterate(parameters as any)) {
      yield { rows: [row as R] }
    }
  }
}

class ConnectionMutex {
  #promise?: Promise<void>
  #resolve?: () => void

  async lock(): Promise<void> {
    while (this.#promise) {
      await this.#promise
    }

    this.#promise = new Promise((resolve) => {
      this.#resolve = resolve
    })
  }

  unlock(): void {
    const resolve = this.#resolve

    this.#promise = undefined
    this.#resolve = undefined

    resolve?.()
  }
}
