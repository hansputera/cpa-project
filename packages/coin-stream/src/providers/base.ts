import EventEmitter from "node:events";
import type { CoinStreamTypes } from "../types/index.js";

export abstract class CoinStreamProvider<
	T,
> extends EventEmitter<CoinStreamTypes.StreamEvents> {
	/**
	 * @constructor
	 * @param token Crypto token code to provider
	 * @param payload Coin stream payload
	 */
	constructor(
		protected token: string,
		protected payload: T,
	) {
		super();
	}

	/**
	 * Coin Stream Provider
	 * @example binance, coinbase, coingecko
	 */
	public abstract get provider(): string;

	/**
	 * Initialize coin stream provider to connect
	 * @return {Promise<void>}
	 */
	public abstract init(): Promise<void>;
}
