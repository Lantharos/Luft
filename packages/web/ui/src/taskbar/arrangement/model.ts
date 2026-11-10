export type Edge = 'bottom' | 'left' | 'top' | 'right';
export type Along = 'start' | 'center' | 'end';
export type Spot = `${Edge}-${Along}`;

export interface Island {
	spot: Spot;
	elements: string[];
}

export type Arrangement = Island[];

export type StoredArrangement = [string, string[]][];

export const EDGES: Edge[] = ['bottom', 'left', 'top', 'right'];
export const ALONGS: Along[] = ['start', 'center', 'end'];
export const SPOTS: Spot[] = EDGES.flatMap((edge) => ALONGS.map((along) => spotAt(edge, along)));

export const SYSTEM_ELEMENTS = ['tray', 'status', 'clock'];
export const BUILT_IN_ELEMENTS = ['start', 'dock', ...SYSTEM_ELEMENTS];

export const DEFAULT_ARRANGEMENT: Arrangement = [
	{ spot: 'bottom-center', elements: ['start', 'dock'] },
	{ spot: 'bottom-end', elements: [...SYSTEM_ELEMENTS] }
];

export function spotAt(edge: Edge, along: Along): Spot {
	return `${edge}-${along}`;
}

export function edgeOf(spot: Spot): Edge {
	return spot.slice(0, spot.indexOf('-')) as Edge;
}

export function alongOf(spot: Spot): Along {
	return spot.slice(spot.indexOf('-') + 1) as Along;
}

export const isVerticalEdge = (edge: Edge) => edge === 'left' || edge === 'right';

const isSpot = (spot: string): spot is Spot => (SPOTS as string[]).includes(spot);

export function islandAt(arrangement: Arrangement, spot: Spot): Island | null {
	return arrangement.find((island) => island.spot === spot) ?? null;
}

export function islandOf(arrangement: Arrangement, element: string): Island | null {
	return arrangement.find((island) => island.elements.includes(element)) ?? null;
}

export function mainEdge(arrangement: Arrangement): Edge {
	const island = islandOf(arrangement, 'dock') ?? arrangement[0];
	return island ? edgeOf(island.spot) : 'bottom';
}

export function sameArrangement(a: Arrangement, b: Arrangement): boolean {
	return JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
}

const sorted = (arrangement: Arrangement) => [...arrangement].sort((a, b) => SPOTS.indexOf(a.spot) - SPOTS.indexOf(b.spot));

export function parseArrangement(stored: StoredArrangement): Arrangement {
	const placed = new Set<string>();
	const islands = new Map<Spot, string[]>();
	for (const [spot, elements] of stored) {
		if (!isSpot(spot)) continue;
		const island = islands.get(spot) ?? [];
		for (const element of elements) {
			if (placed.has(element)) continue;
			placed.add(element);
			island.push(element);
		}
		islands.set(spot, island);
	}
	return [...islands].filter(([, elements]) => elements.length).map(([spot, elements]) => ({ spot, elements }));
}

export function storeArrangement(arrangement: Arrangement): StoredArrangement {
	return sorted(arrangement).map(({ spot, elements }) => [spot, [...elements]]);
}

const HOMES: Record<string, { beside: string[]; after: boolean }> = {
	start: { beside: ['dock'], after: false },
	dock: { beside: ['start'], after: true },
	tray: { beside: ['status', 'clock'], after: false },
	status: { beside: ['tray', 'clock'], after: true },
	clock: { beside: ['status', 'tray'], after: true }
};
const EXTENSION_HOME = { beside: SYSTEM_ELEMENTS, after: false };

function firstFreeSpot(arrangement: Arrangement, preferred: Spot): Spot {
	const edge = mainEdge(arrangement);
	return [preferred, ...ALONGS.map((along) => spotAt(edge, along)), ...SPOTS].find((spot) => !islandAt(arrangement, spot))!;
}

function place(arrangement: Arrangement, element: string): Arrangement {
	const home = HOMES[element] ?? EXTENSION_HOME;
	for (const neighbour of home.beside) {
		const island = islandOf(arrangement, neighbour);
		if (!island) continue;
		const index = island.elements.indexOf(neighbour) + (home.after ? 1 : 0);
		return arrangement.map((other) => (other === island ? { ...island, elements: island.elements.toSpliced(index, 0, element) } : other));
	}
	const preferred = DEFAULT_ARRANGEMENT.find((island) => island.elements.includes(element))?.spot ?? 'bottom-end';
	return [...arrangement, { spot: firstFreeSpot(arrangement, preferred), elements: [element] }];
}

export function completeArrangement(arrangement: Arrangement, elements: string[]): Arrangement {
	return elements.reduce((complete, element) => (islandOf(complete, element) ? complete : place(complete, element)), arrangement);
}

export function presentIn(arrangement: Arrangement, present: (element: string) => boolean): Arrangement {
	return arrangement
		.map((island) => ({ ...island, elements: island.elements.filter(present) }))
		.filter((island) => island.elements.length);
}

export function joinedGroups(arrangement: Arrangement, edge: Edge): Record<Along, string[]> {
	const order = [edge, ...EDGES.filter((other) => other !== edge)];
	const islands = [...arrangement].sort((a, b) => order.indexOf(edgeOf(a.spot)) - order.indexOf(edgeOf(b.spot)));
	const groups: Record<Along, string[]> = { start: [], center: [], end: [] };
	for (const island of islands) groups[alongOf(island.spot)].push(...island.elements);
	return groups;
}
