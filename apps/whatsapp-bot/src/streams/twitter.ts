import { TwitterNews } from "@cpa/twitter-news-stream";
import { configEnv } from "../config/config.js";

export const twitterTargets = configEnv.TWITTER_TARGETS.split(",");
export const twitter = new TwitterNews({
	cache: {
		redisUri: configEnv.REDIS_URI,
		ttl: configEnv.REDIS_TTL,
	},
	auth: {
		email: configEnv.TWITTER_EMAIL,
		username: configEnv.TWITTER_USERNAME,
		password: configEnv.TWITTER_PASSWORD,
	},
	targets: twitterTargets.map((x) => ({
		username: x.trim(),
		intervalPool: 30_000,
	})),
});
