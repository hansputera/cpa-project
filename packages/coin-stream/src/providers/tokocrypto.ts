import { WebSocket } from "ws";
import { CoinStreamProvider } from "./base.js";
import type { TokocryptoCoinProviderTypes } from "../types/index.js";
import { jsonParse } from "../utils/jsonParse.js";
import * as dnum from "dnum";

export class TokocryptoCoinProvider extends CoinStreamProvider<TokocryptoCoinProviderTypes.Payload> {
	protected ws?: WebSocket;
	protected wsUrls = [
		"wss://stream-cloud.binanceru.net/stream",
		"wss://stream-toko.2meta.app/stream",
	];

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

		const randomWsUrl =
			this.wsUrls[Math.floor(Math.random() * this.wsUrls.length)];
		this.ws = new WebSocket(randomWsUrl);

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
			throw new Error("Tokocrypto coin stream provider couldnt connect");
		}

		// Increment the retry count, and reinitialize the socket
		this.retryCount++;
		this.init();
	}

	protected onMessage(data: WebSocket.RawData) {
		const utf8Content = data.toString("utf8");
		const json =
			jsonParse<TokocryptoCoinProviderTypes.RawStreamEvent>(utf8Content);

		if (json && !Array.isArray(json?.data) && json.data?.p) {
			// p = price, q = amount trx, s = token, T = time
			const token = json.data.s;
			const date = new Date(json.data.T);

			this.emit("updatePrice", {
				price: dnum.from(json.data.p),
				token,
				amount: dnum.from(json.data.q),
				date,
				priceStr: json.data.p,
				amountStr: json.data.q,
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
