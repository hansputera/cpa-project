import { Kysely } from "kysely";
import type { Database } from "../types/database.js";
import { postgresqlDialect } from "./postgres.js";

export const kyselyDb = new Kysely<Database>({
	dialect: postgresqlDialect,
});
