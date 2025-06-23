import * as dn from "dnum";
import type { Candle } from "../types/index.js";

export class RMA {
	#period: number;
	#rma: dn.Dnum;
	public value: dn.Dnum;

	constructor(period: number) {
		this.#period = period;
	}

	update(candle: Candle) {
		const price = dn.from(candle.close, 8);
		if (this.#rma === null) {
			this.#rma = price; // inisialisasi RMA pertama = harga pertama
		} else {
			// RMA = prev + (price - prev) / N
			const diff = dn.subtract(price, this.#rma);
			const incr = dn.divide(diff, this.#period);
			this.#rma = dn.add(this.#rma, incr);
		}
		this.value = this.#rma;
	}
}
