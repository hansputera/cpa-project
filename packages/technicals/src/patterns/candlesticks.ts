import * as dn from "dnum";
import type { Candle } from "../types/index.js";

export class CandlestickPatterns {
	#prevCandle: Candle;
	public pattern?: string;

	update(candle: Candle) {
		if (this.#prevCandle) {
			const op = candle.open;
			const cl = candle.close;
			const op0 = this.#prevCandle.open;
			const cl0 = this.#prevCandle.close;
			const body = dn.abs(dn.sub(cl, op));
			// const body0 = dn.abs(dn.sub(cl0, op0));
			// Bullish Engulfing
			if (
				dn.greaterThan(cl, op) &&
				dn.lessThan(cl0, op0) &&
				dn.greaterThan(cl, op0) &&
				dn.lessThan(op, cl0)
			) {
				this.pattern = "Bullish Engulfing";
			}
			// Bearish Engulfing
			else if (
				dn.lessThan(cl, op) &&
				dn.greaterThan(cl0, op0) &&
				dn.greaterThan(op, cl0) &&
				dn.lessThan(cl, op0)
			) {
				this.pattern = "Bearish Engulfing";
			}
			// Doji (body sangat kecil)
			else if (
				dn.lessThan(body, dn.mul(dn.sub(candle.high, candle.low), 0.1))
			) {
				this.pattern = "Doji";
			} else {
				this.pattern = undefined;
			}
		}
		this.#prevCandle = candle;
	}
}
