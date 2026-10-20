import type { MarkFills } from './mark';

export type TaskbarLook = 'glass' | 'solid' | 'transparent' | 'accent';

export interface Shadow {
	x: number;
	y: number;
	blur: number;
	spread: number;
	color: string;
}

export interface GlassShading {
	dim: number;
	lift: number;
	saturation: number;
}

export interface TaskbarHalos {
	icon: Shadow | null;
	text: Shadow | null;
	dot: Shadow | null;
}

export interface TaskbarLookPaint {
	surface: string;
	glass: GlassShading | null;
	ink: string;
	mark: MarkFills;
	focused: string;
	dot: string;
	focusedDot: string;
	iconHalo: Shadow | null;
	status: TaskbarHalos;
}

export type TaskbarLooks = Record<TaskbarLook, TaskbarLookPaint>;
