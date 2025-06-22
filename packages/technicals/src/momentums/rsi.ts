import * as dnum from "dnum";

export class RSI {
	protected averageGain = dnum.from(0);
	protected averageLoss = dnum.from(0);
	protected prevClose = dnum.from(0);
	#initialized = false;

	constructor(
		protected closePrices: dnum.Dnum[],
		protected candles = 14,
	) {
		if (!this.#initialized) {
			this.#init();
		}
	}

	#init(): void {
		if (this.closePrices.length < this.candles + 1) {
			throw new Error(`Need ${this.candles + 1} candles to init`);
		}

		const summaries = {
			gain: dnum.from(0),
			loss: dnum.from(0),
		};

		for (let i = 0; i <= this.candles; i++) {
			const delta = dnum.sub(this.closePrices[i], this.closePrices[i - 1]);
			if (dnum.greaterThan(delta, 0)) {
				summaries.gain = dnum.add(summaries.gain, delta);
			} else {
				summaries.loss = dnum.sub(summaries.loss, delta);
			}
		}

		this.averageGain = dnum.divide(summaries.gain, this.candles);
		this.averageLoss = dnum.divide(summaries.loss, this.candles);
		this.prevClose = this.closePrices[this.closePrices.length - 1];
		this.#initialized = true;
	}

	public update(newClose: dnum.Dnum): dnum.Dnum | undefined {
		if (!this.#initialized) {
			return undefined;
		}

		const delta = dnum.sub(newClose, this.prevClose);
		const isGain = dnum.greaterThan(delta, 0);
		const isLoss = dnum.lessThan(delta, 0);

		this.averageGain = dnum.divide(
			dnum.add(
				dnum.multiply(this.averageGain, this.candles - 1),
				isGain ? delta : 0,
			),
			this.candles,
		);

		this.averageLoss = dnum.divide(
			dnum.subtract(
				dnum.multiply(this.averageLoss, this.candles - 1),
				isLoss ? delta : 0,
			),
			this.candles,
		);

		this.prevClose = newClose;

		if (dnum.eq(this.averageLoss, 0)) {
			return dnum.from(100);
		}

		if (dnum.eq(this.averageGain, 0)) {
			return dnum.from(0);
		}

		const rs = dnum.div(this.averageGain, this.averageLoss);
		const rsi = dnum.sub(100, dnum.divide(100, dnum.add(1, rs)));
		return rsi;
	}
}
