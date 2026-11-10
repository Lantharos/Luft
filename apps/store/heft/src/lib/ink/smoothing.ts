const DERIVATIVE_CUTOFF = 1;

const alpha = (cutoff: number, elapsed: number) => {
	const tau = 1 / (2 * Math.PI * cutoff);
	return 1 / (1 + tau / elapsed);
};

class OneEuro {
	private value = 0;
	private speed = 0;
	private started = false;

	constructor(
		private readonly minCutoff: number,
		private readonly beta: number
	) {}

	next(value: number, elapsed: number): number {
		if (!this.started) {
			this.started = true;
			this.value = value;
			return value;
		}
		const rawSpeed = (value - this.value) / elapsed;
		this.speed += alpha(DERIVATIVE_CUTOFF, elapsed) * (rawSpeed - this.speed);
		const cutoff = this.minCutoff + this.beta * Math.abs(this.speed);
		this.value += alpha(cutoff, elapsed) * (value - this.value);
		return this.value;
	}
}

export class Stabilizer {
	private readonly x: OneEuro;
	private readonly y: OneEuro;
	private pressure = -1;
	private last = 0;

	constructor(strength: number) {
		const minCutoff = 30 * (1 - strength) ** 2 + 0.6;
		const beta = 0.35 * (1 - strength) + 0.012;
		this.x = new OneEuro(minCutoff, beta);
		this.y = new OneEuro(minCutoff, beta);
	}

	next(x: number, y: number, pressure: number, time: number): [number, number, number] {
		const elapsed = Math.max((time - this.last) / 1000, 1 / 1000);
		this.last = time;
		this.pressure = this.pressure < 0 ? pressure : this.pressure + 0.5 * (pressure - this.pressure);
		return [this.x.next(x, elapsed), this.y.next(y, elapsed), this.pressure];
	}
}
