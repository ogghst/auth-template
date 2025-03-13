import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Use environment variables directly
const dbPath = process.env.DB_FILE || './db/database.sqlite';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: dbPath,
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  synchronize: false,
  logging: true,
});
