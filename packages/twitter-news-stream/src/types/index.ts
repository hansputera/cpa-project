import type { Scraper, Tweet } from "@the-convocation/twitter-scraper";
import type { Redis } from "ioredis";

export type TwitterTarget = {
	username: string;
	intervalPool: number;
};

export type TwitterAuth = {
	username: string;
	password: string;
	email: string;
	twoFactorSecret?: string;
};

export type TwitterCache = {
	ttl: number;
	redisUri: string;
};

export type TwitterNewsParams = {
	targets: Array<TwitterTarget>;
	auth: TwitterAuth;
	cache: TwitterCache;
};

export type TwitterNewsEventData = {
	user: TwitterTarget;
	tweets: Array<Tweet>;
	newsCount: number;
};

export type TwitterNewsEvent = {
	fetchTweet: [data: TwitterNewsEventData];
};

export enum TwitterJobs {
	FetchTweet = "fetch_tweet",
}

export type TwitterQueueManagerParams = {
	redis: Redis;
	scraper: Scraper;
	cacheTtl: number;
};

export type TweetReturn = {
	tweet_news: Tweet[];
	cached_tweets: Tweet[];
	username: string;
};
