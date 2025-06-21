import { Redis } from "ioredis";

export const createRedisClient = (uri: string) =>
	new Redis(uri, {
		connectionName: "GoogleScraper",
	});
