export function binaryBytes(value: number) {
	const gibibytes = value / 1024 ** 3;
	return `${Math.round(gibibytes)} GB`;
}

export const percent = (value: number) => `${Math.round(value * 100)}%`;
