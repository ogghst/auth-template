import { DataSourceOptions } from "typeorm";
import path from "path";

/**
 * Creates a TypeORM SQLite configuration with appropriate settings
 * 
 * @param dbName - The database name (without extension)
 * @param entities - Array of entity classes
 * @param inMemory - Whether to use in-memory database (default: false)
 * @param dropSchema - Whether to drop the schema on connection (default: false)
 * @returns TypeORM DataSourceOptions configuration
 */
export function createSQLiteConfig(
  dbName: string,
  entities: any[],
  inMemory = false,
  dropSchema = false
): DataSourceOptions {
  // Determine database path/location
  const database = inMemory 
    ? ":memory:" 
    : process.env.DB_PATH || path.join(process.cwd(), `${dbName}.sqlite`);
  
  return {
    type: "sqlite",
    database,
    entities,
    synchronize: true, 
    logging: process.env.NODE_ENV !== "production",
    dropSchema,
  };
} 