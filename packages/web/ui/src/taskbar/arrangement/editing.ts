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

/** Moves an island to another spot, trading places with the island already there. */
export function moveIsland(arrangement: Arrangement, from: Spot, to: Spot): Arrangement {
	if (from === to || !islandAt(arrangement, from)) return arrangement;
	return arrangement.map((island) => {
		if (island.spot === from) return { ...island, spot: to };
		if (island.spot === to) return { ...island, spot: from };
		return island;
	});
}

/**
 * Moves an element into the island at `spot`, at `index` among that island's other elements, or into an island of
 * its own when the spot is free.
 */
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

/** Moves a taskbar joined into one bar to another edge, keeping where each island sits along it. */
export function moveBar(arrangement: Arrangement, edge: Edge): Arrangement {
	const groups = joinedGroups(arrangement, mainEdge(arrangement));
	return ALONGS.filter((along) => groups[along].length).map((along) => ({ spot: spotAt(edge, along), elements: groups[along] }));
}

/** Where an island dropped at `spot` goes; on a joined bar, a spot on another edge moves the whole bar there. */
export function islandTo(arrangement: Arrangement, from: Spot, spot: Spot, joined: boolean): Arrangement {
	if (!joined || edgeOf(spot) === edgeOf(from)) return moveIsland(arrangement, from, spot);
	return moveIsland(moveBar(arrangement, edgeOf(spot)), spotAt(edgeOf(spot), alongOf(from)), spot);
}

/** Where an element dropped at `spot` goes; on a joined bar, it stays on the bar's edge at the same place along it. */
export function elementTo(arrangement: Arrangement, element: string, spot: Spot, index: number, joined: boolean): Arrangement {
	return moveElement(arrangement, element, joined ? spotAt(mainEdge(arrangement), alongOf(spot)) : spot, index);
}

export type Direction = [number, number];

/** Moves an island with an arrow key, to the next spot that way. */
export function stepIsland(arrangement: Arrangement, spot: Spot, direction: Direction, targets: IslandBox[], joined: boolean): Arrangement {
	const to = spotToward(targets, spot, direction);
	return to ? islandTo(arrangement, spot, to, joined) : arrangement;
}

/** Moves an element with an arrow key: along its island, or out of its end to the next spot that way. */
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
	/** The shape the preset needs, or `null` to keep the current one. */
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

/** A preset's arrangement, with the elements it doesn't name, such as extensions', next to their neighbours again. */
export function presetArrangement(name: PresetName, current: Arrangement): Arrangement {
	return completeArrangement(PRESETS[name].arrangement, current.flatMap((island) => island.elements));
}

/** The taskbar people had chosen with an edge and an alignment, before islands could go anywhere. */
export function fromEdgeAndAlignment(edge: Edge, alignment: 'center' | 'left'): Arrangement {
	return [
		{ spot: `${edge}-${alignment === 'left' ? 'start' : 'center'}`, elements: ['start', 'dock'] },
		{ spot: `${edge}-end`, elements: [...SYSTEM_ELEMENTS] }
	];
}

/** Where an element can sit on a taskbar that's one bar, for choosing from a list instead of dragging. */
export type ElementPlace = 'before-apps' | 'after-apps' | 'beside-tray' | 'start' | 'end';

export const ELEMENT_PLACES: ElementPlace[] = ['before-apps', 'after-apps', 'beside-tray', 'start', 'end'];

const APPS = ['start', 'dock'];

/** Moves an element to a place along the bar: next to the apps or the tray, or at the start or end of the dock's edge. */
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

/** The place an element sits at along the bar, if it's one of the places `placeElement` puts it. */
export function placeOf(arrangement: Arrangement, element: string): ElementPlace | null {
	return ELEMENT_PLACES.find((place) => sameArrangement(placeElement(arrangement, element, place), arrangement)) ?? null;
}
