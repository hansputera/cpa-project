import type { Redis } from "ioredis";
import {
	DictionaryResult,
	DictionaryResultNode,
	search as googleSearch,
	OrganicResult,
	OrganicResultNode,
} from "google-sr";
import type {
	GoogleScraperCacheParams,
	PageInspectorParams,
} from "./types/index.js";
import { createRedisClient } from "./redis/redis.js";
import { PageInspector } from "./inspector.js";

/**
 * @class GoogleScraper
 */
export class GoogleScraper {
	protected ioredis: Redis;

	/**
	 * @consttructor
	 * @param params Google scraper constructor args
	 */
	constructor(protected params: GoogleScraperCacheParams) {
		this.ioredis = createRedisClient(params.redisUri);
	}

	public async search(query: string): Promise<Array<PageInspector>> {
		const cacheKey = `google_search:${encodeURIComponent(query)}`;
		const cache = await this.ioredis.get(cacheKey);
		if (cache) {
			return JSON.parse(cache);
		}

		const queryResults = await googleSearch({
			query,
			resultTypes: [OrganicResult],
		});

		await this.ioredis.setex(
			cacheKey,
			this.params.ttl,
			JSON.stringify(queryResults),
		);

		return queryResults
			.filter((q) => q.title?.length)
			.map((q) =>
				this.getInspect({
					pageDescription: q.description ?? "",
					pageTitle: q.title ?? "",
					pageUrl: q.link ?? "",
				}),
			);
	}

	public getInspect(page: Omit<PageInspectorParams, "cache">) {
		return new PageInspector({
			...page,
			cache: {
				ttl: this.params.ttl,
				redis: this.ioredis,
			},
		});
	}
}
