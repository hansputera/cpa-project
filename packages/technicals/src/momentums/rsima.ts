import * as dn from "dnum";
import { RSI } from "./rsi.js";
import { SMA } from "../trends/sma.js";
import type { Candle } from "../types/index.js";

export class RSIMovingAverage {
	#rsi: RSI;
	#sma: SMA;
	public value: dn.Dnum;

	constructor(rsiPeriod: number, maPeriod: number) {
		this.#rsi = new RSI(rsiPeriod);
		this.#sma = new SMA(maPeriod);
		this.value = dn.from(0, 0);
	}

	update(candle: Candle) {
		this.#rsi.update(candle);
		// Saat RSI berisi nilai, masukkan ke SMA
		if (this.#rsi.value) {
			// Konversi nilai RSI ke number/dnum untuk SMA
			this.#sma.update({
				open: dn.from(0),
				high: dn.from(0),
				low: dn.from(0),
				close: this.#rsi.value,
				volume: dn.from(0),
			});
			this.value = this.#sma.value;
		}
	}
}
