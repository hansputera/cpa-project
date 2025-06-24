import {
	ErrorRateLimitStrategy,
	type Profile,
	Scraper,
} from "@the-convocation/twitter-scraper";
import consola from "consola";
import type {
	TwitterNewsEvent,
	TwitterNewsParams,
	TwitterTarget,
} from "./types/index.js";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readFile, writeFile } from "node:fs/promises";
import { Cookie } from "tough-cookie";
import EventEmitter from "node:events";
import { TwitterQueueManager } from "./queue.js";
import { createRedisClient } from "./redis/redis.js";

/**
 * @class TwitterNews
 */
export class TwitterNews extends EventEmitter<TwitterNewsEvent> {
	protected scraper: Scraper;
	protected queueManager: TwitterQueueManager;
	#profile: Profile;

	/**
	 * @constructor
	 * @param params Twitter news param
	 */
	constructor(protected params: TwitterNewsParams) {
		super();

		this.scraper = new Scraper({
			rateLimitStrategy: new ErrorRateLimitStrategy(),
		});
	}

	public get profile(): Profile {
		return this.#profile;
	}

	public async init(): Promise<void> {
		// Ensuring there's cookies
		consola.info(`[Twitter-${this.params.auth.username}] Initializing...`);
		const cookies = await this.getCookies();
		if (cookies) {
			await this.scraper.setCookies(cookies);
		}

		// Check if current scraper instance is loggedin
		const isLoggedIn = await this.scraper.isLoggedIn();
		if (!isLoggedIn) {
			consola.warn(`[Twitter-${this.params.auth.username}] Login...`);
			await this.scraper.login(
				this.params.auth.username,
				this.params.auth.password,
				this.params.auth.email,
				this.params.auth.twoFactorSecret,
			);
		}

		// Trying to fetch profile data
		const profile = await this.scraper.getProfile(this.params.auth.username);
		consola.info(
			`[Twitter-${this.params.auth.username}] Logged in to ${profile.username} ${profile.url} with uid ${profile.userId}`,
		);

		this.#profile = profile;

		// Save cookies :P
		const currentCookies = await this.scraper.getCookies();
		await this.setCookies(currentCookies);

		// Initialize queue manager
		this.queueManager = new TwitterQueueManager({
			redis: createRedisClient(this.params.cache.redisUri),
			scraper: this.scraper,
			cacheTtl: this.params.cache.ttl,
		});

		this.queueManager.event.on("data", async (data) => {
			this.emit("fetchTweet", {
				user: this.params.targets.find(
					(t) => t.username === data.username,
				) as TwitterTarget,
				newsCount: data.tweet_news.length,
				tweets: data.cached_tweets,
			});
		});

		for (const target of this.params.targets) {
			consola.info(
				`[Twitter-${profile.username}] Registering subscribe tweet ${target.username}`,
			);
			await this.queueManager.sendFetchJob(target);
		}
	}

	public async register(targets: TwitterTarget[]) {
		const maps = targets.map(
			this.queueManager.sendFetchJob.bind(this.queueManager),
		);
		const results = await Promise.allSettled(maps);

		return results.map((n, i) => ({
			succeed: n.status === "fulfilled",
			username: targets[i].username,
		}));
	}

	/**
	 * Get cookies from current instance
	 */
	protected async getCookies() {
		try {
			const file = await readFile(
				join(
					tmpdir(),
					`${this.params.auth.username.replace(/\s+/g, "_")}.json`,
				),
				"utf8",
			);
			const cookies = JSON.parse(file).map((cookie: unknown) =>
				Cookie.fromJSON(cookie)?.toString(),
			);

			return cookies;
		} catch {
			return undefined;
		}
	}

	/**
	 * Save current cookies
	 * @param cookies Scraper cookies
	 * @return {Promise<boolean>}
	 */
	protected async setCookies(
		cookies: Awaited<ReturnType<typeof this.scraper.getCookies>>,
	): Promise<boolean> {
		try {
			await writeFile(
				join(
					tmpdir(),
					`${this.params.auth.username.replace(/\s+/g, "_")}.json`,
				),
				JSON.stringify(cookies),
			);
			return true;
		} catch {
			return false;
		}
	}
}
