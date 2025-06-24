import { cleanEnv, email, num, str, url } from "envalid";

export const configEnv = cleanEnv(process.env, {
	REDIS_URI: url({
		default: "redis://localhost:6379",
	}),
	REDIS_TTL: num({
		default: 60 * 60 * 60 * 24,
	}),
	SESSION_PATH: str({
		default: "./wa_session",
	}),

	TWITTER_USERNAME: str(),
	TWITTER_PASSWORD: str(),
	TWITTER_EMAIL: email(),
	TWITTER_TARGETS: str({
		default: "DeItaone,rovercrc,unusual_whales",
	}),
});
