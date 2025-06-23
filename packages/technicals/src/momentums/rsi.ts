import * as dn from "dnum";
import type { Candle } from "../types/index.js";

/**
 * RSI Indicator (Relative Strength Index)
 * Formula: RSI = 100 * AvgGain/(AvgGain+AvgLoss):contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}.
 */
export class RSI {
	#period: number;
	#prevAvgGain: dn.Dnum;
	#prevAvgLoss: dn.Dnum;
	#prevCloseNum: dn.Dnum;
	#prevClose: dn.Dnum;
	#sumGain: dn.Dnum;
	#sumLoss: dn.Dnum;
	#count: number;
	public value: dn.Dnum;

	constructor(period: number) {
		this.#period = period;
		this.#prevAvgGain = dn.from(0, 0);
		this.#prevAvgLoss = dn.from(0, 0);
		this.#sumGain = dn.from(0, 0);
		this.#sumLoss = dn.from(0, 0);
		this.#count = 0;
		this.value = dn.from(0, 0);
	}

	update(candle: Candle) {
		const close = dn.from(candle.close, 8); // presisi 8 desimal
		// Tahap inisialisasi untuk periode pertama
		if (this.#count < this.#period) {
			if (this.#count === 0) {
				// Bar pertama: tidak ada perhitungan, hanya simpan harga
				this.#prevCloseNum = candle.close;
				this.#prevClose = close;
				this.#count++;
				return;
			}
			// Hitung diff, gain/loss
			const diff = dn.sub(candle.close, this.#prevCloseNum);
			const gain = dn.greaterThan(diff, 0) ? diff : 0;
			const loss = dn.lessThan(diff, 0) ? diff : 0;

			// Akumulasi gain/loss awal
			this.#sumGain = dn.add(this.#sumGain, dn.from(gain, 8));
			this.#sumLoss = dn.sub(this.#sumLoss, dn.from(loss, 8));
			this.#prevCloseNum = candle.close;
			this.#prevClose = close;
			this.#count++;
			// Setelah cukup periode, hitung RSI pertama
			if (this.#count === this.#period) {
				this.#prevAvgGain = dn.divide(this.#sumGain, this.#period);
				this.#prevAvgLoss = dn.divide(this.#sumLoss, this.#period);
				// RSI = 100 * AvgGain/(AvgGain+AvgLoss)
				if (this.#prevAvgLoss[0] === 0n) {
					this.value = dn.from(100, 0);
				} else {
					const rs = dn.divide(this.#prevAvgGain, this.#prevAvgLoss);
					this.value = dn.divide(
						dn.multiply(dn.from(100, 0), rs),
						dn.add(dn.from(1, 0), rs),
					);
				}
			}
			return;
		}
		// Wilder smoothing setelah periode pertama
		const diff = dn.sub(candle.close, this.#prevCloseNum);
		const gain = dn.greaterThan(diff, 0) ? diff : 0;
		const loss = dn.lessThan(diff, 0) ? diff : 0;
		const gainD = dn.from(gain, 8);
		const lossD = dn.from(loss, 8);

		// Update rata-rata Wilder: (prev*(n-1) + current)/n
		this.#prevAvgGain = dn.divide(
			dn.add(dn.multiply(this.#prevAvgGain, this.#period - 1), gainD),
			this.#period,
		);
		this.#prevAvgLoss = dn.divide(
			dn.sub(dn.multiply(this.#prevAvgLoss, this.#period - 1), lossD),
			this.#period,
		);
		this.#prevCloseNum = candle.close;
		this.#prevClose = close;

		// Hitung RSI saat ini
		if (this.#prevAvgLoss[0] === 0n) {
			this.value = dn.from(100, 0);
		} else {
			const rs = dn.divide(this.#prevAvgGain, this.#prevAvgLoss);
			this.value = dn.divide(
				dn.multiply(dn.from(100, 0), rs),
				dn.add(dn.from(1, 0), rs),
			);
		}
	}
}
