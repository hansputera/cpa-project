import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { configEnv } from "../config/config.js";

export const postgresqlDialect = new PostgresDialect({
	pool: new Pool({
		database: configEnv.POSTGRESQL_DB,
		user: configEnv.POSTGRESQL_USER,
		password: configEnv.POSTGRESQL_PASSWORD,
		port: configEnv.POSTGRESQL_PORT,
	}),
});
