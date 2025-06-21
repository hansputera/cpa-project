import { type Got, got } from "got";
import type { PageInspectorParams } from "./types/index.js";

/**
 * @class PageInspector
 */
export class PageInspector {
	protected cacheKey: string;
	protected got: Got;

	/**
	 * @constructor
	 * @param params Page inspector parameters
	 */
	constructor(protected params: PageInspectorParams) {
		this.got = got.extend({
			prefixUrl: params.pageUrl,
		});

		this.cacheKey = `page_inspector:${params.pageUrl}`;
	}

	protected get redis() {
		return this.params.cache.redis;
	}

	protected async fetchBody(): Promise<string> {
		const prevContents = await this.redis.get(this.cacheKey);
		if (prevContents) {
			return prevContents;
		}

		const contents = await this.got.get("./").text();
		await this.redis.setex(this.cacheKey, this.params.cache.ttl, contents);

		return contents;
	}

	public get page(): Omit<PageInspectorParams, "cache"> {
		return {
			...this.params,
		};
	}

	public async extractLinks(): Promise<string[]> {
		const body = await this.fetchBody();
		const urlRegexes =
			/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;

		return urlRegexes.exec(body) ?? [];
	}
}
