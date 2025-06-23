import type { Generated } from "kysely";

export type CandlesticksTable = {
	openTime: Date;
	openPrice: string;
	highPrice: string;
	lowPrice: string;
	closePrice: string;
	volumePrice: string;
	closeTime: number;
	timeframe: string;

	// Non confidential candlestick data
	token: string;
	provider: string;
	addedAt: Generated<Date>;
};

export type Database = {
	candlesticks: CandlesticksTable;
};
