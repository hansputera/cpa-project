import type { Dnum } from "dnum";

export type CrossType = "golden" | "death";
export type Candle = {
	open: Dnum;
	high: Dnum;
	low: Dnum;
	close: Dnum;
	volume: Dnum;
};
