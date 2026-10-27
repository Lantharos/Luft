import type { Component } from 'svelte';
import Briefcase from '@lucide/svelte/icons/briefcase';
import Clapperboard from '@lucide/svelte/icons/clapperboard';
import Code from '@lucide/svelte/icons/code';
import FlaskConical from '@lucide/svelte/icons/flask-conical';
import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
import Globe from '@lucide/svelte/icons/globe';
import GraduationCap from '@lucide/svelte/icons/graduation-cap';
import PenTool from '@lucide/svelte/icons/pen-tool';
import Settings2 from '@lucide/svelte/icons/settings-2';
import Wrench from '@lucide/svelte/icons/wrench';

export type CategoryId = 'office' | 'graphics' | 'audiovideo' | 'game' | 'development' | 'education' | 'science' | 'network' | 'utility' | 'system';

export interface Category {
	id: CategoryId;
	title: string;
	icon: Component;
}

export const CATEGORIES: Category[] = [
	{ id: 'office', title: 'Productivity', icon: Briefcase },
	{ id: 'graphics', title: 'Graphics & Photos', icon: PenTool },
	{ id: 'audiovideo', title: 'Audio & Video', icon: Clapperboard },
	{ id: 'game', title: 'Games', icon: Gamepad2 },
	{ id: 'development', title: 'Developer Tools', icon: Code },
	{ id: 'education', title: 'Education', icon: GraduationCap },
	{ id: 'science', title: 'Science', icon: FlaskConical },
	{ id: 'network', title: 'Internet', icon: Globe },
	{ id: 'utility', title: 'Utilities', icon: Wrench },
	{ id: 'system', title: 'System', icon: Settings2 }
];

export const category = (id: CategoryId) => CATEGORIES.find((entry) => entry.id === id)!;
