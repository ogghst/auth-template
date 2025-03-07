import "reflect-metadata";
import { DataSource } from "typeorm";
import { Todo } from "./domain/todo/todo.entity";
import { createSQLiteConfig } from "./helper/db-config";

// Create config based on environment
const isTestEnv = process.env.NODE_ENV === "test";
const config = createSQLiteConfig(
  "app-database", 
  [Todo],
  isTestEnv,
  isTestEnv
);

export const AppDataSource = new DataSource(config);
