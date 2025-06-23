// import { TokocryptoCoinProvider, DecimalNumber } from "@cpa/coin-stream";
// // import { TwitterNews } from "@cpa/twitter-news-stream";
// // import { GoogleScraper } from "@cpa/google-scraper";
// import { getPriceCache, setPriceCache } from "./services/prices.js";
// import { configEnv } from "./config/config.js";

// const binance = new TokocryptoCoinProvider(
// 	"BTCUSDT",
// 	{
// 		tokens: ["btcusdt@aggTrade", "btcusdt@kline_1m"],
// 	},
// 	"1m",
// );

// // const twitter = new TwitterNews({
// // 	auth: {
// // 		email: configEnv.TWITTER_EMAIL,
// // 		password: configEnv.TWITTER_PASSWORD,
// // 		username: configEnv.TWITTER_USERNAME,
// // 	},
// // 	targets: [
// // 		{
// // 			username: "DeItaone",
// // 			intervalPool: 20_000,
// // 		},
// // 		{
// // 			username: "FirstSquawk",
// // 			intervalPool: 20_000,
// // 		},
// // 	],
// // 	cache: {
// // 		ttl: 60_000 * 30,
// // 		redisUri: configEnv.REDIS_URI,
// // 	},
// // });
// // const google = new GoogleScraper({
// // 	redisUri: configEnv.REDIS_URI,
// // 	ttl: 60_000,
// // });

// // twitter.on("fetchTweet", async (data) => {
// // 	const newsTweet = data.tweets.slice(0, data.newsCount);
// // 	console.log(
// // 		`[!!!!!!!!!!!!! TWEET FROM ${data.user.username} !!!!!!!!!!!!] -> ${newsTweet.map((t) => t.text).join(", ")}`,
// // 	);

// // 	const tweetTitle = newsTweet[0].text ?? "";
// // 	const searchResults = await google.search(tweetTitle);
// // 	console.log(
// // 		`Found ${searchResults.length} news in Google for ${tweetTitle}\n${searchResults.map((n) => `${n.page.pageTitle ?? ''} - ${n.page.pageUrl ?? ''}`).join("\n")}`,
// // 	);
// // });

// binance.on("liveTrade", async (ev) => {
// 	const previousPrice = await getPriceCache(ev.token);

// 	if (previousPrice) {
// 		const previousPriceDnum = DecimalNumber.from(previousPrice);
// 		const priceChange = DecimalNumber.sub(previousPriceDnum, ev.price);

// 		const isProfit = DecimalNumber.greaterThan(
// 			priceChange,
// 			configEnv.PRICE_THRESHOLD,
// 		);
// 		const isLoss = DecimalNumber.lessThanOrEqual(
// 			priceChange,
// 			configEnv.PRICE_THRESHOLD * -1,
// 		);

// 		if (isProfit) {
// 			console.log(
// 				`Profit detected for ${ev.token}: Previous Price: ${previousPrice}, New Price: ${ev.priceStr}, Change: ${priceChange.toString()}`,
// 			);
// 		} else if (isLoss) {
// 			console.log(
// 				`Loss detected for ${ev.token}: Previous Price: ${previousPrice}, New Price: ${ev.priceStr}, Change: ${priceChange.toString()}`,
// 			);
// 		} else {
// 			console.log(
// 				`No significant change for ${ev.token}: Previous Price: ${previousPrice}, New Price: ${ev.priceStr}`,
// 			);
// 		}
// 	} else {
// 		await setPriceCache(ev.token, ev.priceStr);
// 	}
// });
// binance.on("error", console.log);
// binance.on("kline", async (ev) => {
// 	console.log(
// 		`Kline event for ${ev.startTime.toISOString()} - ${ev.endTime.toISOString()}: Open: ${ev.openPrice}, Close: ${ev.closePrice}, High: ${ev.highPrice}, Low: ${ev.lowPrice}, Volume: ${ev.volume}`,
// 	);
// });

// // await twitter.init();
// await binance.init();
