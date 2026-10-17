export interface SpringToken {
	duration: number;
	bounce: number;
}

export interface SpringState {
	offset: number;
	velocity: number;
}

const LONGEST_SETTLE = 10;
const SETTLE_STEP = 1 / 240;
const FRAME = 1 / 60;

const dampingRatio = (bounce: number) => (bounce >= 0 ? 1 - bounce : 1 / (1 + bounce));

export class DampedSpring {
	private readonly omega: number;
	private readonly zeta: number;

	constructor(
		token: SpringToken,
		private readonly start: SpringState
	) {
		this.omega = (2 * Math.PI) / (token.duration / 1000);
		this.zeta = dampingRatio(token.bounce);
	}

	at(seconds: number): SpringState {
		const { omega, zeta } = this;
		const { offset: a, velocity: v0 } = this.start;
		if (zeta < 1 - 1e-6) {
			const damped = omega * Math.sqrt(1 - zeta * zeta);
			const b = (v0 + zeta * omega * a) / damped;
			const decay = Math.exp(-zeta * omega * seconds);
			const cos = Math.cos(damped * seconds);
			const sin = Math.sin(damped * seconds);
			return {
				offset: decay * (a * cos + b * sin),
				velocity: decay * ((b * damped - zeta * omega * a) * cos - (a * damped + zeta * omega * b) * sin)
			};
		}
		if (zeta - 1 < 1e-6) {
			const b = v0 + omega * a;
			const decay = Math.exp(-omega * seconds);
			return { offset: (a + b * seconds) * decay, velocity: (b - omega * (a + b * seconds)) * decay };
		}
		const root = omega * Math.sqrt(zeta * zeta - 1);
		const r1 = -zeta * omega + root;
		const r2 = -zeta * omega - root;
		const c2 = (v0 - r1 * a) / (r2 - r1);
		const c1 = a - c2;
		return {
			offset: c1 * Math.exp(r1 * seconds) + c2 * Math.exp(r2 * seconds),
			velocity: c1 * r1 * Math.exp(r1 * seconds) + c2 * r2 * Math.exp(r2 * seconds)
		};
	}

	settleTime(epsilon: number): number {
		for (let t = 0; t < LONGEST_SETTLE; t += SETTLE_STEP) if (this.rests(t, epsilon)) return t;
		return LONGEST_SETTLE;
	}

	private rests(seconds: number, epsilon: number): boolean {
		const { offset, velocity } = this.at(seconds);
		if (Math.abs(velocity) * FRAME > 2 * epsilon) return false;
		if (this.zeta < 1 - 1e-6) {
			const damped = this.omega * Math.sqrt(1 - this.zeta * this.zeta);
			const b = (this.start.velocity + this.zeta * this.omega * this.start.offset) / damped;
			return Math.exp(-this.zeta * this.omega * seconds) * Math.hypot(this.start.offset, b) < epsilon;
		}
		return Math.abs(offset) < epsilon;
	}
}
