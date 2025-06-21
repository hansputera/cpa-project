import type { Redis } from "ioredis";

export type GoogleScraperCacheParams = {
	ttl: number;
	redisUri: string;
};

export type GoogleScraperParams = {
	cache: GoogleScraperCacheParams;
};

export type PageInspectorParams = {
	pageUrl: string;
	pageTitle: string;
	pageDescription: string;
	cache: {
		redis: Redis;
		ttl: number;
	};
};
