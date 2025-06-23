import { TokocryptoCoinProvider } from "@cpa/coin-stream";

export const cexTokocryptoProvider = new TokocryptoCoinProvider(
	"BTCUSDT",
	{
		tokens: ["btcusdt@aggTrade", "btcusdt@kline_1m"],
	},
	"1m",
);
