export const toFloatPrecise = (n: string, p: number) => {
	const value = Number.parseFloat(n);
	const pr = 10 ** p;

	return Math.round(value * pr) / pr;
};
