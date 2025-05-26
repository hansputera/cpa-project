import { TokocryptoCoinProvider } from "@cpa/coin-stream";

const binance = new TokocryptoCoinProvider("BTCUSDT", {
	tokens: [
		"btcusdt@aggTrade",
		"btcusdt@kline_1d",
		"!miniTicker@arr",
		"btcusdt@depth",
	],
});

binance.on("updatePrice", console.log);
binance.on("error", console.log);

await binance.init();
