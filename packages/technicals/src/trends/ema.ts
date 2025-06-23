import * as dn from "dnum";
import type { Candle } from "../types/index.js";

export class EMA {
	#period: number;
	#multiplier: dn.Dnum;
	#ema: dn.Dnum;
	public value: dn.Dnum;

	constructor(period: number) {
		this.#period = period;
		// α = 2/(period+1)
		this.#multiplier = dn.divide(dn.from(2, 0), dn.from(period + 1, 0));
	}

	update(candle: Candle) {
		const price = dn.from(candle.close, 8);
		if (this.#ema === null) {
			// Inisialisasi: EMA pertama = harga pertama
			this.#ema = price;
		} else {
			// EMA = prevEMA + (price - prevEMA) * α
			const diff = dn.subtract(price, this.#ema);
			const incr = dn.multiply(diff, this.#multiplier, 8);
			this.#ema = dn.add(this.#ema, incr);
		}
		this.value = this.#ema;
	}
}
