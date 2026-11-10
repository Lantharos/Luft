import { spotToward, type IslandBox } from './geometry';
import {
	ALONGS,
	alongOf,
	completeArrangement,
	DEFAULT_ARRANGEMENT,
	edgeOf,
	islandAt,
	islandOf,
	isVerticalEdge,
	joinedGroups,
	mainEdge,
	sameArrangement,
	spotAt,
	SYSTEM_ELEMENTS,
	type Arrangement,
	type Edge,
	type Spot
} from './model';

export function moveIsland(arrangement: Arrangement, from: Spot, to: Spot): Arrangement {
	if (from === to || !islandAt(arrangement, from)) return arrangement;
	return arrangement.map((island) => {
		if (island.spot === from) return { ...island, spot: to };
		if (island.spot === to) return { ...island, spot: from };
		return island;
	});
}

export function moveElement(arrangement: Arrangement, element: string, spot: Spot, index = Infinity): Arrangement {
	if (!islandOf(arrangement, element)) return arrangement;
	const without = arrangement
		.map((island) => ({ ...island, elements: island.elements.filter((other) => other !== element) }))
		.filter((island) => island.elements.length);
	const target = islandAt(without, spot);
	if (!target) return [...without, { spot, elements: [element] }];
	const at = Math.max(0, Math.min(index, target.elements.length));
	return without.map((island) => (island === target ? { ...island, elements: island.elements.toSpliced(at, 0, element) } : island));
}

export function moveBar(arrangement: Arrangement, edge: Edge): Arrangement {
	const groups = joinedGroups(arrangement, mainEdge(arrangement));
	return ALONGS.filter((along) => groups[along].length).map((along) => ({ spot: spotAt(edge, along), elements: groups[along] }));
}

export function islandTo(arrangement: Arrangement, from: Spot, spot: Spot, joined: boolean): Arrangement {
	if (!joined || edgeOf(spot) === edgeOf(from)) return moveIsland(arrangement, from, spot);
	return moveIsland(moveBar(arrangement, edgeOf(spot)), spotAt(edgeOf(spot), alongOf(from)), spot);
}

export function elementTo(arrangement: Arrangement, element: string, spot: Spot, index: number, joined: boolean): Arrangement {
	return moveElement(arrangement, element, joined ? spotAt(mainEdge(arrangement), alongOf(spot)) : spot, index);
}

export type Direction = [number, number];

export function stepIsland(arrangement: Arrangement, spot: Spot, direction: Direction, targets: IslandBox[], joined: boolean): Arrangement {
	const to = spotToward(targets, spot, direction);
	return to ? islandTo(arrangement, spot, to, joined) : arrangement;
}

export function stepElement(
	arrangement: Arrangement,
	element: string,
	[dx, dy]: Direction,
	targets: IslandBox[],
	joined: boolean,
	rightToLeft: boolean
): Arrangement {
	const island = islandOf(arrangement, element);
	if (!island) return arrangement;
	const vertical = isVerticalEdge(edgeOf(island.spot));
	const along = vertical ? dy : dx * (rightToLeft ? -1 : 1);
	const index = island.elements.indexOf(element);
	const across = vertical ? dx : dy;
	if (!across && index + along >= 0 && index + along < island.elements.length)
		return elementTo(arrangement, element, island.spot, index + along, joined);
	const to = spotToward(targets, island.spot, [dx, dy]);
	return to ? elementTo(arrangement, element, to, along < 0 ? Infinity : 0, joined) : arrangement;
}

export type PresetName = 'classic' | 'centered' | 'mac' | 'side';

export interface Preset {
	arrangement: Arrangement;
	style: 'bar' | 'separate' | null;
}

export const PRESETS: Record<PresetName, Preset> = {
	classic: {
		arrangement: [
			{ spot: 'bottom-start', elements: ['start', 'dock'] },
			{ spot: 'bottom-end', elements: [...SYSTEM_ELEMENTS] }
		],
		style: 'bar'
	},
	centered: { arrangement: DEFAULT_ARRANGEMENT, style: null },
	mac: {
		arrangement: [
			{ spot: 'bottom-center', elements: ['start', 'dock'] },
			{ spot: 'top-end', elements: [...SYSTEM_ELEMENTS] }
		],
		style: 'separate'
	},
	side: {
		arrangement: [
			{ spot: 'left-center', elements: ['start', 'dock'] },
			{ spot: 'bottom-end', elements: [...SYSTEM_ELEMENTS] }
		],
		style: 'separate'
	}
};

export function presetArrangement(name: PresetName, current: Arrangement): Arrangement {
	return completeArrangement(PRESETS[name].arrangement, current.flatMap((island) => island.elements));
}

export type ElementPlace = 'before-apps' | 'after-apps' | 'beside-tray' | 'start' | 'end';

export const ELEMENT_PLACES: ElementPlace[] = ['before-apps', 'after-apps', 'beside-tray', 'start', 'end'];

const APPS = ['start', 'dock'];

export function placeElement(arrangement: Arrangement, element: string, place: ElementPlace): Arrangement {
	const others = arrangement
		.map((island) => ({ ...island, elements: island.elements.filter((other) => other !== element) }))
		.filter((island) => island.elements.length);
	const edge = mainEdge(others);
	const beside = (neighbours: string[], after: boolean): [Spot, number] | null => {
		const island = others.find(({ elements }) => neighbours.some((neighbour) => elements.includes(neighbour)));
		if (!island) return null;
		const indices = neighbours.map((neighbour) => island.elements.indexOf(neighbour)).filter((index) => index >= 0);
		return [island.spot, after ? Math.max(...indices) + 1 : Math.min(...indices)];
	};
	const target: [Spot, number] | null =
		place === 'before-apps' ? beside(APPS, false)
		: place === 'after-apps' ? beside(['dock'], true)
		: place === 'beside-tray' ? beside(['tray'], false)
		: place === 'start' ? [spotAt(edge, 'start'), 0]
		: [spotAt(edge, 'end'), Infinity];
	return target ? moveElement(arrangement, element, ...target) : arrangement;
}

export function placeOf(arrangement: Arrangement, element: string): ElementPlace | null {
	return ELEMENT_PLACES.find((place) => sameArrangement(placeElement(arrangement, element, place), arrangement)) ?? null;
}
