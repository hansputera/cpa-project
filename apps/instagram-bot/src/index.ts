import { BinanceCoinProvider } from "@cpa/coin-stream";

const binance = new BinanceCoinProvider("BTCUSDT", {
	tokens: ["btcusdt@aggTrade"],
});

binance.on("updatePrice", console.log);
binance.on("error", console.log);

await binance.init();
