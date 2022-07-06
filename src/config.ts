import { DatabaseConnection } from "kysely"
import { Database } from "bun:sqlite"
/**
 * Config for the SQLite dialect.
 */
export interface BunSqliteDialectConfig {
  /**
   * An sqlite Database instance or a function that returns one.
   */
  database: Database

  /**
   * Called once when the first query is executed.
   */
  onCreateConnection?: (connection: DatabaseConnection) => Promise<void>
}