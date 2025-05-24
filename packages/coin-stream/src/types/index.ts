export namespace CoinStreamTypes {
	export type PriceEventData = {
		/**
		 * Coin token name
		 * @example BTCUSD
		 */
		token: string;
		/**
		 * Coin price
		 * @example 5000
		 */
		price: number;
		/**
		 * Transaction amount
		 */
		amount: number;
		/**
		 * When the transaction happended
		 */
		date: Date;
	};

	export type StreamEvents = {
		updatePrice: [data: PriceEventData];
		error: [err: Error];
	};
}

export namespace BinanceCoinProviderTypes {
	export type Payload = {
		/**
		 * Token params want to subscribed
		 */
		tokens: string[];
	};

	export type RawStreamEvent = {
		stream: string;
		data: {
			s: string;
			q: string;
			p: string;
			T: number;
		};
	};
}
