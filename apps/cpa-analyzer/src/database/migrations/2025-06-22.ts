import { type Migration, sql } from "kysely";

export const Migration20250622: Migration = {
	async up(db) {
		const candlesticksSchema = db.schema
			.createTable("tbl_candlesticks")
			.ifNotExists()
			.addColumn("openTime", "timestamptz", (col) => col.notNull())
			.addColumn("openPrice", "numeric", (col) => col.notNull())
			.addColumn("highPrice", "numeric", (col) => col.notNull())
			.addColumn("lowPrice", "numeric", (col) => col.notNull())
			.addColumn("closePrice", "numeric", (col) => col.notNull())
			.addColumn("volumePrice", "numeric", (col) => col.notNull())
			.addColumn("closeTime", "timestamptz", (col) => col.notNull())
			.addColumn("token", "varchar", (col) => col.notNull())
			.addColumn("provider", "varchar", (col) => col.notNull())
			.addColumn("addedAt", "timestamptz", (col) =>
				col.notNull().defaultTo(sql`now()`),
			);

		await candlesticksSchema.execute();
		const timescaledQuery = sql`
			SELECT create_hypertable (
				'tbl_candlesticks',
				'openTime',
				chunk_time_interval => interval '1 day'
			)
		`.compile(db);

		await db.executeQuery(timescaledQuery);
	},

	async down(db) {
		await db.schema.dropTable("tbl_candlesticks").ifExists().execute();
	},
};
