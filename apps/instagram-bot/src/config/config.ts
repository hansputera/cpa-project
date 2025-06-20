import { cleanEnv, email, num, str, url } from "envalid";

export const configEnv = cleanEnv(process.env, {
	PRICE_THRESHOLD: num({
		default: 500,
	}), // Default price threshold in USD
	PRICE_CACHE_TTL: num({
		default: 120, // Default cache TTL in seconds (2 minutes)
	}),
	REDIS_URI: url({
		default: "redis://localhost:6379",
		desc: "Redis URI for caching prices",
	}),

	TWITTER_USERNAME: str(),
	TWITTER_EMAIL: email(),
	TWITTER_PASSWORD: str(),
});
