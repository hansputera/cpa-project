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

	export type KlineEventData = {
		startTime: Date;
		endTime: Date;
		openPrice: Dnum;
		closePrice: Dnum;
		highPrice: Dnum;
		lowPrice: Dnum;
		volume: Dnum;
		volumeAsset: Dnum;
		tradeCount: number;
		isClosed: boolean;
		takerBuyBaseVolume: Dnum;
		takerBuyQuoteVolume: Dnum;
	};

	export type StreamEvents = {
		liveTrade: [data: PriceEventData];
		error: [err: Error];
		kline: [data: KlineEventData];
	};
}

export namespace BinanceCoinProviderTypes {
	export type Payload = {
		/**
		 * Token params want to subscribed
		 */
		tokens: string[];
	};

	export type RawStreamEvent<T> = {
		stream: string;
		data: T;
	};

	export type RawStreamAggTrade = RawStreamEvent<{
		s: string;
		q: string;
		p: string;
		T: number;
	}>;

	export type RawStreamKline = RawStreamEvent<{
		/** Event type (always 'kline') */
		e: string;
		/** Event time in milliseconds */
		E: number;
		/** Symbol, e.g. 'BTCUSDT' */
		s: string;
		/** Kline (candlestick) data payload */
		k: {
			/** Kline start time in ms */
			t: number;
			/** Kline close time in ms */
			T: number;
			/** Symbol (duplicated inside k) */
			s: string;
			/** Interval (e.g. '1m', '5m') */
			i: string;
			/** First trade ID in this kline */
			f: number;
			/** Last trade ID in this kline */
			L: number;
			/** Open price as string for precision */
			o: string;
			/** Close price */
			c: string;
			/** High price */
			h: string;
			/** Low price */
			l: string;
			/** Base asset volume */
			v: string;
			/** Number of trades */
			n: number;
			/** Is this kline closed? */
			x: boolean;
			/** Quote asset volume */
			q: string;
			/** Taker buy base volume */
			V: string;
			/** Taker buy quote volume */
			Q: string;
			/** Ignore (unused) */
			B: string;
		};
	}>;
}

export namespace TokocryptoCoinProviderTypes {
	export type Payload = BinanceCoinProviderTypes.Payload;
	export type RawStreamEvent<T> = BinanceCoinProviderTypes.RawStreamEvent<T>;
	export type RawStreamAggTrade = BinanceCoinProviderTypes.RawStreamAggTrade;
	export type RawStreamKline = BinanceCoinProviderTypes.RawStreamKline;
}
