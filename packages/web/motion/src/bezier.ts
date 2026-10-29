export function cubicBezier([x1, y1, x2, y2]: readonly number[]) {
	const curve = (a: number, b: number) => (t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
	const x = curve(x1, x2);
	const y = curve(y1, y2);
	const dx = (t: number) => 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * (1 - t) * t + 3 * (1 - x2) * t ** 2;
	return (progress: number) => {
		if (progress <= 0 || progress >= 1) return progress;
		let t = progress;
		for (let step = 0; step < 8; step++) {
			const error = x(t) - progress;
			const rate = dx(t);
			if (Math.abs(error) < 1e-5 || rate < 1e-6) break;
			t -= error / rate;
		}
		return y(Math.min(1, Math.max(0, t)));
	};
}
