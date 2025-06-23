// import { TokocryptoCoinProvider } from "@cpa/coin-stream";
// import { Dnum, Momentums, Patterns, Trends } from "@cpa/technicals";

// const tokocrypto = new TokocryptoCoinProvider(
// 	"BTCUSDT",
// 	{
// 		tokens: ["btcusdt@aggTrade", "btcusdt@kline_1m"],
// 	},
// 	"1m",
// );

// const klineData = await tokocrypto.getKline(1000);
// console.log(`[Timeframe: 1M] BTCUSDT menggunakan ${klineData.length} candles`);

// const rsi = new Momentums.RSI(14);
// const rsiMa = new Momentums.RSIMovingAverage(14, 50);
// const candlestickPattern = new Patterns.CandlestickPatterns();

// klineData.forEach(kline => {
// 	rsi.update({
// 		close: kline.close,
// 		high: kline.high,
// 		low: kline.low,
// 		open: kline.open,
// 		volume: kline.volume,
// 	});

// 	rsiMa.update({
// 		close: kline.close,
// 		high: kline.high,
// 		low: kline.low,
// 		open: kline.open,
// 		volume: kline.volume,
// 	});

// 	candlestickPattern.update({
// 		close: kline.close,
// 		high: kline.high,
// 		low: kline.low,
// 		open: kline.open,
// 		volume: kline.volume,
// 	});
// });

// tokocrypto.on("error", console.error);
// tokocrypto.on("kline", (data) => {
// 	console.log(
// 		`[Timeframe: 1M] -> Harga BTCUSDT: ${Dnum.format(data.closePrice, {
// 			digits: 8,
// 		})} (candle penutup? ${data.isClosed ? "Ya" : "Bukan"})`,
// 	);

// 	if (data.isClosed) {
// 		rsi.update({
// 			low: data.lowPrice,
// 			close: data.closePrice,
// 			open: data.openPrice,
// 			high: data.highPrice,
// 			volume: data.volume,
// 		});
// 		rsiMa.update({
// 			low: data.lowPrice,
// 			close: data.closePrice,
// 			open: data.openPrice,
// 			high: data.highPrice,
// 			volume: data.volume,
// 		});
// 		candlestickPattern.update({
// 			low: data.lowPrice,
// 			close: data.closePrice,
// 			open: data.openPrice,
// 			high: data.highPrice,
// 			volume: data.volume,
// 		});

// 		console.log(`[Timeframe: 1M] Candle closed with rsi ${Dnum.format(rsi.value, {
// 			digits: 12,
// 		})} and RSI MA ${Dnum.format(rsiMa.value, { digits: 12 })}. Candle pattern ${candlestickPattern.pattern ?? '-'}`);
// 	}
// });

// await tokocrypto.init();
