import type { Dnum } from "dnum";

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
		price: Dnum;
		/**
		 * Price display in string
		 * @example 5.000
		 */
		priceStr: string;
		/**
		 * Transaction amount
		 */
		amount: Dnum;
		/**
		 * Transaction amount display in string
		 * @example 0.0005
		 */
		amountStr: string;
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

export namespace TokocryptoCoinProviderTypes {
	export type Payload = BinanceCoinProviderTypes.Payload;
	export type RawStreamEvent = BinanceCoinProviderTypes.RawStreamEvent;
}
