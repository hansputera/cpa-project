import { type Job, Queue, Worker } from "bullmq";
import {
	type TweetReturn,
	TwitterJobs,
	type TwitterQueueManagerParams,
	type TwitterTarget,
} from "./types/index.js";
import type { Scraper, Tweet } from "@the-convocation/twitter-scraper";
import type { Redis } from "ioredis";
import { EventEmitter } from "node:events";
import consola from "consola";

/**
 * @class TwitterQueueManager
 */
export class TwitterQueueManager {
	protected fetchQueue: Queue;
	protected workers: Map<string, Worker> = new Map();
	public event: EventEmitter<{ data: [data: TweetReturn] }> =
		new EventEmitter();

	/**
	 * @constructor
	 * @param params Twitter Queue Manager Parameters
	 */
	constructor(protected params: TwitterQueueManagerParams) {
		this.fetchQueue = new Queue(TwitterJobs.FetchTweet, {
			connection: params.redis,
		});
	}

	protected get scraper(): Scraper {
		return this.params.scraper;
	}
	protected get redis(): Redis {
		return this.params.redis;
	}

	protected async handleJob(job: Job<TwitterTarget>) {
		consola.info(
			`[TwitterWorker] Receiving job ${job.data.username} to fetch tweets...`,
		);
		const tweets = await this.fetchTweetsFromUser(job.data.username);

		// Only sent data when there's news
		if (tweets.tweet_news.length) {
			this.event.emit("data", tweets);
		}

		return tweets;
	}

	protected async fetchCacheTweetsFromUser(username: string): Promise<Tweet[]> {
		const cacheKey = `10_tweets:${username}`;
		const cache = await this.redis.get(cacheKey);

		if (cache) {
			return JSON.parse(cache) as Tweet[];
		}

		return [];
	}

	protected async fetchTweetsFromUser(username: string): Promise<TweetReturn> {
		const cacheKey = `10_tweets:${username}`;
		const timeline = this.scraper.getTweets(username, 20);
		const tweetCached = await this.fetchCacheTweetsFromUser(username);
		const tweetsRest = await this.scraper.getTweetsWhere(timeline, {
			isRetweet: false,
			isQuoted: false,
			isReply: false,
			isPin: false,
		});

		const tweetNews = tweetsRest.filter(
			(tweet) => tweetCached.findIndex((t) => t.id === tweet.id) === -1,
		);
		await this.redis.setex(
			cacheKey,
			this.params.cacheTtl,
			JSON.stringify(tweetsRest),
		);

		return {
			cached_tweets: tweetsRest,
			tweet_news: tweetNews,
			username,
		};
	}

	public async removeFetchJob(target: TwitterTarget): Promise<void> {
		const keys = await this.fetchQueue.getJobSchedulers(1, 100);
		const targetKey = keys.find((k) => k.id === `job::${target.username}`);

		if (targetKey?.id) {
			await this.fetchQueue.removeJobScheduler(targetKey.id);
		} else {
			throw new Error("Failed to remove, because it doesnt exist");
		}
	}

	public async sendFetchJob(target: TwitterTarget): Promise<void> {
		if (this.workers.has(target.username)) {
			throw new Error(`This username ${target.username} already registered`);
		}

		this.workers.set(
			target.username,
			new Worker(TwitterJobs.FetchTweet, this.handleJob.bind(this), {
				connection: this.redis,
			}),
		);

		await this.fetchQueue.upsertJobScheduler(
			`job::${target.username}`,
			{
				every: target.intervalPool,
				tz: "Asia/Makassar",
			},
			{
				name: TwitterJobs.FetchTweet,
				data: target,
				opts: {
					removeOnComplete: true,
					removeOnFail: true,
				},
			},
		);
	}
}
