import { redisClient } from "../caches/priceCache.js";
import { configEnv } from "../config/config.js";

export const getPriceCache = async (token: string) => {
	const price = await redisClient.get(`cpa_price:${token}`);
	if (!price) {
		return undefined;
	}

	return price;
};

export const setPriceCache = async (token: string, price: string) => {
	return redisClient.setex(
		`cpa_price:${token}`,
		configEnv.PRICE_CACHE_TTL,
		price,
	); // Cache TTL is set to 120 seconds
};
