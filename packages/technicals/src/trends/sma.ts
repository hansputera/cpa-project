import * as dn from "dnum";
import type { Candle } from "../types/index.js";

export class SMA {
	#period: number;
	#queue: dn.Dnum[] = [];
	public value: dn.Dnum = dn.from(0, 0);

	constructor(period: number) {
		this.#period = period;
	}

	update(candle: Candle) {
		const price = dn.from(candle.close, 8);
		this.#queue.push(price);
		if (this.#queue.length > this.#period) {
			this.#queue.shift();
		}
		if (this.#queue.length === this.#period) {
			let sum = dn.from(0, 8);
			for (const v of this.#queue) {
				sum = dn.add(sum, v);
			}
			// SMA = sum / period
			this.value = dn.divide(sum, this.#period);
		}
	}
}
