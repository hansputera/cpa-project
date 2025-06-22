import * as dnum from "dnum";
import type { CrossType } from "../types/index.js";

export class EMA {
	protected alpha: number;
	protected currentEma: dnum.Dnum;

	constructor(
		protected value: number,
		protected closePrices: dnum.Dnum[],
	) {
		this.alpha = 2 / (value + 1);
		this.#init();
	}

	#init(): void {
		if (this.closePrices.length < this.value) {
			throw new Error(
				`need ${this.value} close prices for this EMA(${this.value})`,
			);
		}

		const summary = this.closePrices
			.slice(0, this.value)
			.reduce((a, b) => dnum.add(a, b), dnum.from(0));
		this.currentEma = dnum.divide(summary, this.value);
	}

	public get emaValue() {
		return this.currentEma;
	}

	public update(newClose: dnum.Dnum): dnum.Dnum {
		if (!this.currentEma) {
			this.currentEma = dnum.from(newClose);
		} else {
			this.currentEma = dnum.add(
				dnum.multiply(newClose, this.alpha),
				dnum.multiply(this.currentEma, 1 - this.alpha),
			);
		}

		return this.currentEma;
	}
}

/**
 * @class EmaCrossDetector
 */
export class EmaCrossDetector {
	/**
	 * @constructor
	 * @param shortEma Shortest EMA period
	 * @param longEma Longest EMA Period
	 */
	constructor(
		protected readonly shortEma: EMA,
		protected readonly longEma: EMA,
	) {}
	
	/**
	 * Get current cross EMA (automatically update short & long EMA data)
	 * @param newClose New close price
	 * @return {CrossType | undefined}
	 */
	update(newClose: dnum.Dnum): CrossType | undefined {
		const prevShort = this.shortEma.emaValue;
		const prevLong = this.longEma.emaValue;

		const currentShort = this.shortEma.update(newClose);
		const currentLong = this.longEma.update(newClose);

		const result = this.#detect(prevShort, prevLong, currentShort, currentLong);
		return result;
	}

	#detect(
		previousShort: dnum.Dnum,
		previousLong: dnum.Dnum,
		currentShort: dnum.Dnum,
		currentLong: dnum.Dnum,
	): CrossType | undefined {
		if (
			dnum.lessThan(previousShort, previousLong) &&
			dnum.greaterThan(currentShort, currentLong)
		) {
			return "golden";
		}

		if (
			dnum.greaterThan(previousShort, previousLong) &&
			dnum.lessThan(currentShort, currentLong)
		) {
			return "death";
		}

		return undefined;
	}
}
