import { WebSocket } from "ws";
import { CoinStreamProvider } from "./base.js";
import type { BinanceCoinProviderTypes } from "../types/index.js";
import { jsonParse } from "../utils/jsonParse.js";

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
				params: this.payload,
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

	protected onMessage(data: WebSocket.RawData) {
		const utf8Content = data.toString("utf8");
		const json =
			jsonParse<BinanceCoinProviderTypes.RawStreamEvent>(utf8Content);

		if (json) {
			// p = price, q = amount trx, s = token, T = time
			const priceFloat = Number.parseFloat(json.data.p);
			const amount = Number.parseFloat(json.data.q);
			const token = json.data.p;
			const date = new Date(json.data.T);

			this.emit("updatePrice", {
				price: priceFloat,
				token,
				amount,
				date,
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
