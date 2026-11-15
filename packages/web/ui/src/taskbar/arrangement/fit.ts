export interface FitPart {
	id: string;
	length: number;
	least?: number;
	rank?: number;
}

export interface FitIsland {
	chrome: number;
	spacing: number;
	parts: FitPart[];
}

export interface Fitted {
	lengths: number[];
	room: Map<string, number>;
	dropped: string[];
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function fitAlong(islands: FitIsland[], span: number, gap: number): Fitted {
	const lengths = new Map(islands.flatMap(({ parts }) => parts.map(({ id, length, least }) => [id, least ?? length] as const)));
	const dropped = new Set<string>();
	const islandLength = ({ chrome, spacing, parts }: FitIsland) => {
		const kept = parts.filter(({ id }) => !dropped.has(id));
		return kept.length ? chrome + sum(kept.map(({ id }) => lengths.get(id)!)) + spacing * (kept.length - 1) : 0;
	};
	const total = () => {
		const shown = islands.map(islandLength).filter((length) => length > 0);
		return sum(shown) + gap * Math.max(0, shown.length - 1);
	};
	const droppable = islands
		.flatMap(({ parts }) => parts)
		.filter((part) => part.rank !== undefined)
		.reverse()
		.sort((a, b) => a.rank! - b.rank!);
	for (const part of droppable) {
		if (total() <= span) break;
		dropped.add(part.id);
	}
	const room = new Map<string, number>();
	for (const { id, length, least } of islands.flatMap(({ parts }) => parts)) {
		if (least === undefined) continue;
		const slack = span - total();
		room.set(id, least + slack);
		lengths.set(id, Math.max(least, Math.min(length, least + slack)));
	}
	const fitted = islands.map(islandLength);
	let over = total() - span;
	const yields = (index: number) => islands[index].parts.some(({ least }) => least !== undefined);
	const squeezed = [...fitted.keys()].reverse().sort((a, b) => Number(yields(b)) - Number(yields(a)));
	for (const index of squeezed) {
		if (over <= 0) break;
		const taken = Math.min(fitted[index], over);
		fitted[index] -= taken;
		over -= taken;
	}
	return { lengths: fitted, room, dropped: [...dropped] };
}
