import Crop from '@luft/symbols/icons/crop';
import Eraser from '@luft/symbols/icons/eraser';
import Lasso from '@luft/symbols/icons/lasso';
import Move from '@luft/symbols/icons/move';
import PaintBucket from '@luft/symbols/icons/paint-bucket';
import Paintbrush from '@luft/symbols/icons/paintbrush';
import Pipette from '@luft/symbols/icons/pipette';
import Shapes from '@luft/symbols/icons/shapes';
import SquareDashed from '@luft/symbols/icons/square-dashed';
import Type from '@luft/symbols/icons/type';
import WandSparkles from '@luft/symbols/icons/wand-sparkles';
import Bandage from '@luft/symbols/icons/bandage';
import Blend from '@luft/symbols/icons/blend';
import Smudge from '@luft/symbols/icons/smudge';
import Stamp from '@luft/symbols/icons/stamp';
import type { Component } from 'svelte';
import type { ToolId } from './settings.svelte';

export interface ToolEntry {
	id: ToolId;
	icon: Component;
	key: string;
}

export const TOOLS: ToolEntry[] = [
	{ id: 'move', icon: Move, key: 'v' },
	{ id: 'select', icon: SquareDashed, key: 'm' },
	{ id: 'lasso', icon: Lasso, key: 'l' },
	{ id: 'wand', icon: WandSparkles, key: 'w' },
	{ id: 'brush', icon: Paintbrush, key: 'b' },
	{ id: 'eraser', icon: Eraser, key: 'e' },
	{ id: 'clone', icon: Stamp, key: 's' },
	{ id: 'heal', icon: Bandage, key: 'j' },
	{ id: 'smudge', icon: Smudge, key: 'r' },
	{ id: 'fill', icon: PaintBucket, key: 'g' },
	{ id: 'gradient', icon: Blend, key: 'd' },
	{ id: 'text', icon: Type, key: 't' },
	{ id: 'shapes', icon: Shapes, key: 'u' },
	{ id: 'picker', icon: Pipette, key: 'i' },
	{ id: 'crop', icon: Crop, key: 'c' }
];
