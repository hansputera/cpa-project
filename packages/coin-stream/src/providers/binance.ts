import { WebSocket } from "ws";
import { CoinStreamProvider } from "./base.js";
import type { BinanceCoinProviderTypes } from "../types/index.js";
import { jsonParse } from "../utils/jsonParse.js";
import * as dnum from "dnum";

export class BinanceCoinProvider extends CoinStreamProvider<BinanceCoinProviderTypes.Payload> {
	protected ws?: WebSocket;

	/**
	 * This variable used to count how much we tried to connect with binance stream socket
	 */
	protected retryCount = 0;
	/**
	 * This variable indicates the user stop the socket or not
	 */
	protected manuallyClose = false;

	public get provider(): string {
		return "binance";
	}

	public async init(): Promise<void> {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws = undefined;
		}

		this.ws = new WebSocket("wss://stream.binance.com/stream");

		// Register the websocket client events
		this.ws.on("open", this.onWsConnect.bind(this));
		this.ws.on("close", this.onClose.bind(this));
		this.ws.on("message", this.onMessage.bind(this));
		this.ws.on("error", this.onWsError.bind(this));
	}

	protected onWsConnect(): void {
		// Sent subscribe payload
		this.ws?.send(
			JSON.stringify({
				id: 1,
				method: "SUBSCRIBE",
				params: this.payload.tokens,
			}),
		);

		// Reset the retry count
		this.retryCount = 0;
	}

	protected onWsError(err: Error): void {
		// Emit error to own emitter
		this.emit("error", err);

		// Should throw an error if retry count reach 3 attempts
		if (this.retryCount >= 3) {
			throw new Error("Binance coin stream provider couldnt connect");
		}

		// Increment the retry count, and reinitialize the socket
		this.retryCount++;
		this.init();
	}

	public async getKline(): Promise<BinanceCoinProviderTypes.KlineDatas> {
		const url = new URL("https://www.binance.com/api/v3/uiKlines");
		url.searchParams.set("limit", "1000");
		url.searchParams.set("symbol", this.token);
		url.searchParams.set("interval", this.timeframe);

		const json = (await fetch(url).catch(() => undefined))
			?.json()
			.catch(() => undefined) as
			| BinanceCoinProviderTypes.UiKlineResponse
			| undefined;
		if (!json) {
			return [];
		}

		return json.map((j) => ({
			openTime: j[0],
			open: dnum.from(j[1]),
			high: dnum.from(j[2]),
			low: dnum.from(j[3]),
			close: dnum.from(j[4]),
			volume: dnum.from(j[5]),
			closeTime: j[6],
			quoteAssetVolume: dnum.from(j[7]),
			tradeCount: j[8],
			takerBuyBaseAssetVolume: dnum.from(j[8]),
			takerBuyQuoteAssetVolume: dnum.from(j[9]),
		}));
	}

	protected onMessage(data: WebSocket.RawData) {
		const utf8Content = data.toString("utf8");
		const json = jsonParse<
			| BinanceCoinProviderTypes.RawStreamAggTrade
			| BinanceCoinProviderTypes.RawStreamKline
		>(utf8Content);

		if (!json?.stream) {
			return;
		}

		const klineJson = json as BinanceCoinProviderTypes.RawStreamKline;
		const tradeJson = json as BinanceCoinProviderTypes.RawStreamAggTrade;

		if (!json?.stream.includes("kline")) {
			this.emit("kline", {
				startTime: new Date(klineJson.data.k.t),
				endTime: new Date(klineJson.data.k.T),
				openPrice: dnum.from(klineJson.data.k.o),
				closePrice: dnum.from(klineJson.data.k.c),
				highPrice: dnum.from(klineJson.data.k.h),
				lowPrice: dnum.from(klineJson.data.k.l),
				volume: dnum.from(klineJson.data.k.v),
				volumeAsset: dnum.from(klineJson.data.k.V),
				tradeCount: klineJson.data.k.n,
				isClosed: klineJson.data.k.x,
				takerBuyBaseVolume: dnum.from(klineJson.data.k.B),
				takerBuyQuoteVolume: dnum.from(klineJson.data.k.Q),
			});
			return;
		}

		// If the json data is an array and has a property 'stream'
		// then we can assume this is a kline event
		if (klineJson.stream.includes("kline")) {
			console.log(klineJson);
		}

		// If the json data is not an array and has a property 'data'
		// then we can assume this is a trade event
		if (tradeJson && !Array.isArray(tradeJson?.data) && tradeJson.data?.p) {
			// p = price, q = amount trx, s = token, T = time
			const token = json.data.s;
			const date = new Date(tradeJson.data.T);

			this.emit("liveTrade", {
				price: dnum.from(tradeJson.data.p),
				token,
				amount: dnum.from(tradeJson.data.q),
				date,
				priceStr: tradeJson.data.p,
				amountStr: tradeJson.data.q,
			});
		}
	}

	protected onClose() {
		// Reset the registered connection events to prevent node.js memory leak
		this.ws?.off("message", this.onMessage);
		this.ws?.off("close", this.onClose);
		this.ws?.off("open", this.onWsConnect);
		this.ws?.off("error", this.onWsError);

		// If user didnt close the stream manually, we can assume the socket is continue
		if (!this.manuallyClose) {
			this.init();
		} else {
			// If not, we can stop it by set the connection value to undefined
			this.ws = undefined;
		}
	}
}
